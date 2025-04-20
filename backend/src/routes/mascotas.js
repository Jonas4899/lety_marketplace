import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import autenticacionToken from '../middleware/auth.js';
import uploadFile from '../utils.js';
import dotenv from 'dotenv';

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

//Registrar una nueva mascota a nombre de un usuario
router.post(
  '/pets/add',
  autenticacionToken,
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'historial', maxCount: 1 },
  ]),
  async (req, res) => {
    const id_usuario = req.query.id_usuario;
    const { petName, petAge, petBreed, petSpecies, petGender, petWeight } =
      req.body;

    const fotoMascotaFile = req.files?.foto?.[0];
    const historialMedicoFile = req.files?.historial?.[0];

    try {
      console.log('Datos recibidos: ', req.body);
      console.log('Id usuario: ', id_usuario);

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

      const { data: mascotaData, error: errorMascota } = await supabaseClient
        .from('mascotas')
        .insert([
          {
            nombre: petName,
            edad: parseInt(petAge),
            raza: petBreed,
            especie: petSpecies,
            genero: petGender,
            peso: parseFloat(petWeight),
            historial_medico: historial_medicoUrl,
            foto_url: foto_mascotaUrl,
            id_usuario: id_usuario,
          },
        ])
        .select('*')
        .single();

      if (errorMascota) {
        console.error('Error al registrar la mascota: ' + errorMascota);
        return res.status(400).json({
          message: 'Error al registrar la mascota',
        });
      }

      // Limpiar archivos temporales después de subirlos
      if (fotoMascotaFile && fs.existsSync(fotoMascotaFile.path)) {
        fs.unlinkSync(fotoMascotaFile.path);
      }
      if (historialMedicoFile && fs.existsSync(historialMedicoFile.path)) {
        fs.unlinkSync(historialMedicoFile.path);
      }

      return res.status(201).json({
        message: 'Mascota registrada exitosamente',
        mascota: mascotaData,
      });
    } catch (error) {
      console.error('Error inesperado:', error);

      // Limpiar archivos temporales en caso de error
      if (fotoMascotaFile && fs.existsSync(fotoMascotaFile.path)) {
        fs.unlinkSync(fotoMascotaFile.path);
      }
      if (historialMedicoFile && fs.existsSync(historialMedicoFile.path)) {
        fs.unlinkSync(historialMedicoFile.path);
      }

      return res.status(500).json({
        message:
          'Error en el servidor: ' + (error.message || 'Error desconocido'),
      });
    }
  }
);

//Eliminar mascota del usuario
router.delete('/pets/delete', autenticacionToken, async (req, res) => {
  const id_usuario = req.query.id_usuario;
  const id_mascota = req.query.id_mascota;

  try {
    if (!id_usuario) {
      return res.status(400).json({ message: 'Se requiere el id del usuario' });
    }

    if (!id_mascota) {
      return res
        .status(400)
        .json({ message: 'Se requiere el id de la mascota' });
    }

    //Verificar que la mascota pertenezca al usuario
    const { data: mascotaCheck, error: errorCheck } = await supabaseClient
      .from('mascotas')
      .select('id_mascota')
      .eq('id_mascota', id_mascota)
      .eq('id_usuario', id_usuario)
      .single();

    if (errorCheck || !mascotaCheck) {
      console.error('Error al verificar mascota: ', errorCheck);
      return res.status(404).json({
        message: 'La mascota no existe o no pertenece a este usuario',
        error: errorCheck?.message,
      });
    }

    //Eliminar mascota
    const { error: deleteError } = await supabaseClient
      .from('mascotas')
      .delete()
      .eq('id_mascota', id_mascota)
      .eq('id_usuario', id_usuario);

    if (deleteError) {
      console.error('Error al eliminar mascota: ', deleteError);
      return res.status(400).json({
        message: 'Error al eliminar la mascota',
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      message: 'Mascota eliminada correctamente',
      id_mascota: id_mascota,
    });
  } catch (error) {
    console.error('Error en el servidor: ', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

//Obtener mascotas del usuario
router.get('/pets/get', autenticacionToken, async (req, res) => {
  const id_usuario = req.query.id_usuario;

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
