import uploadFile from './utils.js';
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

app.post(
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

// Endpoint para registrar un servicio de una clínica veterinaria
app.post('/register/service', async (req, res) => {
  try {
    console.log('Recibiendo solicitud para registrar servicio');

    const { id_clinica, nombre, precio, categoria } = req.body;

    // Validación de campos requeridos
    if (!id_clinica || !nombre || !precio || !categoria) {
      return res.status(400).json({
        message:
          'Todos los campos obligatorios deben ser proporcionados (id_clinica, nombre, precio, categoria).',
      });
    }

    // Validar que el precio sea un número
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico)) {
      return res.status(400).json({
        message: 'El precio debe ser un valor numérico.',
      });
    }

    // Por defecto los servicios están disponibles y descripción vacía
    const descripcion = '';
    const disponible = true;

    console.log('Insertando servicio en la base de datos...');
    const { data: servicio, error: errorServicio } = await supabaseClient
      .from('servicios')
      .insert([
        {
          id_clinica,
          nombre,
          descripcion,
          precio: precioNumerico,
          categoria,
          disponible,
        },
      ])
      .select()
      .single();

    if (errorServicio) {
      console.error('Error de Supabase:', errorServicio);
      return res.status(400).json({
        message: 'Error al registrar el servicio: ' + errorServicio.message,
      });
    }

    console.log('Servicio registrado con éxito:', servicio);

    res.status(201).json({
      message: 'Servicio registrado exitosamente',
      servicio,
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor: ' + error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

// Endpoint para registrar múltiples servicios de una clínica veterinaria
app.post('/register/services', async (req, res) => {
  try {
    console.log('Recibiendo solicitud para registrar múltiples servicios');

    const { id_clinica, servicios } = req.body;

    // Validación de campos requeridos
    if (
      !id_clinica ||
      !servicios ||
      !Array.isArray(servicios) ||
      servicios.length === 0
    ) {
      return res.status(400).json({
        message:
          'Se requiere un id_clinica válido y un array de servicios no vacío.',
      });
    }

    // Preparar array para inserción múltiple
    const serviciosAInsertar = servicios.map((servicio) => {
      // Validar cada servicio
      if (!servicio.nombre || !servicio.precio || !servicio.categoria) {
        throw new Error('Cada servicio debe tener nombre, precio y categoría');
      }

      // Convertir precio a número
      const precioNumerico = parseFloat(servicio.precio);
      if (isNaN(precioNumerico)) {
        throw new Error(
          `El precio '${servicio.precio}' para el servicio '${servicio.nombre}' no es válido`
        );
      }

      return {
        id_clinica,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || '',
        precio: precioNumerico,
        categoria: servicio.categoria,
        disponible: true,
      };
    });

    console.log('Insertando servicios en la base de datos...');
    const { data: serviciosRegistrados, error: errorServicios } =
      await supabaseClient
        .from('servicios')
        .insert(serviciosAInsertar)
        .select();

    if (errorServicios) {
      console.error('Error de Supabase:', errorServicios);
      return res.status(400).json({
        message: 'Error al registrar los servicios: ' + errorServicios.message,
      });
    }

    console.log(
      `${serviciosRegistrados.length} servicios registrados con éxito`
    );

    res.status(201).json({
      message: `${serviciosRegistrados.length} servicios registrados exitosamente`,
      servicios: serviciosRegistrados,
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor: ' + error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

// Endpoint para registrar un horario de atención de una clínica veterinaria
app.post('/register/schedule', async (req, res) => {
  try {
    console.log('Recibiendo solicitud para registrar horario de atención');

    const {
      id_clinica,
      dia_semana,
      hora_apertura,
      hora_cierre,
      es_24h,
      esta_cerrado,
    } = req.body;

    // Validación de campos requeridos
    if (!id_clinica || !dia_semana) {
      return res.status(400).json({
        message: 'Los campos id_clinica y dia_semana son obligatorios.',
      });
    }

    // Validación de día de la semana
    const diasValidos = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    if (!diasValidos.includes(dia_semana)) {
      return res.status(400).json({
        message:
          'El día de la semana debe ser uno de los siguientes valores: ' +
          diasValidos.join(', '),
      });
    }

    // Si no está cerrado ni es 24h, validar horas
    if (!esta_cerrado && !es_24h) {
      if (!hora_apertura || !hora_cierre) {
        return res.status(400).json({
          message:
            'Si el local no está cerrado y no es 24h, se requieren hora_apertura y hora_cierre.',
        });
      }
    }

    // Crear objeto de horario
    let horarioData = {
      id_clinica,
      dia_semana,
      es_24h: es_24h || false,
      esta_cerrado: esta_cerrado || false,
    };

    // Asignar horas según el caso
    if (es_24h) {
      horarioData.hora_apertura = '00:00:00';
      horarioData.hora_cierre = '23:59:59';
    } else if (esta_cerrado) {
      horarioData.hora_apertura = null;
      horarioData.hora_cierre = null;
    } else {
      horarioData.hora_apertura = hora_apertura;
      horarioData.hora_cierre = hora_cierre;
    }

    console.log('Insertando horario en la base de datos:', horarioData);

    // Insertar en la base de datos
    const { data: horario, error: errorHorario } = await supabaseClient
      .from('horarios_atencion')
      .insert([horarioData])
      .select()
      .single();

    if (errorHorario) {
      console.error('Error de Supabase:', errorHorario);
      return res.status(400).json({
        message: 'Error al registrar el horario: ' + errorHorario.message,
      });
    }

    console.log('Horario registrado con éxito:', horario);

    res.status(201).json({
      message: 'Horario registrado exitosamente',
      horario,
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor: ' + error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

// Endpoint para registrar múltiples horarios de atención de una clínica veterinaria
app.post('/register/schedules', async (req, res) => {
  try {
    console.log('Recibiendo solicitud para registrar múltiples horarios');

    const { id_clinica, horarios } = req.body;

    // Validación de campos requeridos
    if (
      !id_clinica ||
      !horarios ||
      !Array.isArray(horarios) ||
      horarios.length === 0
    ) {
      return res.status(400).json({
        message:
          'Se requiere un id_clinica válido y un array de horarios no vacío.',
      });
    }

    // Preparar array para inserción múltiple
    const horariosAInsertar = [];

    // Validación de días de la semana
    const diasValidos = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    // Procesar cada horario
    for (const horario of horarios) {
      const { dia_semana, hora_apertura, hora_cierre, es_24h, esta_cerrado } =
        horario;

      // Validar día de la semana
      if (!dia_semana || !diasValidos.includes(dia_semana)) {
        throw new Error(
          `Día de la semana inválido: ${dia_semana}. Debe ser uno de: ${diasValidos.join(
            ', '
          )}`
        );
      }

      // Crear objeto de horario
      let horarioData = {
        id_clinica,
        dia_semana,
        es_24h: es_24h || false,
        esta_cerrado: esta_cerrado || false,
      };

      // Asignar horas según el caso
      if (es_24h) {
        horarioData.hora_apertura = '00:00:00';
        horarioData.hora_cierre = '23:59:59';
      } else if (esta_cerrado) {
        horarioData.hora_apertura = null;
        horarioData.hora_cierre = null;
      } else {
        // Validar que hay horas de apertura y cierre
        if (!hora_apertura || !hora_cierre) {
          throw new Error(
            `Para el día ${dia_semana}: Si no está cerrado y no es 24h, se requieren hora_apertura y hora_cierre.`
          );
        }
        horarioData.hora_apertura = hora_apertura;
        horarioData.hora_cierre = hora_cierre;
      }

      horariosAInsertar.push(horarioData);
    }

    console.log(
      `Insertando ${horariosAInsertar.length} horarios en la base de datos...`
    );

    // Insertar en la base de datos
    const { data: horariosRegistrados, error: errorHorarios } =
      await supabaseClient
        .from('horarios_atencion')
        .insert(horariosAInsertar)
        .select();

    if (errorHorarios) {
      console.error('Error de Supabase:', errorHorarios);
      return res.status(400).json({
        message: 'Error al registrar los horarios: ' + errorHorarios.message,
      });
    }

    console.log(`${horariosRegistrados.length} horarios registrados con éxito`);

    res.status(201).json({
      message: `${horariosRegistrados.length} horarios registrados exitosamente`,
      horarios: horariosRegistrados,
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor: ' + error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}
export default app;
