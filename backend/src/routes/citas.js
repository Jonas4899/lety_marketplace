import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SERVICE_ROL_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para validar JWT
const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.auth_token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "No token, autorización denegada" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // guardar info de usuario en la request
    next();
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Aplicamos el middleware a todas las rutas
router.use(authenticateToken);

// Ruta para agendar citas
router.post("/appointments/schedule", async (req, res) => {
  const { userId, userType } = req.user;

  if (userType !== "owner") {
    return res
      .status(403)
      .json({ message: "Solo los dueños de mascotas pueden agendar citas" });
  }

  const {
    petId,
    serviceId,
    date,
    timeSlot,
    reason,
    notes,
    reminderPreference,
    acceptedTerms,
    clinicId,
  } = req.body;

  if (!petId || !serviceId || !date || !timeSlot || acceptedTerms !== true) {
    return res
      .status(400)
      .json({ message: "Datos de cita incompletos o inválidos." });
  }

  try {
    // Validar que la mascota pertenezca al usuario
    const { data: pet, error: petError } = await supabase
      .from("mascotas")
      .select("id_usuario")
      .eq("id_mascota", petId)
      .single();

    if (petError || !pet) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    if (pet.id_usuario !== userId) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para agendar con esta mascota" });
    }

    // Validar formato de fecha
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Fecha inválida." });
    }

    const trazabilidad = [
      {
        accion: "creacion",
        usuario: userId,
        fecha: new Date().toISOString(),
        detalles: {
          estado: "pendiente",
          motivo: reason || "",
          notas: notes || "",
        },
      },
    ];
    const { data, error } = await supabase.from("citas").insert([
      {
        id_usuario: userId,
        id_mascota: petId,
        id_clinica: clinicId,
        id_servicio: serviceId,
        fecha_inicio: date,
        horario: timeSlot,
        motivo: reason || "",
        notas_adicionales: notes || "",
        preferencia_recordatorio: reminderPreference || "both",
        acepto_terminos: true,
        estado: "pendiente",
        created_at: new Date().toISOString(),
        trazabilidad,
      },
    ]);

    if (error) {
      console.error("Error insertando cita:", error);
      return res.status(500).json({ message: "Error al agendar cita" });
    }

    return res
      .status(201)
      .json({ message: "Cita creada exitosamente", cita: data?.[0] });
  } catch (error) {
    console.error("Error general agendando cita:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🔥 Nueva ruta para obtener citas del usuario
router.get("/appointments/user", async (req, res) => {
  const { userId } = req.user;

  try {
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        id_cita,
        id_mascota,
        id_clinica,
        fecha_inicio,
        horario,
        motivo,
        estado,
        notas_adicionales,
        mascotas(nombre, foto_url),
        clinicas(nombre, direccion)
      `
      )
      .eq("id_usuario", userId)
      .order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error obteniendo citas:", error);
      return res.status(500).json({ message: "Error al obtener citas" });
    }

    const citasFormateadas = data.map((cita) => ({
      id: cita.id_cita,
      petName: cita.mascotas?.nombre || "Mascota",
      petImage: cita.mascotas?.foto_url || "/placeholder.svg",
      clinicName: cita.clinicas?.nombre || "Clínica veterinaria",
      clinicAddress: cita.clinicas?.direccion || "Dirección desconocida",
      date: new Date(cita.fecha_inicio).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: cita.horario,
      reason: cita.motivo || "Consulta",
      status:
        cita.estado === "pendiente"
          ? "pending"
          : cita.estado === "confirmada"
          ? "confirmed"
          : cita.estado,
      notes: cita.notas_adicionales || "",
    }));

    res.status(200).json({ citas: citasFormateadas });
  } catch (error) {
    console.error("Error general trayendo citas:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🔥 Endpoint para que la veterinaria vea todas sus citas
router.get("/appointments/clinic", async (req, res) => {
  const { clinicaId, userType } = req.user;

  if (userType !== "vet") {
    return res
      .status(403)
      .json({ message: "Solo las clínicas pueden ver sus citas" });
  }

  try {
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        id_cita,
        id_mascota,
        id_usuario,
        fecha_inicio,
        horario,
        motivo,
        estado,
        notas_adicionales,
        mascotas(nombre, foto_url),
        usuarios(nombre, correo, telefono)
      `
      )
      .eq("id_clinica", clinicaId)
      .order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error obteniendo citas de la clínica:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener citas de la clínica" });
    }

    const citasFormateadas = data.map((cita) => ({
      id: cita.id_cita,
      petName: cita.mascotas?.nombre || "Mascota",
      petImage: cita.mascotas?.foto_url || "/placeholder.svg",
      ownerName: cita.usuarios?.nombre || "Dueño",
      ownerEmail: cita.usuarios?.correo || "",
      ownerPhone: cita.usuarios?.telefono || "",
      date: new Date(cita.fecha_inicio).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: cita.horario,
      reason: cita.motivo || "Consulta",
      status: cita.estado,
      notes: cita.notas_adicionales || "",
    }));

    res.status(200).json({ citas: citasFormateadas });
  } catch (error) {
    console.error("Error general trayendo citas de la clínica:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Obtener detalles de una cita
router.get("/appointments/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  const { userId } = req.user; // Viene del authenticateToken

  try {
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        id_cita,
        fecha_inicio,
        horario,
        motivo,
        estado,
        created_at,
        mascotas (
          nombre,
          especie,
          raza,
          edad,
          peso,
          foto_url
        ),
        clinicas (
          nombre,
          direccion,
          telefono,
          correo
        ),
        servicios (
          nombre,
          precio
        )
      `
      )
      .eq("id_usuario", userId) // 🔥 Seguridad: solo puede traer sus propias citas
      .eq("id_cita", appointmentId)
      .single(); // Esperamos solo **una** cita

    if (error) {
      console.error("Error obteniendo cita:", error);
      return res
        .status(500)
        .json({ message: "Error obteniendo detalles de la cita" });
    }

    if (!data) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // Formateamos los datos para adaptarlos a tu frontend
    const appointment = {
      id: data.id_cita,
      date: data.fecha_inicio,
      time: data.horario,
      reason: data.motivo,
      status: data.estado,
      createdAt: data.created_at,
      petName: data.mascotas?.nombre || "",
      petType: data.mascotas?.especie || "",
      petBreed: data.mascotas?.raza || "",
      petAge: data.mascotas?.edad || "",
      petWeight: data.mascotas?.peso ? `${data.mascotas.peso} kg` : "",
      petImage: data.mascotas?.foto_url || "/placeholder.svg",
      clinicName: data.clinicas?.nombre || "",
      clinicAddress: data.clinicas?.direccion || "",
      clinicPhone: data.clinicas?.telefono || "",
      clinicEmail: data.clinicas?.correo || "",
      clinicImage: data.clinicas?.imagen_url || "/placeholder.svg",
      service: data.servicios?.nombre || "",
      duration: data.servicios?.duracion || 30,
      price: data.servicios?.precio || 0,
      paymentStatus: "pending", // 🔥 Por ahora por defecto, lo integrarás después
      paymentType: "none", // 🔥
    };

    res.status(200).json({ appointment });
  } catch (error) {
    console.error("Error general obteniendo detalles de la cita:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🔥 Endpoint para que la veterinaria actualice el estado de una cita
router.put("/appointments/:appointmentId/status", async (req, res) => {
  const { appointmentId } = req.params;
  const { clinicaId, userType } = req.user;
  const { status, message } = req.body;

  if (userType !== "vet") {
    return res.status(403).json({
      message: "Solo las clínicas pueden actualizar el estado de citas",
    });
  }

  // Validar el status
  const validStatus = ["confirmada", "rechazada", "reprogramacion_sugerida"];
  if (!validStatus.includes(status)) {
    return res.status(400).json({
      message:
        "Estado no válido. Debe ser: confirmada, rechazada o reprogramacion_sugerida",
    });
  }

  try {
    // Verificar que la cita pertenezca a la clínica
    const { data: cita, error: errorCita } = await supabase
      .from("citas")
      .select("id_cita, id_clinica, id_usuario, trazabilidad")
      .eq("id_cita", appointmentId)
      .eq("id_clinica", clinicaId)
      .single();

    if (errorCita || !cita) {
      console.error("Error verificando cita:", errorCita);
      return res
        .status(404)
        .json({ message: "Cita no encontrada o no pertenece a esta clínica" });
    }

    // Actualizar el estado de la cita
    const actualizacion = {
      estado: status,
    };

    // Si hay mensaje/nota, guardarlo
    // No actualizamos notas_veterinaria porque no existe en la tabla
    // El mensaje se guardará en la trazabilidad

    // Manejo de trazabilidad
    const nuevaTrazabilidad = Array.isArray(cita.trazabilidad)
      ? [...cita.trazabilidad]
      : [];
    nuevaTrazabilidad.push({
      accion: "cambio_estado",
      usuario: clinicaId,
      fecha: new Date().toISOString(),
      detalles: {
        nuevo_estado: status,
        mensaje: message || "",
      },
    });
    actualizacion.trazabilidad = nuevaTrazabilidad;

    const { error: errorActualizacion } = await supabase
      .from("citas")
      .update(actualizacion)
      .eq("id_cita", appointmentId);

    if (errorActualizacion) {
      console.error("Error actualizando cita:", errorActualizacion);
      return res.status(500).json({
        message: "Error al actualizar el estado de la cita",
        error: errorActualizacion.message,
        details: errorActualizacion.details || errorActualizacion,
      });
    }

    // TODO: Aquí se podría implementar el envío de notificaciones al cliente

    return res.status(200).json({
      message: `Cita ${
        status === "confirmada"
          ? "confirmada"
          : status === "rechazada"
          ? "rechazada"
          : "marcada para reprogramación"
      } exitosamente`,
    });
  } catch (error) {
    console.error("Error general actualizando estado de cita:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Editar datos generales de la cita (solo dueño)
router.put("/appointments/:appointmentId/edit", async (req, res) => {
  const { appointmentId } = req.params;
  const { userId, userType } = req.user;
  const {
    petId,
    serviceId,
    date,
    timeSlot,
    reason,
    notes,
    reminderPreference,
  } = req.body;

  if (userType !== "owner") {
    return res
      .status(403)
      .json({ message: "Solo el dueño puede editar la cita" });
  }

  try {
    // Verificar que la cita pertenezca al usuario
    const { data: cita, error: errorCita } = await supabase
      .from("citas")
      .select("id_cita, id_usuario, trazabilidad")
      .eq("id_cita", appointmentId)
      .eq("id_usuario", userId)
      .single();

    if (errorCita || !cita) {
      return res
        .status(404)
        .json({ message: "Cita no encontrada o no pertenece al usuario" });
    }

    const actualizacion = {};
    if (petId) actualizacion.id_mascota = petId;
    if (serviceId) actualizacion.id_servicio = serviceId;
    if (date) actualizacion.fecha_inicio = date;
    if (timeSlot) actualizacion.horario = timeSlot;
    if (reason !== undefined) actualizacion.motivo = reason;
    if (notes !== undefined) actualizacion.notas_adicionales = notes;
    if (reminderPreference)
      actualizacion.preferencia_recordatorio = reminderPreference;

    // Trazabilidad
    const nuevaTrazabilidad = Array.isArray(cita.trazabilidad)
      ? [...cita.trazabilidad]
      : [];
    nuevaTrazabilidad.push({
      accion: "modificacion",
      usuario: userId,
      fecha: new Date().toISOString(),
      detalles: { ...actualizacion },
    });
    actualizacion.trazabilidad = nuevaTrazabilidad;

    const { error: errorUpdate } = await supabase
      .from("citas")
      .update(actualizacion)
      .eq("id_cita", appointmentId);

    if (errorUpdate) {
      return res.status(500).json({ message: "Error al editar la cita" });
    }

    res.status(200).json({ message: "Cita editada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Finalizar cita (solo vet)
router.put("/appointments/:appointmentId/finalize", async (req, res) => {
  const { appointmentId } = req.params;
  const { clinicaId, userType } = req.user;
  const {
    diagnostico,
    tratamiento,
    medicamentos,
    recomendaciones,
    instrucciones_seguimiento,
    notas_internas,
    servicios_adicionales,
    productos_vendidos,
  } = req.body;

  if (userType !== "vet") {
    return res
      .status(403)
      .json({ message: "Solo la clínica puede finalizar la cita" });
  }

  try {
    // Verificar que la cita pertenezca a la clínica
    const { data: cita, error: errorCita } = await supabase
      .from("citas")
      .select("id_cita, id_clinica, trazabilidad")
      .eq("id_cita", appointmentId)
      .eq("id_clinica", clinicaId)
      .single();

    if (errorCita || !cita) {
      return res
        .status(404)
        .json({ message: "Cita no encontrada o no pertenece a la clínica" });
    }

    const actualizacion = {
      estado: "finalizada",
    };
    if (diagnostico !== undefined) actualizacion.diagnostico = diagnostico;
    if (tratamiento !== undefined) actualizacion.tratamiento = tratamiento;
    if (medicamentos !== undefined) actualizacion.medicamentos = medicamentos;
    if (recomendaciones !== undefined)
      actualizacion.recomendaciones = recomendaciones;
    if (instrucciones_seguimiento !== undefined)
      actualizacion.instrucciones_seguimiento = instrucciones_seguimiento;
    if (notas_internas !== undefined)
      actualizacion.notas_internas = notas_internas;
    if (servicios_adicionales !== undefined)
      actualizacion.servicios_adicionales = servicios_adicionales;
    if (productos_vendidos !== undefined)
      actualizacion.productos_vendidos = productos_vendidos;

    // Trazabilidad
    const nuevaTrazabilidad = Array.isArray(cita.trazabilidad)
      ? [...cita.trazabilidad]
      : [];
    nuevaTrazabilidad.push({
      accion: "finalizacion",
      usuario: clinicaId,
      fecha: new Date().toISOString(),
      detalles: {
        diagnostico,
        tratamiento,
        medicamentos,
        recomendaciones,
        instrucciones_seguimiento,
        notas_internas,
        servicios_adicionales,
        productos_vendidos,
      },
    });
    actualizacion.trazabilidad = nuevaTrazabilidad;

    const { error: errorUpdate } = await supabase
      .from("citas")
      .update(actualizacion)
      .eq("id_cita", appointmentId);

    if (errorUpdate) {
      return res.status(500).json({ message: "Error al finalizar la cita" });
    }

    res.status(200).json({ message: "Cita finalizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
