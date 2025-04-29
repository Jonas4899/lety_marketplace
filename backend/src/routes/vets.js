import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { uploadFile } from "../utils.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Guardar temporalmente en la carpeta local /uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Obtener la extensión del archivo
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Crear un nombre único
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Registro de clínica veterinaria
router.post(
  "/register/veterinary",
  upload.single("certificadoSalud"),
  async (req, res) => {
    try {
      console.log("Recibiendo solicitud de registro de veterinaria");

      const {
        nombre,
        direccion,
        telefono,
        correo,
        contrasena,
        descripcion,
        NIT,
        servicios: serviciosString,
      } = req.body;

      console.log("Datos recibidos:", {
        nombre,
        direccion,
        telefono,
        correo,
        contrasenaRecibida: !!contrasena,
        descripcion,
        NIT,
        serviciosRecibidos: !!serviciosString,
      });

      // Validación de campos vacios
      if (
        !nombre ||
        !direccion ||
        !telefono ||
        !correo ||
        !contrasena ||
        !NIT
      ) {
        console.log("Campos obligatorios faltantes");
        return res.status(400).json({
          message: "Todos los campos obligatorios deben ser proporcionados.",
        });
      }

      // Parsear los servicios si existen
      let servicios = [];
      if (serviciosString) {
        try {
          servicios = JSON.parse(serviciosString);
          console.log("Servicios parseados:", servicios);
        } catch (parseError) {
          console.error("Error al parsear servicios:", parseError);
          return res.status(400).json({
            message: "Error al procesar los servicios: formato inválido",
          });
        }
      }

      // Obtener el archivo del certificado
      const certificadoFile = req.file;
      console.log(
        "Certificado file:",
        certificadoFile
          ? {
              filename: certificadoFile.filename,
              size: certificadoFile.size,
              mimetype: certificadoFile.mimetype,
            }
          : "No se recibió archivo"
      );

      // Verificar las variables de entorno de Supabase
      console.log("Variables de Supabase:", {
        urlDefinida: !!supabaseUrl,
        keyDefinida: !!supabaseServiceRolKey,
        clienteDefinido: !!supabaseClient,
      });

      // Verificar que supabaseClient esté definido
      if (!supabaseClient) {
        console.error("Error: supabaseClient no está definido");
        return res.status(500).json({
          message:
            "Error de configuración del servidor: Cliente de base de datos no disponible",
        });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      const estado = "confirmado";
      const fecha_registro = new Date();

      // Subir el archivo del certificado a Supabase
      let certificado_url = null;
      if (certificadoFile) {
        try {
          certificado_url = await uploadFile(
            certificadoFile,
            "certificados-secretaria-salud"
          );
          console.log("URL del certificado:", certificado_url);
        } catch (uploadError) {
          console.error("Error al subir el archivo:", uploadError);
          return res.status(500).json({
            message: "Error al procesar el archivo: " + uploadError.message,
          });
        }
      }

      // Insercion en la tabla clinicas
      console.log("Insertando datos en Supabase...");
      const { data: clinica, error: errorClinica } = await supabaseClient
        .from("clinicas")
        .insert([
          {
            nombre,
            direccion,
            telefono,
            correo,
            contrasena: hashedPassword,
            descripcion,
            NIT,
            estado,
            fecha_registro,
            certificado_url,
          },
        ])
        .select("id_clinica")
        .single();

      if (errorClinica) {
        console.error("Error de Supabase:", errorClinica);
        return res.status(400).json({
          message: "Error al registrar la clínica: " + errorClinica.message,
        });
      }

      console.log("Clínica registrada con éxito:", clinica);

      // Registrar servicios si existen
      let serviciosRegistrados = [];
      if (servicios && servicios.length > 0) {
        console.log(
          `Registrando ${servicios.length} servicios para la clínica ${clinica.id_clinica}`
        );

        try {
          // Filtrar servicios válidos (con nombre y precio)
          const serviciosValidos = servicios.filter(
            (servicio) => servicio.name && servicio.price
          );

          if (serviciosValidos.length > 0) {
            // Preparar servicios para inserción
            const serviciosAInsertar = serviciosValidos.map((servicio) => {
              const precioNumerico = parseFloat(servicio.price);
              return {
                id_clinica: clinica.id_clinica,
                nombre: servicio.name,
                descripcion: "",
                precio: isNaN(precioNumerico) ? 0 : precioNumerico,
                categoria: servicio.category || "general",
                disponible: true,
              };
            });

            // Insertar servicios
            const { data, error } = await supabaseClient
              .from("servicios")
              .insert(serviciosAInsertar)
              .select();

            if (error) {
              console.error("Error al registrar servicios:", error);
            } else {
              console.log(`${data.length} servicios registrados con éxito`);
              serviciosRegistrados = data;
            }
          } else {
            console.log("No hay servicios válidos para registrar");
          }
        } catch (serviciosError) {
          console.error("Error al procesar los servicios:", serviciosError);
          // No interrumpimos el flujo por un error en los servicios
        }
      }

      // Limpiar el archivo temporal
      if (certificadoFile) {
        try {
          fs.unlinkSync(certificadoFile.path);
        } catch (unlinkError) {
          console.warn("No se pudo eliminar el archivo temporal:", unlinkError);
        }
      }

      res.status(201).json({
        message: "Clínica registrada exitosamente",
        datosClinica: clinica,
        servicios: serviciosRegistrados,
      });
    } catch (error) {
      console.error("Error interno del servidor:", error);

      // Limpiar el archivo temporal en caso de error
      try {
        const certificadoFile = req.file;
        if (certificadoFile && fs.existsSync(certificadoFile.path)) {
          fs.unlinkSync(certificadoFile.path);
        }
      } catch (cleanupError) {
        console.warn("Error al limpiar archivos temporales:", cleanupError);
      }

      res.status(500).json({
        message: "Error interno del servidor: " + error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });
    }
  }
);

// Endpoint para actualizar la información basica de la clínica veterinaria
router.put("/update/veterinary/info/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const {
      nombre,
      telefono,
      NIT,
      direccion,
      ciudad,
      codigo_postal,
      correo,
      sitio_web,
      descripcion,
    } = req.body;

    const datosActualizar = {
      nombre,
      direccion,
      telefono,
      correo,
      descripcion,
      NIT,
      sitio_web,
      codigo_postal,
      ciudad,
    };

    const { data, error: errorActualizacion } = await supabaseClient
      .from("clinicas")
      .update(datosActualizar)
      .eq("id_clinica", id_clinica)
      .select();

    if (errorActualizacion) {
      return res.status(400).json({
        message: "Error al actualizar la información de la clínica",
        error: errorActualizacion.message,
      });
    }

    res
      .status(200)
      .json({
        message: "Información de la clínica actualizada exitosamente",
        data,
      });
  } catch (error) {
    console.error("Error al actualizar la información de la clínica:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Endpoint para actualizar los horarios de la clínica veterinaria
router.put("/update/veterinary/hours/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { openingHours } = req.body;

    // Verificar que la clínica existe
    const { data: clinica, error: errorClinica } = await supabaseClient
      .from("clinicas")
      .select("id_clinica")
      .eq("id_clinica", id_clinica)
      .single();

    if (errorClinica || !clinica) {
      return res.status(404).json({
        message: "Clínica no encontrada",
      });
    }

    // Primero, eliminar los horarios existentes
    const { error: errorBorrar } = await supabaseClient
      .from("horarios_atencion")
      .delete()
      .eq("id_clinica", id_clinica);

    if (errorBorrar) {
      return res.status(400).json({
        message: "Error al actualizar horarios: No se pudieron eliminar los horarios existentes",
        error: errorBorrar.message,
      });
    }

    // Preparar los nuevos horarios para inserción
    const nuevosHorarios = [];
    const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    diasSemana.forEach(dia => {
      if (openingHours[dia]) {
        nuevosHorarios.push({
          id_clinica: id_clinica,
          dia_semana: dia,
          hora_apertura: openingHours[dia].is24Hours ? "00:00:00" : openingHours[dia].open + ":00",
          hora_cierre: openingHours[dia].is24Hours ? "23:59:59" : openingHours[dia].close + ":00",
          es_24h: openingHours[dia].is24Hours,
          esta_cerrado: openingHours[dia].closed,
        });
      }
    });

    // Insertar los nuevos horarios
    if (nuevosHorarios.length > 0) {
      const { data: horariosInsertados, error: errorInsercion } = await supabaseClient
        .from("horarios_atencion")
        .insert(nuevosHorarios)
        .select();

      if (errorInsercion) {
        return res.status(400).json({
          message: "Error al insertar los nuevos horarios",
          error: errorInsercion.message,
        });
      }

      return res.status(200).json({
        message: "Horarios actualizados exitosamente",
        horarios: horariosInsertados,
      });
    } else {
      return res.status(400).json({
        message: "No se proporcionaron horarios válidos para actualizar",
      });
    }
  } catch (error) {
    console.error("Error al actualizar horarios:", error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
});

// Endpoint para actualizar los detalles adicionales de la clínica (especialidades, instalaciones, métodos de pago)
router.put("/update/veterinary/details/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { specialties, facilities, paymentMethods } = req.body;

    // Verificar que la clínica existe
    const { data: clinica, error: errorClinica } = await supabaseClient
      .from("clinicas")
      .select("id_clinica, detalles")
      .eq("id_clinica", id_clinica)
      .single();

    if (errorClinica || !clinica) {
      return res.status(404).json({
        message: "Clínica no encontrada",
      });
    }

    // Preparar los detalles para actualizar
    const detallesActualizados = {
      especialidades: specialties || [],
      instalaciones: facilities || [],
      metodos_pago: paymentMethods || [],
    };

    // Actualizar los detalles en la tabla clinicas
    const { data, error: errorActualizacion } = await supabaseClient
      .from("clinicas")
      .update({ detalles: detallesActualizados })
      .eq("id_clinica", id_clinica)
      .select();

    if (errorActualizacion) {
      return res.status(400).json({
        message: "Error al actualizar los detalles de la clínica",
        error: errorActualizacion.message,
      });
    }

    res.status(200).json({
      message: "Detalles de la clínica actualizados exitosamente",
      data,
    });
  } catch (error) {
    console.error("Error al actualizar detalles de la clínica:", error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
});

// Endpoint para obtener toda la información de la clínica (información básica, horarios y detalles)
router.get("/veterinary/profile/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;

    // Obtener información básica de la clínica
    const { data: clinica, error: errorClinica } = await supabaseClient
      .from("clinicas")
      .select("*, detalles")
      .eq("id_clinica", id_clinica)
      .single();

    if (errorClinica || !clinica) {
      return res.status(404).json({
        message: "Clínica no encontrada",
      });
    }

    // Obtener horarios de la clínica
    const { data: horarios, error: errorHorarios } = await supabaseClient
      .from("horarios_atencion")
      .select("*")
      .eq("id_clinica", id_clinica);

    if (errorHorarios) {
      return res.status(400).json({
        message: "Error al obtener horarios",
        error: errorHorarios.message,
      });
    }

    // Formatear los horarios para el frontend
    const openingHours = {
      monday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      tuesday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      wednesday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      thursday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      friday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      saturday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
      sunday: { open: "09:00", close: "18:00", closed: true, is24Hours: false },
    };

    // Actualizar con los horarios reales
    horarios.forEach(horario => {
      const dia = horario.dia_semana;
      if (openingHours[dia]) {
        openingHours[dia] = {
          open: horario.hora_apertura ? horario.hora_apertura.substring(0, 5) : "09:00",
          close: horario.hora_cierre ? horario.hora_cierre.substring(0, 5) : "18:00",
          closed: horario.esta_cerrado,
          is24Hours: horario.es_24h,
        };
      }
    });

    // Extraer y formatear los detalles
    const specialties = clinica.detalles?.especialidades || [];
    const facilities = clinica.detalles?.instalaciones || [];
    const paymentMethods = clinica.detalles?.metodos_pago || [];

    // Quitar la contraseña del objeto que se retorna
    const { contrasena, ...clinicaInfo } = clinica;

    // Construir la respuesta completa
    const perfilCompleto = {
      ...clinicaInfo,
      openingHours,
      specialties,
      facilities,
      paymentMethods,
    };

    res.status(200).json(perfilCompleto);
  } catch (error) {
    console.error("Error al obtener perfil de la clínica:", error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
});

export default router;
