import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import uploadFile from '../utils.js';
import dotenv from 'dotenv';
import autenticacionToken from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Guardar temporalmente en la carpeta local /uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Obtener la extensión del archivo
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Crear un nombre único
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Registro de usuario con mascota
router.post(
  '/register/user',
  upload.fields([{ name: 'petPhoto' }, { name: 'petHistory' }]),
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

    const fotoMascotaFile = req.files.petPhoto?.[0]; // Obtener el primer archivol array
    const historialMedicoFile = req.files.petHistory?.[0]; // Obtener el primer archivol array

    console.log('Foto mascota file:', fotoMascotaFile);
    console.log('Historial médico file:', historialMedicoFile);

    try {
      console.log('Datos recibidos:', req.body);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      //Guardar la fecha de registro
      const fecha_registro = new Date();

      //Registrar el usuario
      const { data: usuario, error: errorUsuario } = await supabaseClient
        .from('usuarios')
        .insert([
          {
            nombre: userName,
            correo: email,
            contrasena: hashedPassword,
            telefono: phone,
            fecha_registro,
          },
        ])
        .select('id_usuario')
        .single();

      if (errorUsuario) {
        // Verificar si es un error de duplicado de correo electrónico
        if (
          errorUsuario.code === '23505' &&
          errorUsuario.details.includes('correo')
        ) {
          return res.status(409).json({
            message:
              'Ya existe un usuario registrado con este correo electrónico',
          });
        }
        // Verificar si es un error de duplicado de teléfono
        else if (
          errorUsuario.code === '23505' &&
          errorUsuario.details.includes('telefono')
        ) {
          return res.status(409).json({
            message:
              'Ya existe un usuario registrado con este número de teléfono',
          });
        }

        return res.status(400).json({
          message: 'Error al registrar el usuario:' + errorUsuario.message,
        });
      }

      console.log('Usuario registrado:', usuario);

      //Arhivos para el registro de la mascota
      const foto_mascotaUrl = await uploadFile(
        fotoMascotaFile,
        'fotos-mascotas'
      );
      const historial_medicoUrl = await uploadFile(
        historialMedicoFile,
        'historiales-mascotas'
      );

      console.log('URL de la foto:', foto_mascotaUrl);
      console.log('URL del historial:', historial_medicoUrl);

      //Registrar la mascota
      const { error: errorMascota } = await supabaseClient
        .from('mascotas')
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
        .select('id_mascota')
        .single();

      if (errorMascota) {
        console.error('Error completo:', JSON.stringify(errorMascota, null, 2));
        return res.status(400).json({
          message: 'Error al registrar la mascota: ' + errorMascota.message,
          details: errorMascota.details,
          code: errorMascota.code,
        });
      }

      if (fotoMascotaFile) fs.unlinkSync(fotoMascotaFile.path);
      if (historialMedicoFile) fs.unlinkSync(historialMedicoFile.path);

      // Enviar una respuesta con la información del usuario y mascota
      res.status(201).json({
        message: 'Usuario y mascota registrados exitosamente',
        datosUsuario: usuario,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//Obtener mascotas del usuario
router.get('/user/pets', autenticacionToken, async (req, res) => {
  const id_usuario = req.query.id_usuario;
  console.log('ID recibido: ' + id_usuario);

  try {
    if (!id_usuario) {
      return res
        .status(400)
        .json({ meassage: 'Se requiere el ID del usuario' });
    }

    const { data: mascotas, error } = await supabaseClient
      .from('mascotas')
      .select('*')
      .eq('id_usuario', id_usuario);

    if (error) {
      console.error('Error al obtener mascotas: ', error);
      return res.status(400).json({
        message: 'Error al obtener mascotas',
        error: error.message,
      });
    }

    if (mascotas.length === 0) {
      return res.status(200).json({
        message: 'El usuario no tiene mascotas registradas',
        mascotas: [],
      });
    }

    return res.status(200).json({
      message: 'Mascotas obtenidas correctamente',
      mascotas: mascotas,
    });
  } catch (error) {
    console.error('Error en el servidor: ' + error);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
});

export default router;
