import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import autenticacionToken from '../middleware/auth.js';
import uploadFile, { deleteFile, getFilePathFromUrl } from '../utils.js';
import dotenv from 'dotenv';
import { escape } from 'querystring';

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const cleanupFiles = (files) => {
  if (!files) return;
  Object.values(files).forEach((fileList) => {
    if (Array.isArray(fileList)) {
      fileList.forEach((file) => {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err)
              console.error(`Error deleting temp file ${file.path}:`, err);
          });
        }
      });
    }
  });
};

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

    // Delete files from storage AFTER successful DB deletion
    try {
      if (mascotaCheck.foto_url) {
        const photoPath = getFilePathFromUrl(
          mascotaCheck.foto_url,
          'fotos-mascotas'
        );
        if (photoPath) await deleteFile(photoPath, 'fotos-mascotas');
      }
      if (mascotaCheck.historial_medico) {
        const historyPath = getFilePathFromUrl(
          mascotaCheck.historial_medico,
          'historiales-mascotas'
        );
        if (historyPath) await deleteFile(historyPath, 'historiales-mascotas');
      }
    } catch (storageError) {
      console.error(
        'Error deleting associated files from storage (DB record deleted successfully):',
        storageError
      );
      // Log error but proceed, as main record is gone
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

//Obtener una mascota con su ID
router.get('/pets/get-a-pet', autenticacionToken, async (req, res) => {
  const id_mascota = req.query.id_mascota;

  try {
    if (!id_mascota) {
      return res.status(400).json({
        message: 'Se requiere el ID de la mascota',
      });
    }

    //obtener datos de la mascota
    const { data: mascota, error } = await supabaseClient
      .from('mascotas')
      .select('*')
      .eq('id_mascota', id_mascota)
      .single();

    if (error) {
      console.error('Error al obtener mascota: ', error);
      return res.status(400).json({
        message: 'Error al obtener la informacion de la mascota',
        error: error.message,
      });
    }

    if (!mascota) {
      return res.status(404).json({
        message: 'Mascota NO encontrada',
      });
    }

    return res.status(200).json({
      message: 'Datos de la mascota obtenidos correctamente',
      mascota: mascota,
    });
  } catch (error) {
    console.error('Error en el servidor', error);
    return res.status(500).json({
      message: 'Internal server error',
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

router.put(
  '/pets/update',
  autenticacionToken,
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'historial', maxCount: 1 },
  ]),
  async (req, res) => {
    const id_usuario = req.query.id_usuario;
    const id_mascota = req.query.id_mascota;
    const { petName, petAge, petBreed, petSpecies, petGender, petWeight } =
      req.body;

    const fotoMascotaFile = req.files?.foto?.[0];
    const historialMedicoFile = req.files?.historial?.[0];

    // --- FIX SCOPE: Declare URLs outside try ---
    let oldFotoUrl = null;
    let oldHistorialUrl = null;
    let newFotoUrl = null; // Initialize as null
    let newHistorialUrl = null; // Initialize as null
    let fotoUploadedInThisRequest = false; // Track if a new file was actually uploaded
    let historialUploadedInThisRequest = false;

    try {
      console.log('Datos recibidos para UPDATE:', req.body);
      console.log('Archivos recibidos para UPDATE:', req.files);
      console.log('Query params UPDATE:', req.query);

      if (!id_usuario || !id_mascota) {
        cleanupFiles(req.files);
        return res
          .status(400)
          .json({ message: 'Faltan id_usuario o id_mascota en la consulta.' });
      }

      const { data: existingPet, error: fetchError } = await supabaseClient
        .from('mascotas')
        .select(
          'id_mascota, id_usuario, foto_url, historial_medico, nombre, edad, raza, especie, genero, peso'
        ) // Select all fields for comparison
        .eq('id_mascota', id_mascota)
        .eq('id_usuario', id_usuario)
        .single();

      if (fetchError || !existingPet) {
        cleanupFiles(req.files);
        console.error(
          'Error fetching pet for update or not found/unauthorized:',
          fetchError
        );
        return res.status(404).json({
          message: 'Mascota no encontrada o no pertenece al usuario.',
        });
      }

      // Assign old URLs, these will be the defaults if no new file is uploaded
      oldFotoUrl = existingPet.foto_url;
      oldHistorialUrl = existingPet.historial_medico;
      newFotoUrl = oldFotoUrl; // Initialize new URLs with old ones
      newHistorialUrl = oldHistorialUrl;

      // --- Handle Foto Upload ---
      if (fotoMascotaFile) {
        console.log('Uploading new photo...');
        const uploadedUrl = await uploadFile(fotoMascotaFile, 'fotos-mascotas');
        if (uploadedUrl) {
          newFotoUrl = uploadedUrl; // Update URL on successful upload
          fotoUploadedInThisRequest = true;
          console.log('New photo URL:', newFotoUrl);
          // Delete old photo *after* successful upload of new one
          if (oldFotoUrl) {
            const oldPath = getFilePathFromUrl(oldFotoUrl, 'fotos-mascotas'); // Use imported function
            if (oldPath) {
              console.log('Deleting old photo:', oldPath);
              await deleteFile(oldPath, 'fotos-mascotas'); // Use imported function
            }
          }
        } else {
          console.warn(
            'Photo upload failed. Will attempt to keep the old photo URL if it exists.'
          );
          // newFotoUrl remains oldFotoUrl
        }
      }

      // --- Handle Historial Upload ---
      if (historialMedicoFile) {
        console.log('Uploading new history...');
        const uploadedUrl = await uploadFile(
          historialMedicoFile,
          'historiales-mascotas'
        );
        if (uploadedUrl) {
          newHistorialUrl = uploadedUrl; // Update URL on successful upload
          historialUploadedInThisRequest = true;
          console.log('New history URL:', newHistorialUrl);
          // Delete old history *after* successful upload of new one
          if (oldHistorialUrl) {
            const oldPath = getFilePathFromUrl(
              oldHistorialUrl,
              'historiales-mascotas'
            ); // Use imported function
            if (oldPath) {
              console.log('Deleting old history:', oldPath);
              await deleteFile(oldPath, 'historiales-mascotas'); // Use imported function
            }
          }
        } else {
          console.warn(
            'History upload failed. Will attempt to keep the old history URL if it exists.'
          );
          // newHistorialUrl remains oldHistorialUrl
        }
      }

      // Prepare update data object - compare with existingPet data
      const updateData = {};
      if (petName !== undefined && petName !== existingPet.nombre)
        updateData.nombre = petName;
      // Ensure comparison with number type
      const petAgeNum = petAge !== undefined ? parseInt(petAge, 10) : undefined;
      if (
        petAgeNum !== undefined &&
        !isNaN(petAgeNum) &&
        petAgeNum !== existingPet.edad
      )
        updateData.edad = petAgeNum;
      if (petBreed !== undefined && petBreed !== existingPet.raza)
        updateData.raza = petBreed;
      if (petSpecies !== undefined && petSpecies !== existingPet.especie)
        updateData.especie = petSpecies;
      if (petGender !== undefined && petGender !== existingPet.genero)
        updateData.genero = petGender;
      // Ensure comparison with number type
      const petWeightNum =
        petWeight !== undefined ? parseFloat(petWeight) : undefined;
      if (
        petWeightNum !== undefined &&
        !isNaN(petWeightNum) &&
        petWeightNum !== existingPet.peso
      )
        updateData.peso = petWeightNum;

      // Update URLs only if they actually changed during this request
      if (newFotoUrl !== oldFotoUrl) updateData.foto_url = newFotoUrl;
      if (newHistorialUrl !== oldHistorialUrl)
        updateData.historial_medico = newHistorialUrl;

      if (Object.keys(updateData).length === 0) {
        cleanupFiles(req.files);
        console.log('No actual data changes detected for update.');
        return res.status(200).json({
          message: 'No se detectaron cambios para actualizar.',
          mascota: existingPet, // Return existing data fetched earlier
        });
      }

      console.log('Data to update in DB:', updateData);

      const { data: updatedPetData, error: updateError } = await supabaseClient
        .from('mascotas')
        .update(updateData)
        .eq('id_mascota', id_mascota)
        .eq('id_usuario', id_usuario)
        .select('*') // Select updated data
        .single();

      if (updateError) {
        console.error('Error updating pet in DB:', updateError);
        // Attempt to revert file changes ONLY if a new file was uploaded in *this* request
        try {
          if (fotoUploadedInThisRequest && newFotoUrl) {
            const uploadedPath = getFilePathFromUrl(
              newFotoUrl,
              'fotos-mascotas'
            );
            if (uploadedPath) await deleteFile(uploadedPath, 'fotos-mascotas');
          }
          if (historialUploadedInThisRequest && newHistorialUrl) {
            const uploadedPath = getFilePathFromUrl(
              newHistorialUrl,
              'historiales-mascotas'
            );
            if (uploadedPath)
              await deleteFile(uploadedPath, 'historiales-mascotas');
          }
        } catch (revertError) {
          console.error(
            'Error attempting to revert file uploads after DB update failure:',
            revertError
          );
        }
        cleanupFiles(req.files); // Clean local files regardless of revert attempt
        return res.status(400).json({
          message:
            'Error al actualizar la mascota en la base de datos: ' +
            updateError.message,
        });
      }

      cleanupFiles(req.files); // Clean up local temp files on success

      return res.status(200).json({
        message: 'Mascota actualizada exitosamente',
        mascota: updatedPetData,
      });
    } catch (error) {
      console.error('Error inesperado en UPDATE:', error);
      // Use the URLs declared outside the try block
      try {
        // Delete newly uploaded files only if they were uploaded in *this* request
        if (fotoUploadedInThisRequest && newFotoUrl) {
          const uploadedPath = getFilePathFromUrl(newFotoUrl, 'fotos-mascotas');
          if (uploadedPath) await deleteFile(uploadedPath, 'fotos-mascotas');
        }
        if (historialUploadedInThisRequest && newHistorialUrl) {
          const uploadedPath = getFilePathFromUrl(
            newHistorialUrl,
            'historiales-mascotas'
          );
          if (uploadedPath)
            await deleteFile(uploadedPath, 'historiales-mascotas');
        }
      } catch (cleanupError) {
        console.error(
          'Error during error cleanup of uploaded files:',
          cleanupError
        );
      } finally {
        cleanupFiles(req.files); // Always cleanup local files
      }
      return res.status(500).json({
        message:
          'Error en el servidor: ' + (error.message || 'Error desconocido'),
      });
    }
  }
);

export default router;
