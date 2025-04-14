import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Endpoint para registrar un servicio de una clínica veterinaria
router.post('/register/service', async (req, res) => {
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
router.post('/register/services', async (req, res) => {
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

export default router;
