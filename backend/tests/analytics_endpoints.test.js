import request from 'supertest';
import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  setupSupabaseMock,
  setupUtilsMock,
  setSupabaseHandler,
  clearSupabaseHandlers,
} from './helpers/supabaseMock.js';

await setupSupabaseMock();
await setupUtilsMock();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://localhost';
process.env.SERVICE_ROL_KEY = 'service-role-key';

const { default: app } = await import('../src/app.js');

beforeEach(() => {
  clearSupabaseHandlers();
});

describe('Analytics API Endpoints', () => {
  test('should return appointment statistics summary', async () => {
    setSupabaseHandler('clinicas', 'single', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_clinica', value: '1' },
      ]);
      return { data: { id_clinica: '1' }, error: null };
    });

    setSupabaseHandler('citas', 'select', (context) => {
      if (context.selectArgs === 'id_cita') {
        return {
          data: [{ id_cita: 1 }, { id_cita: 2 }, { id_cita: 3 }],
          error: null,
        };
      }

      if (context.selectArgs === 'estado') {
        return {
          data: [
            { estado: 'completada' },
            { estado: 'programada' },
            { estado: 'cancelada' },
            { estado: 'finalizada' },
          ],
          error: null,
        };
      }

      if (context.selectArgs === 'fecha_inicio, estado') {
        expect(context.orderArgs).toEqual([
          { column: 'fecha_inicio', options: { ascending: true } },
        ]);
        return {
          data: [
            { fecha_inicio: '2024-05-01T10:00:00Z', estado: 'completada' },
            { fecha_inicio: '2024-05-01T12:00:00Z', estado: 'programada' },
            { fecha_inicio: '2024-05-02T09:00:00Z', estado: 'cancelada' },
          ],
          error: null,
        };
      }

      throw new Error(`Unexpected selectArgs: ${context.selectArgs}`);
    });

    const response = await request(app).get(
      '/api/analytics/appointments/1?from_date=2024-05-01&to_date=2024-05-31'
    );

    expect(response.status).toBe(200);
    expect(response.body.totalAppointments).toBe(3);
    expect(response.body.statusDistribution).toEqual([
      { name: 'Completadas', value: 2 },
      { name: 'Programadas', value: 1 },
      { name: 'Canceladas', value: 1 },
    ]);
    expect(response.body.appointmentsByDate).toEqual([
      {
        date: '2024-05-01',
        total: 2,
        completed: 1,
        scheduled: 1,
        cancelled: 0,
      },
      {
        date: '2024-05-02',
        total: 1,
        completed: 0,
        scheduled: 0,
        cancelled: 1,
      },
    ]);
  });

  test('should return services analytics using RPC results', async () => {
    setSupabaseHandler('clinicas', 'single', () => ({
      data: { id_clinica: '2' },
      error: null,
    }));

    setSupabaseHandler('rpc:get_top_services', 'rpc', ({ params }) => {
      expect(params).toMatchObject({ clinica_id: '2' });
      return {
        data: [
          {
            nombre_servicio: 'Consulta',
            total_citas: 5,
            ingreso_total: 250,
            precio: 50,
          },
          {
            nombre_servicio: 'Vacunación',
            total_citas: 3,
            ingreso_total: 180,
            precio: 60,
          },
        ],
        error: null,
      };
    });

    const response = await request(app).get(
      '/api/analytics/services/2?from_date=2024-01-01&to_date=2024-01-31'
    );

    expect(response.status).toBe(200);
    expect(response.body.topServices).toEqual([
      { name: 'Consulta', value: 5 },
      { name: 'Vacunación', value: 3 },
    ]);
    expect(response.body.servicesRevenue).toEqual([
      { name: 'Consulta', value: 5, revenue: 250 },
      { name: 'Vacunación', value: 3, revenue: 180 },
    ]);
  });

  test('should handle invalid date range input', async () => {
    const response = await request(app).get(
      '/api/analytics/appointments/1?from_date=invalid-date'
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Formato de fecha inválido');
  });

  test('should return 404 when clinic is not found', async () => {
    setSupabaseHandler('clinicas', 'single', () => ({
      data: null,
      error: { message: 'not found' },
    }));

    const response = await request(app).get(
      '/api/analytics/appointments/999?from_date=2024-05-01'
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Clínica no encontrada');
  });
});
