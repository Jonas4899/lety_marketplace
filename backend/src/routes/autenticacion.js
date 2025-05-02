import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);
const JWT_SECRET = process.env.JWT_SECRET;

// Login de usuarios dueños de mascotas
router.post('/owner/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign(
      {
        userId: user.id_usuario,
        userType: 'owner',
      },
      JWT_SECRET,
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    //Obtener mascotas del usuario
    const { data: mascotas, error: errorMascotas } = await supabaseClient
      .from('mascotas')
      .select('*')
      .eq('id_usuario', user.id_usuario);

    if (errorMascotas) {
      return res
        .status(500)
        .json({ message: 'Error al obtener las mascotas del usuario' });
    }

    // Configurar la cookie segura con el token
    res.cookie('auth_token', token, {
      httpOnly: false, //cambiar luego a true
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    });

    console.log(mascotas);

    //enviar respuesta con el token y los datos del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        mascotas: mascotas || [],
      },
    });
  } catch (error) {
    console.error('Error en el inicio de sesion:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login de clínicas veterinarias
router.post('/vet/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: clinica, error } = await supabaseClient
      .from('clinicas')
      .select('*')
      .eq('correo', email)
      .single();

    if (error || !clinica) {
      return res
        .status(401)
        .json({ message: 'Clinica veterinaria no encontrada' });
    }

    const passwordMatch = await bcrypt.compare(password, clinica.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    //verificar el estado de la clinica
    const estadoRequerido = 'confirmado';

    if (clinica.estado !== estadoRequerido) {
      return res.status(403).json({
        message:
          'La clinica aun no ha sido verificada, intentelo luego de las siguientes 24 horas',
        estado: clinica.estado,
      });
    }

    // Generar un token JWT
    const token = jwt.sign(
      {
        clinicaId: clinica.id_clinica,
        userType: 'vet',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Configurar la cookie segura con el token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    });

    //enviar respuesta con los datos de la clinica
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      clinica: {
        id_clinica: clinica.id_clinica,
        nombre: clinica.nombre,
        direccion: clinica.direccion,
        telefono: clinica.telefono,
        correo: clinica.correo,
      },
    });
  } catch (error) {
    console.error('Error en el inicio de sesión de clínica:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
