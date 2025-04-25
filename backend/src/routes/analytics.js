import express from "express";
import { validateDate, supabaseClient } from "../utils.js";

const router = express.Router();

// Endpoint para obtener estadísticas básicas de citas para una clínica
router.get("/api/analytics/appointments/:id_clinica", async (req, res) => {
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
router.get("/api/analytics/services/:id_clinica", async (req, res) => {
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
router.get("/api/analytics/demographics/:id_clinica", async (req, res) => {
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
router.get("/api/analytics/ratings/:id_clinica", async (req, res) => {
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
router.get("/api/analytics/summary/:id_clinica", async (req, res) => {
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

export default router;
