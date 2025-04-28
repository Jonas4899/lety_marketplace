import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Endpoint para registrar un servicio de una clínica veterinaria
router.post("/veterinary/services", async (req, res) => {
  try {
    console.log("Recibiendo solicitud para registrar servicio");

    const { id_clinica, nombre, descripcion, precio, categoria, disponible } =
      req.body;

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

    // Por defecto los servicios están disponibles
    const servicioDisponible = disponible === undefined ? true : disponible;
    const servicioDescripcion = descripcion || "";

    console.log("Insertando servicio en la base de datos...");
    const { data: servicio, error: errorServicio } = await supabaseClient
      .from("servicios")
      .insert([
        {
          id_clinica,
          nombre,
          descripcion: servicioDescripcion,
          precio: precioNumerico,
          categoria,
          disponible: servicioDisponible,
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
router.post("/register/services", async (req, res) => {
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
        disponible:
          servicio.disponible !== undefined ? servicio.disponible : true,
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

// Endpoint para obtener todos los servicios de una clínica veterinaria
router.get("/veterinary/services/:id_clinica", async (req, res) => {
  try {
    console.log("Obteniendo servicios de la clínica");

    const { id_clinica } = req.params;
    const { categoria } = req.query;

    // Validar id_clinica
    if (!id_clinica) {
      return res.status(400).json({
        message: "Se requiere el ID de la clínica",
      });
    }

    // Construir la consulta base
    let query = supabaseClient
      .from("servicios")
      .select("*")
      .eq("id_clinica", id_clinica)
      .order("nombre");

    // Aplicar filtro por categoría si existe
    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    // Ejecutar la consulta
    const { data: servicios, error } = await query;

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({
        message: "Error al obtener servicios: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicios obtenidos exitosamente",
      total: servicios.length,
      servicios,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Endpoint para obtener un servicio específico
router.get("/veterinary/services/detail/:id_servicio", async (req, res) => {
  try {
    console.log("Obteniendo detalle de servicio");

    const { id_servicio } = req.params;

    // Validar id_servicio
    if (!id_servicio) {
      return res.status(400).json({
        message: "Se requiere el ID del servicio",
      });
    }

    // Ejecutar la consulta
    const { data: servicio, error } = await supabaseClient
      .from("servicios")
      .select("*")
      .eq("id_servicio", id_servicio)
      .single();

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({
        message: "Error al obtener el servicio: " + error.message,
      });
    }

    if (!servicio) {
      return res.status(404).json({
        message: "Servicio no encontrado",
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicio obtenido exitosamente",
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

// Endpoint para actualizar un servicio
router.put("/veterinary/services/:id_servicio", async (req, res) => {
  try {
    console.log("Actualizando servicio");

    const { id_servicio } = req.params;
    const { nombre, descripcion, precio, categoria, disponible } = req.body;

    // Validar id_servicio
    if (!id_servicio) {
      return res.status(400).json({
        message: "Se requiere el ID del servicio",
      });
    }

    // Validar que hay datos para actualizar
    if (
      !nombre &&
      !descripcion &&
      precio === undefined &&
      categoria === undefined &&
      disponible === undefined
    ) {
      return res.status(400).json({
        message: "No se proporcionaron datos para actualizar",
      });
    }

    // Preparar los datos a actualizar
    const datosActualizados = {};
    if (nombre !== undefined) datosActualizados.nombre = nombre;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
    if (precio !== undefined) {
      // Validar que el precio sea un número
      const precioNumerico = parseFloat(precio);
      if (isNaN(precioNumerico)) {
        return res.status(400).json({
          message: "El precio debe ser un valor numérico",
        });
      }
      datosActualizados.precio = precioNumerico;
    }
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    if (disponible !== undefined) datosActualizados.disponible = disponible;

    // Verificar que el servicio existe antes de actualizarlo
    const { data: servicioExistente, error: errorConsulta } =
      await supabaseClient
        .from("servicios")
        .select("id_servicio")
        .eq("id_servicio", id_servicio)
        .single();

    if (errorConsulta || !servicioExistente) {
      return res.status(404).json({
        message: "Servicio no encontrado",
      });
    }

    // Actualizar el servicio
    const { data: servicioActualizado, error } = await supabaseClient
      .from("servicios")
      .update(datosActualizados)
      .eq("id_servicio", id_servicio)
      .select()
      .single();

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({
        message: "Error al actualizar el servicio: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Endpoint para eliminar un servicio
router.delete("/veterinary/services/:id_servicio", async (req, res) => {
  try {
    console.log("Eliminando servicio");

    const { id_servicio } = req.params;

    // Validar id_servicio
    if (!id_servicio) {
      return res.status(400).json({
        message: "Se requiere el ID del servicio",
      });
    }

    // Verificar que el servicio existe antes de eliminarlo
    const { data: servicioExistente, error: errorConsulta } =
      await supabaseClient
        .from("servicios")
        .select("id_servicio")
        .eq("id_servicio", id_servicio)
        .single();

    if (errorConsulta || !servicioExistente) {
      return res.status(404).json({
        message: "Servicio no encontrado",
      });
    }

    // Eliminar el servicio
    const { error } = await supabaseClient
      .from("servicios")
      .delete()
      .eq("id_servicio", id_servicio);

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({
        message: "Error al eliminar el servicio: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Mantenemos estas rutas para compatibilidad con versiones anteriores
// Endpoint para obtener todos los servicios de una clínica veterinaria
router.get("/services/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;
    const { categoria } = req.query;

    // Construir la consulta base
    let query = supabaseClient
      .from("servicios")
      .select("*")
      .eq("id_clinica", id_clinica)
      .order("nombre");

    // Aplicar filtro por categoría si existe
    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    // Ejecutar la consulta
    const { data: servicios, error } = await query;

    if (error) {
      return res.status(400).json({
        message: "Error al obtener servicios: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicios obtenidos exitosamente",
      total: servicios.length,
      servicios,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
    });
  }
});

// Endpoint para actualizar un servicio - Compatibilidad
router.put("/service/:id_servicio", async (req, res) => {
  try {
    const { id_servicio } = req.params;
    const { nombre, descripcion, precio, categoria, disponible } = req.body;

    // Preparar los datos a actualizar
    const datosActualizados = {};
    if (nombre !== undefined) datosActualizados.nombre = nombre;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
    if (precio !== undefined) {
      const precioNumerico = parseFloat(precio);
      if (isNaN(precioNumerico)) {
        return res.status(400).json({
          message: "El precio debe ser un valor numérico",
        });
      }
      datosActualizados.precio = precioNumerico;
    }
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    if (disponible !== undefined) datosActualizados.disponible = disponible;

    // Actualizar el servicio
    const { data: servicioActualizado, error } = await supabaseClient
      .from("servicios")
      .update(datosActualizados)
      .eq("id_servicio", id_servicio)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al actualizar el servicio: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
    });
  }
});

// Endpoint para eliminar un servicio - Compatibilidad
router.delete("/service/:id_servicio", async (req, res) => {
  try {
    const { id_servicio } = req.params;

    // Eliminar el servicio
    const { error } = await supabaseClient
      .from("servicios")
      .delete()
      .eq("id_servicio", id_servicio);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar el servicio: " + error.message,
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    res.status(500).json({
      message: "Error interno del servidor: " + error.message,
    });
  }
});

export default router;
