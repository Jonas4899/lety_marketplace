import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const router = express.Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SERVICE_ROL_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const JWT_SECRET = process.env.JWT_SECRET

// Middleware para validar JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token || (req.headers.authorization && req.headers.authorization.split(' ')[1])

  if (!token) {
    return res.status(401).json({ message: 'No token, autorización denegada' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // guardar info de usuario en la request
    next()
  } catch (error) {
    console.error('Error verificando token:', error)
    return res.status(401).json({ message: 'Token inválido' })
  }
}

// Aplicamos el middleware a todas las rutas
router.use(authenticateToken)

// Ruta para agendar citas
router.post('/appointments/schedule', async (req, res) => {
    const { userId, userType } = req.user
  
    if (userType !== 'owner') {
      return res.status(403).json({ message: 'Solo los dueños de mascotas pueden agendar citas' })
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
    } = req.body
  
    if (!petId || !serviceId || !date || !timeSlot || acceptedTerms !== true) {
      return res.status(400).json({ message: 'Datos de cita incompletos o inválidos.' })
    }
  
    try {
      // Validar que la mascota pertenezca al usuario
      const { data: pet, error: petError } = await supabase
        .from('mascotas')
        .select('id_usuario')
        .eq('id_mascota', petId)
        .single()
  
      if (petError || !pet) {
        return res.status(404).json({ message: 'Mascota no encontrada' })
      }
  
      if (pet.id_usuario !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para agendar con esta mascota' })
      }
  
      // Validar formato de fecha
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ message: 'Fecha inválida.' })
      }
  
      const { data, error } = await supabase
        .from('citas')
        .insert([{
          id_usuario: userId,
          id_mascota: petId,
          id_clinica: clinicId,
          id_servicio: serviceId,
          fecha_inicio: date,
          horario: timeSlot,
          motivo: reason || '',
          notas_adicionales: notes || '',
          preferencia_recordatorio: reminderPreference || 'both',
          acepto_terminos: true,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        }])
  
      if (error) {
        console.error('Error insertando cita:', error)
        return res.status(500).json({ message: 'Error al agendar cita' })
      }
  
      return res.status(201).json({ message: 'Cita creada exitosamente', cita: data?.[0] })
    } catch (error) {
      console.error('Error general agendando cita:', error)
      res.status(500).json({ message: 'Error en el servidor' })
    }
  })
  

export default router
