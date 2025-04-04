import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcrypt';
import path from 'path';
import fs, { Dirent } from 'fs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Configurar variables de entorno
dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173', // URL de tu frontend
    credentials: true, // Permitir cookies
  })
);

// Middleware para manejar cookies
app.use(cookieParser());

app.use(express.json());

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

//Configurar multer para subir archivos
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

//Configurar JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar token para rutas protegidas
const autenticacionToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Token de autenticacion requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    req.user = user; // Guardar la información del usuario en la solicitud
    next(); // Continuar con la siguiente función de middleware
  });
};

const upload = multer({ storage }); //Inicializar multer con la configuración de storage

//Endpoint para registrar usuarios dueños de las mascotas junto con su mascota ---------------------------
app.post(
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

      // Función para subir archivos a Supabase Storage
      const uploadFile = async (file, bucket) => {
        if (!file) return null; // Verifica si hay archivo antes de continuar

        const filePath = `${bucket}/${Date.now()}-${file.originalname}`; // Ruta de donde se guardará el archivo

        const { data, error } = await supabaseClient.storage
          .from(bucket)
          .upload(filePath, fs.createReadStream(file.path), {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
            duplex: 'half',
          });

        if (error) throw error;

        // Obtener la URL pública del archivo subido
        const { data: urlData } = supabaseClient.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return urlData.publicUrl;
      };

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
        return res.status(400).json({
          message: 'Error al registrar la mascota:' + errorMascota.message,
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

//Login de usuarios
app.post('/owner/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Email:', email);
  console.log('Contra: ', password);
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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    });

    //enviar respuesta con el token y los datos del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
      },
      mascotas: mascotas || [],
    });
  } catch (error) {
    console.error('Error en el inicio de sesion:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/vet/login', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
