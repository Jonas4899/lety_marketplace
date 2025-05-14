import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Endpoint para registrar un horario de atención de una clínica veterinaria
router.post('/register/schedule', async (req, res) => {
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
router.post('/register/schedules', async (req, res) => {
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

export default router;
