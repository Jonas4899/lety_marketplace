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
        horarios: horariosString,
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
        horariosRecibidos: !!horariosString,
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

      // Parsear los horarios si existen
      let horarios = {};
      if (horariosString) {
        try {
          horarios = JSON.parse(horariosString);
          console.log("Horarios parseados:", horarios);
        } catch (parseError) {
          console.error("Error al parsear horarios:", parseError);
          return res.status(400).json({
            message: "Error al procesar los horarios: formato inválido",
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

      // Registrar horarios si existen
      let horariosRegistrados = [];
      if (horarios && Object.keys(horarios).length > 0) {
        console.log(
          `Registrando horarios para la clínica ${clinica.id_clinica}`
        );

        try {
          const horariosAInsertar = [];

          // Procesar cada día de la semana
          for (const [dia, horario] of Object.entries(horarios)) {
            // Verificar que es un día válido
            const diasValidos = [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ];
            if (!diasValidos.includes(dia)) {
              console.warn(`Día de la semana inválido: ${dia}, será omitido`);
              continue;
            }

            // Crear objeto horario
            let horarioData = {
              id_clinica: clinica.id_clinica,
              dia_semana: dia,
              es_24h: horario.is24Hours || false,
              esta_cerrado: horario.closed || false,
            };

            // Asignar horas según el caso
            if (horario.is24Hours) {
              horarioData.hora_apertura = "00:00:00";
              horarioData.hora_cierre = "23:59:59";
            } else if (horario.closed) {
              horarioData.hora_apertura = null;
              horarioData.hora_cierre = null;
            } else {
              horarioData.hora_apertura = horario.open;
              horarioData.hora_cierre = horario.close;
            }

            horariosAInsertar.push(horarioData);
          }

          if (horariosAInsertar.length > 0) {
            // Insertar horarios
            const { data, error } = await supabaseClient
              .from("horarios_atencion")
              .insert(horariosAInsertar)
              .select();

            if (error) {
              console.error("Error al registrar horarios:", error);
            } else {
              console.log(`${data.length} horarios registrados con éxito`);
              horariosRegistrados = data;
            }
          } else {
            console.log("No hay horarios válidos para registrar");
          }
        } catch (horariosError) {
          console.error("Error al procesar los horarios:", horariosError);
          // No interrumpimos el flujo por un error en los horarios
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
        horarios: horariosRegistrados,
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

// Endpoint para registrar un horario de atención de una clínica veterinaria
app.post("/register/schedule", async (req, res) => {
  try {
    console.log("Recibiendo solicitud para registrar horario de atención");

    const {
      id_clinica,
      dia_semana,
      hora_apertura,
      hora_cierre,
      es_24h,
      esta_cerrado,
    } = req.body;

    // Validación de campos requeridos
    if (!id_clinica || !dia_semana) {
      return res.status(400).json({
        message: "Los campos id_clinica y dia_semana son obligatorios.",
      });
    }

    // Validación de día de la semana
    const diasValidos = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    if (!diasValidos.includes(dia_semana)) {
      return res.status(400).json({
        message:
          "El día de la semana debe ser uno de los siguientes valores: " +
          diasValidos.join(", "),
      });
    }

    // Si no está cerrado ni es 24h, validar horas
    if (!esta_cerrado && !es_24h) {
      if (!hora_apertura || !hora_cierre) {
        return res.status(400).json({
          message:
            "Si el local no está cerrado y no es 24h, se requieren hora_apertura y hora_cierre.",
        });
      }
    }

    // Crear objeto de horario
    let horarioData = {
      id_clinica,
      dia_semana,
      es_24h: es_24h || false,
      esta_cerrado: esta_cerrado || false,
    };

    // Asignar horas según el caso
    if (es_24h) {
      horarioData.hora_apertura = "00:00:00";
      horarioData.hora_cierre = "23:59:59";
    } else if (esta_cerrado) {
      horarioData.hora_apertura = null;
      horarioData.hora_cierre = null;
    } else {
      horarioData.hora_apertura = hora_apertura;
      horarioData.hora_cierre = hora_cierre;
    }

    console.log("Insertando horario en la base de datos:", horarioData);

    // Insertar en la base de datos
    const { data: horario, error: errorHorario } = await supabaseClient
      .from("horarios_atencion")
      .insert([horarioData])
      .select()
      .single();

    if (errorHorario) {
      console.error("Error de Supabase:", errorHorario);
      return res.status(400).json({
        message: "Error al registrar el horario: " + errorHorario.message,
      });
    }

    console.log("Horario registrado con éxito:", horario);

    res.status(201).json({
      message: "Horario registrado exitosamente",
      horario,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Endpoint para registrar múltiples horarios de atención de una clínica veterinaria
app.post("/register/schedules", async (req, res) => {
  try {
    console.log("Recibiendo solicitud para registrar múltiples horarios");

    const { id_clinica, horarios } = req.body;

    // Validación de campos requeridos
    if (
      !id_clinica ||
      !horarios ||
      !Array.isArray(horarios) ||
      horarios.length === 0
    ) {
      return res.status(400).json({
        message:
          "Se requiere un id_clinica válido y un array de horarios no vacío.",
      });
    }

    // Preparar array para inserción múltiple
    const horariosAInsertar = [];

    // Validación de días de la semana
    const diasValidos = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Procesar cada horario
    for (const horario of horarios) {
      const { dia_semana, hora_apertura, hora_cierre, es_24h, esta_cerrado } =
        horario;

      // Validar día de la semana
      if (!dia_semana || !diasValidos.includes(dia_semana)) {
        throw new Error(
          `Día de la semana inválido: ${dia_semana}. Debe ser uno de: ${diasValidos.join(
            ", "
          )}`
        );
      }

      // Crear objeto de horario
      let horarioData = {
        id_clinica,
        dia_semana,
        es_24h: es_24h || false,
        esta_cerrado: esta_cerrado || false,
      };

      // Asignar horas según el caso
      if (es_24h) {
        horarioData.hora_apertura = "00:00:00";
        horarioData.hora_cierre = "23:59:59";
      } else if (esta_cerrado) {
        horarioData.hora_apertura = null;
        horarioData.hora_cierre = null;
      } else {
        // Validar que hay horas de apertura y cierre
        if (!hora_apertura || !hora_cierre) {
          throw new Error(
            `Para el día ${dia_semana}: Si no está cerrado y no es 24h, se requieren hora_apertura y hora_cierre.`
          );
        }
        horarioData.hora_apertura = hora_apertura;
        horarioData.hora_cierre = hora_cierre;
      }

      horariosAInsertar.push(horarioData);
    }

    console.log(
      `Insertando ${horariosAInsertar.length} horarios en la base de datos...`
    );

    // Insertar en la base de datos
    const { data: horariosRegistrados, error: errorHorarios } =
      await supabaseClient
        .from("horarios_atencion")
        .insert(horariosAInsertar)
        .select();

    if (errorHorarios) {
      console.error("Error de Supabase:", errorHorarios);
      return res.status(400).json({
        message: "Error al registrar los horarios: " + errorHorarios.message,
      });
    }

    console.log(`${horariosRegistrados.length} horarios registrados con éxito`);

    res.status(201).json({
      message: `${horariosRegistrados.length} horarios registrados exitosamente`,
      horarios: horariosRegistrados,
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
