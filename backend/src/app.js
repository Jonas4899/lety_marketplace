import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

import { uploadFile, validateDate } from "./utils.js";

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
  upload.fields([{ name: "petPhoto" }, { name: "petHistory" }]),
  async (req, res) => {
    const {
      userName,
      email,
      phone,
      password,
      petName,
      petAge,
      petBreed,
      petSpecies,
    } = req.body;

    //req.files contiene los archivos subidos en un objeto con arrays de archivos
    //"foto_mascota": [ { "file1_data" } ], foto mascota es un array de archivos

    const fotoMascotaFile = req.files.petPhoto?.[0]; // Obtener el primer archivol array
    const historialMedicoFile = req.files.petHistory?.[0]; // Obtener el primer archivol array

    console.log("Foto mascota file:", fotoMascotaFile);
    console.log("Historial médico file:", historialMedicoFile);

    try {
      console.log("Datos recibidos:", req.body);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //Guardar la fecha de registro
      const fecha_registro = new Date();

      //Registrar el usuario
      const { data: usuario, error: errorUsuario } = await supabaseClient
        .from("usuarios")
        .insert([
          {
            nombre: userName,
            correo: email,
            contrasena: hashedPassword,
            telefono: phone,
            fecha_registro,
          },
        ])
        .select("id_usuario")
        .single();

      if (errorUsuario) {
        // Verificar si es un error de duplicado de correo electrónico
        if (
          errorUsuario.code === "23505" &&
          errorUsuario.details.includes("correo")
        ) {
          return res.status(409).json({
            message:
              "Ya existe un usuario registrado con este correo electrónico",
          });
        }
        // Verificar si es un error de duplicado de teléfono
        else if (
          errorUsuario.code === "23505" &&
          errorUsuario.details.includes("telefono")
        ) {
          return res.status(409).json({
            message:
              "Ya existe un usuario registrado con este número de teléfono",
          });
        }

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
            nombre: petName,
            edad: parseInt(petAge), // Asegúrate de que sea un número
            raza: petBreed,
            especie: petSpecies,
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

// =================== ANALYTICS ENDPOINTS ===================

// Endpoint para obtener estadísticas básicas de citas para una clínica
app.get("/api/analytics/appointments/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { from_date, to_date } = req.query;

    if (!validateDate(from_date) || !validateDate(to_date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
      });
    }

    // Verificar si la clínica existe
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

    // Validar fechas
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to_date ? new Date(to_date) : new Date();

    // 1. Total de citas
    const { data: totalCitas, error: errorTotal } = await supabaseClient
      .from("citas")
      .select("id_cita")
      .eq("id_clinica", id_clinica)
      .gte("fecha_inicio", fromDate.toISOString())
      .lte("fecha_inicio", toDate.toISOString());

    if (errorTotal) {
      return res.status(400).json({
        message: "Error al obtener el total de citas",
        error: errorTotal.message,
      });
    }

    // 2. Distribución de estados
    const { data: estadosCitas, error: errorEstados } = await supabaseClient
      .from("citas")
      .select("estado")
      .eq("id_clinica", id_clinica)
      .gte("fecha_inicio", fromDate.toISOString())
      .lte("fecha_inicio", toDate.toISOString());

    if (errorEstados) {
      return res.status(400).json({
        message: "Error al obtener estados de citas",
        error: errorEstados.message,
      });
    }

    // Contar estados
    const estadosCount = {
      completed: 0,
      scheduled: 0,
      cancelled: 0,
    };

    estadosCitas.forEach((cita) => {
      const estado = cita.estado.toLowerCase();
      if (estado === "completada") estadosCount.completed++;
      else if (estado === "programada") estadosCount.scheduled++;
      else if (estado === "cancelada") estadosCount.cancelled++;
    });

    // 3. Citas por rango de fechas (agrupadas por día)
    const { data: citasPorDia, error: errorCitasDia } = await supabaseClient
      .from("citas")
      .select("fecha_inicio, estado")
      .eq("id_clinica", id_clinica)
      .gte("fecha_inicio", fromDate.toISOString())
      .lte("fecha_inicio", toDate.toISOString())
      .order("fecha_inicio", { ascending: true });

    if (errorCitasDia) {
      return res.status(400).json({
        message: "Error al obtener citas por día",
        error: errorCitasDia.message,
      });
    }

    // Agrupar citas por día
    const citasPorFecha = {};
    citasPorDia.forEach((cita) => {
      const fecha = cita.fecha_inicio.split("T")[0]; // Obtener solo la fecha YYYY-MM-DD
      if (!citasPorFecha[fecha]) {
        citasPorFecha[fecha] = {
          total: 0,
          completed: 0,
          scheduled: 0,
          cancelled: 0,
        };
      }

      citasPorFecha[fecha].total++;

      const estado = cita.estado.toLowerCase();
      if (estado === "completada") citasPorFecha[fecha].completed++;
      else if (estado === "programada") citasPorFecha[fecha].scheduled++;
      else if (estado === "cancelada") citasPorFecha[fecha].cancelled++;
    });

    // Convertir a array para la respuesta
    const appointmentsData = Object.keys(citasPorFecha).map((date) => ({
      date,
      total: citasPorFecha[date].total,
      completed: citasPorFecha[date].completed,
      scheduled: citasPorFecha[date].scheduled,
      cancelled: citasPorFecha[date].cancelled,
    }));

    // Enviar respuesta con todos los datos
    res.status(200).json({
      totalAppointments: totalCitas.length,
      statusDistribution: [
        { name: "Completadas", value: estadosCount.completed },
        { name: "Programadas", value: estadosCount.scheduled },
        { name: "Canceladas", value: estadosCount.cancelled },
      ],
      appointmentsByDate: appointmentsData,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de citas:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + error.message });
  }
});

// Endpoint para obtener estadísticas de servicios para una clínica
app.get("/api/analytics/services/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { from_date, to_date } = req.query;

    if (!validateDate(from_date) || !validateDate(to_date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
      });
    }

    // Verificar si la clínica existe
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

    // Validar fechas
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to_date ? new Date(to_date) : new Date();

    // 1. Servicios más populares (top 5) con conteo
    let topServices = [];
    let servicesRevenue = [];

    try {
      const { data: servicios, error: errorServicios } =
        await supabaseClient.rpc("get_top_services", {
          clinica_id: id_clinica,
          start_date: fromDate.toISOString(),
          end_date: toDate.toISOString(),
          limit_count: 5,
        });

      if (!errorServicios && servicios && servicios.length > 0) {
        // Si la función RPC funcionó correctamente
        topServices = servicios.map((s) => ({
          name: s.nombre_servicio,
          value: s.total_citas,
        }));

        servicesRevenue = servicios.map((s) => ({
          name: s.nombre_servicio,
          value: s.total_citas,
          revenue: s.ingreso_total,
        }));
      } else {
        // Si la función RPC falló, usar consulta alternativa
        console.warn("Usando consulta alternativa para servicios");

        // Consulta alternativa: Unir citas con servicios y contar
        const { data: citasServicios, error: errorCitasServicios } =
          await supabaseClient
            .from("citas")
            .select(
              `
            id_servicio,
            servicios(id_servicio, nombre, precio)
          `
            )
            .eq("id_clinica", id_clinica)
            .gte("fecha_inicio", fromDate.toISOString())
            .lte("fecha_inicio", toDate.toISOString());

        if (errorCitasServicios) {
          throw new Error(
            "Error al obtener servicios: " + errorCitasServicios.message
          );
        }

        // Contar servicios manualmente
        const serviciosCount = {};

        citasServicios.forEach((cita) => {
          if (!cita.id_servicio || !cita.servicios) return;

          const idServicio = cita.id_servicio;
          const nombreServicio =
            cita.servicios.nombre || `Servicio ${idServicio}`;
          const precioServicio = cita.servicios.precio || 0;

          if (!serviciosCount[idServicio]) {
            serviciosCount[idServicio] = {
              name: nombreServicio,
              value: 0,
              revenue: 0,
              price: precioServicio,
            };
          }

          serviciosCount[idServicio].value++;
          serviciosCount[idServicio].revenue += parseFloat(precioServicio);
        });

        // Convertir a array y ordenar
        const serviciosArray = Object.values(serviciosCount)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        topServices = serviciosArray.map((s) => ({
          name: s.name,
          value: s.value,
        }));

        servicesRevenue = serviciosArray.map((s) => ({
          name: s.name,
          value: s.value,
          revenue: s.revenue,
        }));
      }
    } catch (serviceError) {
      console.error("Error procesando servicios:", serviceError);
      // No interrumpir el flujo, devolver arrays vacíos
      topServices = [];
      servicesRevenue = [];
    }

    // Enviar respuesta
    res.status(200).json({
      topServices,
      servicesRevenue,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de servicios:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + error.message });
  }
});

// Endpoint para obtener estadísticas demográficas de mascotas para una clínica
app.get("/api/analytics/demographics/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { from_date, to_date } = req.query;

    if (!validateDate(from_date) || !validateDate(to_date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
      });
    }

    // Verificar si la clínica existe
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

    // Validar fechas
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to_date ? new Date(to_date) : new Date();

    // Obtener citas con información de mascotas
    const { data: citasMascotas, error: errorCitasMascotas } =
      await supabaseClient
        .from("citas")
        .select(
          `
        id_mascota,
        mascotas(especie, edad)
      `
        )
        .eq("id_clinica", id_clinica)
        .gte("fecha_inicio", fromDate.toISOString())
        .lte("fecha_inicio", toDate.toISOString());

    if (errorCitasMascotas) {
      return res.status(400).json({
        message: "Error al obtener datos demográficos",
        error: errorCitasMascotas.message,
      });
    }

    // 1. Distribución por tipo de mascota
    const especiesCount = {};
    citasMascotas.forEach((cita) => {
      if (!cita.mascotas) return;

      const especie = cita.mascotas.especie || "No especificado";
      if (!especiesCount[especie]) {
        especiesCount[especie] = 0;
      }
      especiesCount[especie]++;
    });

    // Normalizar especies a las categorías principales
    const especiesNormalizadas = {
      Perros: 0,
      Gatos: 0,
      Aves: 0,
      Exóticos: 0,
    };

    Object.keys(especiesCount).forEach((especie) => {
      const especieLower = especie.toLowerCase();
      if (especieLower.includes("perro") || especieLower.includes("canino")) {
        especiesNormalizadas["Perros"] += especiesCount[especie];
      } else if (
        especieLower.includes("gato") ||
        especieLower.includes("felino")
      ) {
        especiesNormalizadas["Gatos"] += especiesCount[especie];
      } else if (
        especieLower.includes("ave") ||
        especieLower.includes("pájaro") ||
        especieLower.includes("pajaro")
      ) {
        especiesNormalizadas["Aves"] += especiesCount[especie];
      } else {
        especiesNormalizadas["Exóticos"] += especiesCount[especie];
      }
    });

    // Convertir a array para la respuesta
    const petTypeData = Object.keys(especiesNormalizadas).map((type) => ({
      type,
      count: especiesNormalizadas[type],
    }));

    // 2. Distribución por edad
    const edadesCount = {
      "< 1 año": 0,
      "1-3 años": 0,
      "4-7 años": 0,
      "8-10 años": 0,
      "> 10 años": 0,
    };

    citasMascotas.forEach((cita) => {
      if (!cita.mascotas || cita.mascotas.edad === null) return;

      const edad = parseInt(cita.mascotas.edad);
      if (isNaN(edad)) return;

      if (edad < 1) edadesCount["< 1 año"]++;
      else if (edad >= 1 && edad <= 3) edadesCount["1-3 años"]++;
      else if (edad >= 4 && edad <= 7) edadesCount["4-7 años"]++;
      else if (edad >= 8 && edad <= 10) edadesCount["8-10 años"]++;
      else edadesCount["> 10 años"]++;
    });

    // Convertir a array para la respuesta
    const ageDistributionData = Object.keys(edadesCount).map((range) => ({
      range,
      count: edadesCount[range],
    }));

    // Enviar respuesta
    res.status(200).json({
      petTypeDistribution: petTypeData,
      ageDistribution: ageDistributionData,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas demográficas:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + error.message });
  }
});

// Endpoint para obtener estadísticas de calificaciones para una clínica
app.get("/api/analytics/ratings/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { from_date, to_date } = req.query;

    if (!validateDate(from_date) || !validateDate(to_date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
      });
    }

    // Verificar si la clínica existe
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

    // Validar fechas
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to_date ? new Date(to_date) : new Date();

    // Obtener todas las reseñas
    const { data: resenas, error: errorResenas } = await supabaseClient
      .from("reseñas")
      .select("calificacion, fecha")
      .eq("id_clinica", id_clinica)
      .gte("fecha", fromDate.toISOString())
      .lte("fecha", toDate.toISOString());

    if (errorResenas) {
      return res.status(400).json({
        message: "Error al obtener reseñas",
        error: errorResenas.message,
      });
    }

    // 1. Calificación promedio
    let totalCalificacion = 0;
    resenas.forEach((resena) => {
      totalCalificacion += resena.calificacion;
    });

    const avgRating =
      resenas.length > 0 ? (totalCalificacion / resenas.length).toFixed(1) : 0;

    // 2. Distribución de calificaciones
    const calificacionesCount = {
      "1 ★": 0,
      "2 ★": 0,
      "3 ★": 0,
      "4 ★": 0,
      "5 ★": 0,
    };

    resenas.forEach((resena) => {
      const estrellas = resena.calificacion;
      if (estrellas >= 1 && estrellas <= 5) {
        calificacionesCount[`${estrellas} ★`]++;
      }
    });

    // Convertir a array para la respuesta
    const ratingDistribution = Object.keys(calificacionesCount).map(
      (rating) => ({
        rating,
        count: calificacionesCount[rating],
      })
    );

    // Enviar respuesta
    res.status(200).json({
      averageRating: parseFloat(avgRating),
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de calificaciones:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + error.message });
  }
});

// Endpoint para obtener resumen general de estadísticas para una clínica
app.get("/api/analytics/summary/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { from_date, to_date } = req.query;

    if (!validateDate(from_date) || !validateDate(to_date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido",
      });
    }

    // Verificar si la clínica existe
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

    // Validar fechas
    const fromDate = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to_date ? new Date(to_date) : new Date();

    // 1. Total de citas
    const { data: totalCitas, error: errorTotal } = await supabaseClient
      .from("citas")
      .select("id_cita")
      .eq("id_clinica", id_clinica)
      .gte("fecha_inicio", fromDate.toISOString())
      .lte("fecha_inicio", toDate.toISOString());

    if (errorTotal) {
      return res.status(400).json({
        message: "Error al obtener el total de citas",
        error: errorTotal.message,
      });
    }

    // 2. Calificación promedio
    const { data: resenas, error: errorResenas } = await supabaseClient
      .from("reseñas")
      .select("calificacion")
      .eq("id_clinica", id_clinica)
      .gte("fecha", fromDate.toISOString())
      .lte("fecha", toDate.toISOString());

    if (errorResenas) {
      return res.status(400).json({
        message: "Error al obtener reseñas",
        error: errorResenas.message,
      });
    }

    let totalCalificacion = 0;
    resenas.forEach((resena) => {
      totalCalificacion += resena.calificacion;
    });

    const avgRating =
      resenas.length > 0 ? (totalCalificacion / resenas.length).toFixed(1) : 0;

    // 3. Ingresos totales
    const { data: citasServicios, error: errorCitasServicios } =
      await supabaseClient
        .from("citas")
        .select(
          `
        id_servicio,
        servicios(precio)
      `
        )
        .eq("id_clinica", id_clinica)
        .eq("estado", "completada")
        .gte("fecha_inicio", fromDate.toISOString())
        .lte("fecha_inicio", toDate.toISOString());

    if (errorCitasServicios) {
      return res.status(400).json({
        message: "Error al calcular ingresos",
        error: errorCitasServicios.message,
      });
    }

    let totalRevenue = 0;
    citasServicios.forEach((cita) => {
      if (cita.servicios && cita.servicios.precio) {
        totalRevenue += parseFloat(cita.servicios.precio);
      }
    });

    // 4. Total de mascotas atendidas
    const { data: mascotasAtendidas, error: errorMascotas } =
      await supabaseClient
        .from("citas")
        .select("id_mascota")
        .eq("id_clinica", id_clinica)
        .gte("fecha_inicio", fromDate.toISOString())
        .lte("fecha_inicio", toDate.toISOString());

    if (errorMascotas) {
      return res.status(400).json({
        message: "Error al obtener mascotas atendidas",
        error: errorMascotas.message,
      });
    }

    // Contar mascotas únicas
    const mascotasUnicas = new Set();
    mascotasAtendidas.forEach((cita) => {
      mascotasUnicas.add(cita.id_mascota);
    });

    // Enviar respuesta
    res.status(200).json({
      totalAppointments: totalCitas.length,
      avgRating: parseFloat(avgRating),
      totalRevenue: totalRevenue,
      totalPets: mascotasUnicas.size,
    });
  } catch (error) {
    console.error("Error al obtener resumen de estadísticas:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}
export default app;
