import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
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

// Registro de clínica veterinaria
router.post(
  '/register/veterinary',
  upload.single('certificadoSalud'),
  async (req, res) => {
    try {
      console.log('Recibiendo solicitud de registro de veterinaria');

      const {
        nombre,
        direccion,
        telefono,
        correo,
        contrasena,
        descripcion,
        NIT,
        servicios: serviciosString,
      } = req.body;

      console.log('Datos recibidos:', {
        nombre,
        direccion,
        telefono,
        correo,
        contrasenaRecibida: !!contrasena,
        descripcion,
        NIT,
        serviciosRecibidos: !!serviciosString,
      });

      // Validación de campos vacios
      if (
        !nombre ||
        !direccion ||
        !telefono ||
        !correo ||
        !contrasena ||
        !NIT
      ) {
        console.log('Campos obligatorios faltantes');
        return res.status(400).json({
          message: 'Todos los campos obligatorios deben ser proporcionados.',
        });
      }

      // Parsear los servicios si existen
      let servicios = [];
      if (serviciosString) {
        try {
          servicios = JSON.parse(serviciosString);
          console.log('Servicios parseados:', servicios);
        } catch (parseError) {
          console.error('Error al parsear servicios:', parseError);
          return res.status(400).json({
            message: 'Error al procesar los servicios: formato inválido',
          });
        }
      }

      // Obtener el archivo del certificado
      const certificadoFile = req.file;
      console.log(
        'Certificado file:',
        certificadoFile
          ? {
              filename: certificadoFile.filename,
              size: certificadoFile.size,
              mimetype: certificadoFile.mimetype,
            }
          : 'No se recibió archivo'
      );

      // Verificar las variables de entorno de Supabase
      console.log('Variables de Supabase:', {
        urlDefinida: !!supabaseUrl,
        keyDefinida: !!supabaseServiceRolKey,
        clienteDefinido: !!supabaseClient,
      });

      // Verificar que supabaseClient esté definido
      if (!supabaseClient) {
        console.error('Error: supabaseClient no está definido');
        return res.status(500).json({
          message:
            'Error de configuración del servidor: Cliente de base de datos no disponible',
        });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      const estado = 'confirmado';
      const fecha_registro = new Date();

      // Subir el archivo del certificado a Supabase
      let certificado_url = null;
      if (certificadoFile) {
        try {
          certificado_url = await uploadFile(
            certificadoFile,
            'certificados-secretaria-salud'
          );
          console.log('URL del certificado:', certificado_url);
        } catch (uploadError) {
          console.error('Error al subir el archivo:', uploadError);
          return res.status(500).json({
            message: 'Error al procesar el archivo: ' + uploadError.message,
          });
        }
      }

      // Insercion en la tabla clinicas
      console.log('Insertando datos en Supabase...');
      const { data: clinica, error: errorClinica } = await supabaseClient
        .from('clinicas')
        .insert([
          {
            nombre,
            direccion,
            telefono,
            correo,
            contrasena: hashedPassword,
            descripcion,
            NIT,
            estado,
            fecha_registro,
            certificado_url,
          },
        ])
        .select('id_clinica')
        .single();

      if (errorClinica) {
        console.error('Error de Supabase:', errorClinica);
        return res.status(400).json({
          message: 'Error al registrar la clínica: ' + errorClinica.message,
        });
      }

      console.log('Clínica registrada con éxito:', clinica);

      // Registrar servicios si existen
      let serviciosRegistrados = [];
      if (servicios && servicios.length > 0) {
        console.log(
          `Registrando ${servicios.length} servicios para la clínica ${clinica.id_clinica}`
        );

        try {
          // Filtrar servicios válidos (con nombre y precio)
          const serviciosValidos = servicios.filter(
            (servicio) => servicio.name && servicio.price
          );

          if (serviciosValidos.length > 0) {
            // Preparar servicios para inserción
            const serviciosAInsertar = serviciosValidos.map((servicio) => {
              const precioNumerico = parseFloat(servicio.price);
              return {
                id_clinica: clinica.id_clinica,
                nombre: servicio.name,
                descripcion: '',
                precio: isNaN(precioNumerico) ? 0 : precioNumerico,
                categoria: servicio.category || 'general',
                disponible: true,
              };
            });

            // Insertar servicios
            const { data, error } = await supabaseClient
              .from('servicios')
              .insert(serviciosAInsertar)
              .select();

            if (error) {
              console.error('Error al registrar servicios:', error);
            } else {
              console.log(`${data.length} servicios registrados con éxito`);
              serviciosRegistrados = data;
            }
          } else {
            console.log('No hay servicios válidos para registrar');
          }
        } catch (serviciosError) {
          console.error('Error al procesar los servicios:', serviciosError);
          // No interrumpimos el flujo por un error en los servicios
        }
      }

      // Limpiar el archivo temporal
      if (certificadoFile) {
        try {
          fs.unlinkSync(certificadoFile.path);
        } catch (unlinkError) {
          console.warn('No se pudo eliminar el archivo temporal:', unlinkError);
        }
      }

      res.status(201).json({
        message: 'Clínica registrada exitosamente',
        datosClinica: clinica,
        servicios: serviciosRegistrados,
      });
    } catch (error) {
      console.error('Error interno del servidor:', error);

      // Limpiar el archivo temporal en caso de error
      try {
        const certificadoFile = req.file;
        if (certificadoFile && fs.existsSync(certificadoFile.path)) {
          fs.unlinkSync(certificadoFile.path);
        }
      } catch (cleanupError) {
        console.warn('Error al limpiar archivos temporales:', cleanupError);
      }

      res.status(500).json({
        message: 'Error interno del servidor: ' + error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      });
    }
  }
);

// Endpoint: Obtener todas las clínicas veterinarias
router.get('/clinics', async (req, res) => {
  try {
    console.log('Obteniendo clínicas registradas...');

    const { data: clinicas, error } = await supabaseClient
      .from('clinicas')
      .select('id_clinica, nombre, direccion, telefono, correo, certificado_url');

    if (error) {
      console.error('Error consultando clínicas:', error);
      return res.status(400).json({ message: 'Error al obtener clínicas: ' + error.message });
    }

    res.status(200).json({
      message: 'Clínicas obtenidas exitosamente',
      clinicas,
    });
  } catch (error) {
    console.error('Error interno al obtener clínicas:', error);
    res.status(500).json({ message: 'Error interno: ' + error.message });
  }
});

export default router;
