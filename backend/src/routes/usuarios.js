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
      petGender,
      petWeight,
    } = req.body;

    const fotoMascotaFile = req.files.petPhoto?.[0];
    const historialMedicoFile = req.files.petHistory?.[0];

    console.log('Foto mascota file:', fotoMascotaFile);
    console.log('Historial médico file:', historialMedicoFile);

    try {
      console.log('Datos recibidos:', req.body);

      // 1. Subir archivos primero para evitar problemas después
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

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const fecha_registro = new Date();

      // 2. Iniciar conexión para manejar transacción manual
      // Crear una nueva instancia de cliente para esta transacción
      const supabase = createClient(supabaseUrl, supabaseServiceRolKey);

      // 3. Iniciar transacción
      let usuario = null;
      let mascota = null;
      let errorRollback = null;

      // Usar patrón try/catch para manejar la transacción
      try {
        // Registrar el usuario
        const { data: usuarioData, error: errorUsuario } = await supabase
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
          // Manejar errores de duplicados
          if (
            errorUsuario.code === '23505' &&
            errorUsuario.details.includes('correo')
          ) {
            throw {
              status: 409,
              message:
                'Ya existe un usuario registrado con este correo electrónico',
            };
          } else if (
            errorUsuario.code === '23505' &&
            errorUsuario.details.includes('telefono')
          ) {
            throw {
              status: 409,
              message:
                'Ya existe un usuario registrado con este número de teléfono',
            };
          }

          throw {
            status: 400,
            message: 'Error al registrar el usuario: ' + errorUsuario.message,
          };
        }

        usuario = usuarioData;
        console.log('Usuario registrado:', usuario);

        // Registrar la mascota con el ID del usuario
        const { data: mascotaData, error: errorMascota } = await supabase
          .from('mascotas')
          .insert([
            {
              nombre: petName,
              edad: parseInt(petAge),
              raza: petBreed,
              especie: petSpecies,
              genero: petGender,
              peso: parseFloat(petWeight),
              historial_medico: historial_medicoUrl || null,
              foto_url: foto_mascotaUrl || null,
              id_usuario: usuario.id_usuario,
            },
          ])
          .select('id_mascota')
          .single();

        if (errorMascota) {
          // Si hay error al registrar mascota, necesitamos eliminar el usuario y revertir
          console.error('Error al registrar mascota:', errorMascota);

          // Eliminar el usuario creado para revertir la transacción
          const { error: errorEliminar } = await supabase
            .from('usuarios')
            .delete()
            .eq('id_usuario', usuario.id_usuario);

          if (errorEliminar) {
            console.error(
              'Error al eliminar usuario durante rollback:',
              errorEliminar
            );
          }

          throw {
            status: 400,
            message: 'Error al registrar la mascota: ' + errorMascota.message,
            details: errorMascota.details,
            code: errorMascota.code,
          };
        }

        mascota = mascotaData;
        console.log('Mascota registrada:', mascota);
      } catch (transactionError) {
        errorRollback = transactionError;
        console.error('Error en transacción:', transactionError);
      }

      // 4. Verificar si hubo errores y responder apropiadamente
      if (errorRollback) {
        // Limpiar archivos en caso de error
        if (fotoMascotaFile && fs.existsSync(fotoMascotaFile.path)) {
          fs.unlinkSync(fotoMascotaFile.path);
        }
        if (historialMedicoFile && fs.existsSync(historialMedicoFile.path)) {
          fs.unlinkSync(historialMedicoFile.path);
        }

        return res.status(errorRollback.status || 500).json({
          message: errorRollback.message || 'Error en la transacción',
          details: errorRollback.details,
          code: errorRollback.code,
        });
      }

      // 5. Si todo es exitoso, limpiar archivos temporales
      if (fotoMascotaFile && fs.existsSync(fotoMascotaFile.path)) {
        fs.unlinkSync(fotoMascotaFile.path);
      }
      if (historialMedicoFile && fs.existsSync(historialMedicoFile.path)) {
        fs.unlinkSync(historialMedicoFile.path);
      }

      // 6. Enviar respuesta exitosa
      return res.status(201).json({
        message: 'Usuario y mascota registrados exitosamente',
        datosUsuario: {
          ...usuario,
          mascota: {
            id_mascota: mascota.id_mascota,
          },
        },
      });
    } catch (error) {
      // Manejar cualquier otro error inesperado
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
