import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

import uploadFile from "./utils.js";

// Configurar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

//Configurar multer para subir archivos
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

const upload = multer({ storage }); //Inicializar multer con la configuración de storage

//Endpoint para registrar usuarios dueños de las mascotas junto con su mascota ---------------------------
app.post(
  "/register/user",
  upload.fields([{ name: "foto_mascota" }, { name: "historial_medico" }]),
  async (req, res) => {
    const {
      nombre,
      correo,
      telefono,
      contrasena,
      nombremascota,
      edad,
      raza,
      especie,
    } = req.body;

    //req.files contiene los archivos subidos en un objeto con arrays de archivos
    //"foto_mascota": [ { "file1_data" } ], foto mascota es un array de archivos

    const fotoMascotaFile = req.files.foto_mascota?.[0]; // Obtener el primer archivol array
    const historialMedicoFile = req.files.historial_medico?.[0]; // Obtener el primer archivol array

    console.log("Foto mascota file:", fotoMascotaFile);
    console.log("Historial médico file:", historialMedicoFile);

    try {
      console.log("Datos recibidos:", req.body);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      //Guardar la fecha de registro
      const fecha_registro = new Date();

      //Registrar el usuario
      const { data: usuario, error: errorUsuario } = await supabaseClient
        .from("usuarios")
        .insert([
          {
            nombre,
            correo,
            contrasena: hashedPassword,
            telefono,
            fecha_registro,
          },
        ])
        .select("id_usuario")
        .single();

      if (errorUsuario) {
        return res.status(400).json({
          message: "Error al registrar el usuario:" + errorUsuario.message,
        });
      }

      console.log("Usuario registrado:", usuario);

      //Arhivos para el registro de la mascota
      const foto_mascotaUrl = await uploadFile(
        fotoMascotaFile,
        "fotos-mascotas"
      );
      const historial_medicoUrl = await uploadFile(
        historialMedicoFile,
        "historiales-mascotas"
      );

      console.log("URL de la foto:", foto_mascotaUrl);
      console.log("URL del historial:", historial_medicoUrl);

      //Registrar la mascota
      const { error: errorMascota } = await supabaseClient
        .from("mascotas")
        .insert([
          {
            nombre: nombremascota,
            edad: parseInt(edad), // Asegúrate de que sea un número
            raza,
            especie,
            historial_medico: historial_medicoUrl || null,
            foto_url: foto_mascotaUrl || null,
            id_usuario: usuario.id_usuario, // Verifica que usuario.id_usuario exista
          },
        ])
        .select("id_mascota")
        .single();

      if (errorMascota) {
        return res.status(400).json({
          message: "Error al registrar la mascota:" + errorMascota.message,
        });
      }

      if (fotoMascotaFile) fs.unlinkSync(fotoMascotaFile.path);
      if (historialMedicoFile) fs.unlinkSync(historialMedicoFile.path);

      // Enviar una respuesta con la información del usuario y mascota
      res.status(201).json({
        message: "Usuario y mascota registrados exitosamente",
        datosUsuario: usuario,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

app.post(
  "/register/veterinary",
  upload.single("certificado_ss"),
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

// Endpoint para registrar un servicio de una clínica veterinaria
app.post("/register/service", async (req, res) => {
  try {
    console.log("Recibiendo solicitud para registrar servicio");

    const { id_clinica, nombre, precio, categoria } = req.body;

    // Validación de campos requeridos
    if (!id_clinica || !nombre || !precio || !categoria) {
      return res.status(400).json({
        message:
          "Todos los campos obligatorios deben ser proporcionados (id_clinica, nombre, precio, categoria).",
      });
    }

    // Validar que el precio sea un número
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico)) {
      return res.status(400).json({
        message: "El precio debe ser un valor numérico.",
      });
    }

    // Por defecto los servicios están disponibles y descripción vacía
    const descripcion = "";
    const disponible = true;

    console.log("Insertando servicio en la base de datos...");
    const { data: servicio, error: errorServicio } = await supabaseClient
      .from("servicios")
      .insert([
        {
          id_clinica,
          nombre,
          descripcion,
          precio: precioNumerico,
          categoria,
          disponible,
        },
      ])
      .select()
      .single();

    if (errorServicio) {
      console.error("Error de Supabase:", errorServicio);
      return res.status(400).json({
        message: "Error al registrar el servicio: " + errorServicio.message,
      });
    }

    console.log("Servicio registrado con éxito:", servicio);

    res.status(201).json({
      message: "Servicio registrado exitosamente",
      servicio,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Endpoint para registrar múltiples servicios de una clínica veterinaria
app.post("/register/services", async (req, res) => {
  try {
    console.log("Recibiendo solicitud para registrar múltiples servicios");

    const { id_clinica, servicios } = req.body;

    // Validación de campos requeridos
    if (
      !id_clinica ||
      !servicios ||
      !Array.isArray(servicios) ||
      servicios.length === 0
    ) {
      return res.status(400).json({
        message:
          "Se requiere un id_clinica válido y un array de servicios no vacío.",
      });
    }

    // Preparar array para inserción múltiple
    const serviciosAInsertar = servicios.map((servicio) => {
      // Validar cada servicio
      if (!servicio.nombre || !servicio.precio || !servicio.categoria) {
        throw new Error("Cada servicio debe tener nombre, precio y categoría");
      }

      // Convertir precio a número
      const precioNumerico = parseFloat(servicio.precio);
      if (isNaN(precioNumerico)) {
        throw new Error(
          `El precio '${servicio.precio}' para el servicio '${servicio.nombre}' no es válido`
        );
      }

      return {
        id_clinica,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || "",
        precio: precioNumerico,
        categoria: servicio.categoria,
        disponible: true,
      };
    });

    console.log("Insertando servicios en la base de datos...");
    const { data: serviciosRegistrados, error: errorServicios } =
      await supabaseClient
        .from("servicios")
        .insert(serviciosAInsertar)
        .select();

    if (errorServicios) {
      console.error("Error de Supabase:", errorServicios);
      return res.status(400).json({
        message: "Error al registrar los servicios: " + errorServicios.message,
      });
    }

    console.log(
      `${serviciosRegistrados.length} servicios registrados con éxito`
    );

    res.status(201).json({
      message: `${serviciosRegistrados.length} servicios registrados exitosamente`,
      servicios: serviciosRegistrados,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
