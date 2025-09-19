import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  describe,
  test,
  expect,
  beforeEach,
} from '@jest/globals';

const tableHandlers = new Map();

const setSupabaseHandler = (table, operation, handler) => {
  if (!tableHandlers.has(table)) {
    tableHandlers.set(table, {});
  }
  tableHandlers.get(table)[operation] = handler;
};

const clearSupabaseHandlers = () => {
  tableHandlers.clear();
};

const runHandler = (table, operation, context) => {
  const handlers = tableHandlers.get(table) || {};
  const handler = handlers[operation];
  if (!handler) {
    return { data: null, error: null };
  }
  return handler(context);
};

const createBuilder = (table) => {
  const context = {
    table,
    operation: 'select',
    filters: [],
    payload: null,
    selectArgs: null,
    orderArgs: null,
    modifier: null,
  };

  const builder = {
    select(args) {
      context.operation = 'select';
      context.selectArgs = args;
      return builder;
    },
    insert(payload) {
      context.operation = 'insert';
      context.payload = payload;
      return builder;
    },
    update(payload) {
      context.operation = 'update';
      context.payload = payload;
      return builder;
    },
    eq(column, value) {
      context.filters.push({ column, value });
      return builder;
    },
    order(column, options) {
      context.orderArgs = { column, options };
      return builder;
    },
    single() {
      context.modifier = 'single';
      return Promise.resolve(runHandler(table, 'single', context));
    },
    then(onFulfilled, onRejected) {
      const operation = context.modifier === 'single' ? 'single' : context.operation;
      return Promise.resolve(runHandler(table, operation, context)).then(
        onFulfilled,
        onRejected,
      );
    },
  };

  return builder;
};

const supabaseMock = {
  from: (table) => createBuilder(table),
};

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => supabaseMock,
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://localhost';
process.env.SERVICE_ROL_KEY = 'service-role-key';

const { default: app } = await import('../src/app.js');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

const ownerToken = createToken({ userId: 'owner-123', userType: 'owner' });
const vetToken = createToken({ clinicaId: 'clinic-456', userType: 'vet' });

beforeEach(() => {
  clearSupabaseHandlers();
});

describe('Citas/Appointments API Tests con Jest y Supertest', () => {
  test('Agendar nueva cita', async () => {
    setSupabaseHandler('mascotas', 'single', (context) => {
      expect(context.filters).toEqual([{ column: 'id_mascota', value: 22 }]);
      return { data: { id_usuario: 'owner-123' }, error: null };
    });

    setSupabaseHandler('citas', 'insert', (context) => {
      expect(context.payload[0]).toMatchObject({
        id_usuario: 'owner-123',
        id_mascota: 22,
        id_clinica: 'clinic-99',
        id_servicio: 15,
        estado: 'pendiente',
      });
      return { data: [{ id_cita: 10 }], error: null };
    });

    const response = await request(app)
      .post('/appointments/schedule')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        petId: 22,
        serviceId: 15,
        date: '2024-05-05T10:00:00Z',
        timeSlot: '10:00-10:30',
        reason: 'Vacunas',
        notes: 'Recordatorio anual',
        reminderPreference: 'email',
        acceptedTerms: true,
        clinicId: 'clinic-99',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Cita creada exitosamente');
  });

  test('Obtener citas de un usuario', async () => {
    setSupabaseHandler('citas', 'select', () => ({
      data: [
        {
          id_cita: 88,
          id_mascota: 22,
          id_clinica: 'clinic-99',
          fecha_inicio: '2024-05-05T10:00:00Z',
          horario: '10:00-10:30',
          motivo: 'Vacunas',
          estado: 'pendiente',
          notas_adicionales: 'Recordatorio anual',
          mascotas: { nombre: 'Firulais', foto_url: '/images/firu.png' },
          clinicas: { nombre: 'Clínica Central', direccion: 'Calle 123' },
          motivo_reprogramacion: null,
          motivo_cancelacion: null,
        },
      ],
      error: null,
    }));

    const response = await request(app)
      .get('/appointments/user')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.citas).toHaveLength(1);
    expect(response.body.citas[0]).toMatchObject({
      id: 88,
      petName: 'Firulais',
      clinicName: 'Clínica Central',
      status: 'pending',
    });
  });

  test('Obtener citas para una clínica', async () => {
    setSupabaseHandler('citas', 'select', (context) => {
      expect(context.filters).toEqual([{ column: 'id_clinica', value: 'clinic-456' }]);
      return {
        data: [
          {
            id_cita: 101,
            mascotas: { nombre: 'Mishi', foto_url: '/images/mishi.png' },
            usuarios: {
              nombre: 'Carla',
              correo: 'carla@example.com',
              telefono: '555-1234',
            },
            fecha_inicio: '2024-05-06T12:00:00Z',
            horario: '12:00-12:30',
            motivo: 'Control',
            estado: 'confirmada',
            notas_adicionales: 'Llamar antes',
          },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .get('/appointments/clinic')
      .set('Authorization', `Bearer ${vetToken}`);

    expect(response.status).toBe(200);
    expect(response.body.citas[0]).toMatchObject({
      id: 101,
      ownerName: 'Carla',
      status: 'confirmada',
    });
  });

  test('Obtener detalles de una cita específica', async () => {
    setSupabaseHandler('citas', 'single', (context) => {
      expect(context.filters).toEqual([
        { column: 'id_usuario', value: 'owner-123' },
        { column: 'id_cita', value: '101' },
      ]);
      return {
        data: {
          id_cita: '101',
          fecha_inicio: '2024-05-05T10:00:00Z',
          horario: '10:00-10:30',
          motivo: 'Vacunas',
          estado: 'pendiente',
          created_at: '2024-05-01T08:00:00Z',
          mascotas: {
            nombre: 'Firulais',
            especie: 'Perro',
            raza: 'Labrador',
            edad: '5',
            peso: 25,
            foto_url: '/images/firu.png',
          },
          clinicas: {
            nombre: 'Clínica Central',
            direccion: 'Calle 123',
            telefono: '555-1234',
            correo: 'info@clinica.com',
            imagen_url: '/images/clinic.png',
          },
          servicios: { nombre: 'Consulta general', precio: 30, duracion: 30 },
        },
        error: null,
      };
    });

    const response = await request(app)
      .get('/appointments/101')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.appointment).toMatchObject({
      id: '101',
      petName: 'Firulais',
      clinicName: 'Clínica Central',
    });
  });

  test('Actualizar estado de una cita (confirmar)', async () => {
    setSupabaseHandler('citas', 'single', (context) => {
      expect(context.filters).toEqual([
        { column: 'id_cita', value: '202' },
        { column: 'id_clinica', value: 'clinic-456' },
      ]);
      return {
        data: { id_cita: '202', id_clinica: 'clinic-456', trazabilidad: [] },
        error: null,
      };
    });

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({ estado: 'confirmada' });
      return { data: null, error: null };
    });

    const response = await request(app)
      .put('/appointments/202/status')
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ status: 'confirmada' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita confirmada exitosamente');
  });

  test('Actualizar estado de una cita (rechazar)', async () => {
    setSupabaseHandler('citas', 'single', () => ({
      data: { id_cita: '203', id_clinica: 'clinic-456', trazabilidad: [] },
      error: null,
    }));

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({ estado: 'rechazada' });
      return { data: null, error: null };
    });

    const response = await request(app)
      .put('/appointments/203/status')
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ status: 'rechazada', message: 'Conflicto de horario' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita rechazada exitosamente');
  });

  test('Reprogramar una cita', async () => {
    setSupabaseHandler('citas', 'single', (context) => {
      expect(context.filters).toEqual([{ column: 'id_cita', value: '303' }]);
      return {
        data: { id_usuario: 'owner-123', estado: 'pendiente' },
        error: null,
      };
    });

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({
        fecha_inicio: '2024-05-10T09:00:00Z',
        horario: '09:00-09:30',
        motivo_reprogramacion: 'Cambio de agenda',
        estado: 'pendi',
      });
      return { data: null, error: null };
    });

    const response = await request(app)
      .patch('/appointment/303/reschedule')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        date: '2024-05-10T09:00:00Z',
        time: '09:00-09:30',
        reason: 'Cambio de agenda',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita reprogramada exitosamente.');
  });

  test('Editar detalles de una cita', async () => {
    setSupabaseHandler('citas', 'single', () => ({
      data: { id_cita: '404', id_usuario: 'owner-123', trazabilidad: [] },
      error: null,
    }));

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({
        id_servicio: 99,
        notas_adicionales: 'Sin alergias',
      });
      expect(Array.isArray(context.payload.trazabilidad)).toBe(true);
      return { data: null, error: null };
    });

    const response = await request(app)
      .put('/appointments/404/edit')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        serviceId: 99,
        notes: 'Sin alergias',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita editada exitosamente');
  });

  test('Finalizar una cita', async () => {
    setSupabaseHandler('citas', 'single', () => ({
      data: { id_cita: '505', id_clinica: 'clinic-456', trazabilidad: [] },
      error: null,
    }));

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({
        estado: 'finalizada',
        diagnostico: 'Otitis',
      });
      return { data: null, error: null };
    });

    const response = await request(app)
      .put('/appointments/505/finalize')
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ diagnostico: 'Otitis' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita finalizada exitosamente');
  });

  test('Cancelar una cita', async () => {
    setSupabaseHandler('citas', 'single', () => ({
      data: {
        id_usuario: 'owner-123',
        estado: 'pendiente',
        trazabilidad: [],
      },
      error: null,
    }));

    setSupabaseHandler('citas', 'update', (context) => {
      expect(context.payload).toMatchObject({
        estado: 'cancelada',
        motivo_cancelacion: 'Imprevisto',
      });
      return { data: null, error: null };
    });

    const response = await request(app)
      .patch('/appointment/606/cancel')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ reason: 'Imprevisto' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Cita cancelada exitosamente.');
  });

  test('Manejo de acceso no autorizado', async () => {
    const response = await request(app)
      .get('/appointments/user');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token, autorización denegada');
  });

  test('Validación de datos de cita incompletos', async () => {
    const response = await request(app)
      .post('/appointments/schedule')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        petId: 1,
        serviceId: 2,
        timeSlot: '10:00-10:30',
        acceptedTerms: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Datos de cita incompletos o inválidos.');
  });
});
