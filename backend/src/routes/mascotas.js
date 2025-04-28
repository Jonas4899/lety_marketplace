import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import autenticacionToken from '../middleware/auth.js'; // Ajusta la ruta a donde tienes el middleware

dotenv.config();

const router = express.Router();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Endpoint usando tu middleware
router.get('/user/me/pets', autenticacionToken, async (req, res) => {
  const userId = req.user.userId; // <-- Aquí recuperas el id del usuario desde el token

  try {
    console.log(`Obteniendo mascotas para el usuario autenticado ${userId}`);

    const { data: mascotas, error } = await supabaseClient
      .from('mascotas')
      .select('*')
      .eq('id_usuario', userId);

    if (error) {
      console.error('Error consultando mascotas:', error);
      return res.status(400).json({
        message: 'Error al obtener las mascotas: ' + error.message,
      });
    }

    res.status(200).json({
      message: `Mascotas del usuario autenticado`,
      mascotas,
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor: ' + error.message,
    });
  }
});


export default router;
