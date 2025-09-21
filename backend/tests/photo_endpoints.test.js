import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  setupSupabaseMock,
  setupUtilsMock,
  setSupabaseHandler,
  clearSupabaseHandlers,
  setStorageHandler,
  uploadFileMock,
} from './helpers/supabaseMock.js';

await setupSupabaseMock();
await setupUtilsMock();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://localhost';
process.env.SERVICE_ROL_KEY = 'service-role-key';

const { default: app } = await import('../src/app.js');

const vetToken = jwt.sign(
  { clinicaId: 'clinic-123', userType: 'vet' },
  process.env.JWT_SECRET
);

beforeEach(() => {
  clearSupabaseHandlers();
  uploadFileMock.mockResolvedValue(null);
});

describe('Veterinary Photos API Tests', () => {
  test('Upload photo to veterinary profile', async () => {
    uploadFileMock.mockResolvedValue(
      'https://storage.test/veterinary-photos/new-photo.jpg'
    );

    setSupabaseHandler('clinicas', 'single', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_clinica', value: 'clinic-123' },
      ]);
      return { data: { id_clinica: 'clinic-123' }, error: null };
    });

    setSupabaseHandler('fotos_clinicas', 'update', (context) => {
      if (context.payload && context.payload.es_principal === false) {
        expect(context.filters).toEqual([
          { type: 'eq', column: 'id_clinica', value: 'clinic-123' },
        ]);
        return { data: null, error: null };
      }

      expect(context.payload).toMatchObject({
        titulo: 'Sala de espera',
        tipo: 'interior',
        es_principal: true,
      });
      return {
        data: [
          {
            id_foto: 'photo-1',
            titulo: 'Sala de espera',
            es_principal: true,
            url: 'https://storage.test/veterinary-photos/new-photo.jpg',
          },
        ],
        error: null,
      };
    });

    setSupabaseHandler('fotos_clinicas', 'insert', (context) => {
      expect(context.payload[0]).toMatchObject({
        id_clinica: 'clinic-123',
        titulo: 'Sala de espera',
        tipo: 'interior',
        es_principal: true,
      });
      return {
        data: [
          {
            id_foto: 'photo-1',
            titulo: 'Sala de espera',
            url: 'https://storage.test/veterinary-photos/new-photo.jpg',
          },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .post('/veterinary/photos/upload/clinic-123')
      .set('Authorization', `Bearer ${vetToken}`)
      .field('title', 'Sala de espera')
      .field('type', 'interior')
      .field('isPrimary', 'true')
      .attach('foto', Buffer.from('photo-bytes'), 'photo.jpg');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Foto subida exitosamente');
    expect(uploadFileMock).toHaveBeenCalledWith(
      expect.objectContaining({ originalname: 'photo.jpg' }),
      'veterinary-photos'
    );
  });

  test('Get photos for veterinary clinic', async () => {
    setSupabaseHandler('clinicas', 'single', () => ({
      data: { id_clinica: 'clinic-123' },
      error: null,
    }));

    setSupabaseHandler('fotos_clinicas', 'select', (context) => {
      expect(context.orderArgs).toEqual([
        { column: 'es_principal', options: { ascending: false } },
        { column: 'created_at', options: { ascending: false } },
      ]);
      return {
        data: [
          { id_foto: 1, titulo: 'Frontis' },
          { id_foto: 2, titulo: 'Sala' },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .get('/veterinary/photos/clinic-123')
      .set('Authorization', `Bearer ${vetToken}`);

    expect(response.status).toBe(200);
    expect(response.body.fotos).toHaveLength(2);
  });

  test('Update photo information and set as primary', async () => {
    setSupabaseHandler('fotos_clinicas', 'single', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_foto', value: 'photo-1' },
      ]);
      return {
        data: { id_clinica: 'clinic-123' },
        error: null,
      };
    });

    const updateCalls = [];
    setSupabaseHandler('fotos_clinicas', 'update', (context) => {
      updateCalls.push(context);
      if (context.payload && context.payload.es_principal === false) {
        return { data: null, error: null };
      }
      return {
        data: [
          {
            id_foto: 'photo-1',
            titulo: 'Recepción',
            es_principal: true,
          },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .put('/veterinary/photos/photo-1')
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ title: 'Recepción', type: 'interior', isPrimary: true });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Foto actualizada exitosamente');
    expect(updateCalls).toHaveLength(2);
  });

  test('Delete uploaded photo', async () => {
    setSupabaseHandler('fotos_clinicas', 'single', () => ({
      data: {
        id_foto: 'photo-1',
        url: 'https://storage.test/veterinary-photos/existing.jpg',
      },
      error: null,
    }));

    setSupabaseHandler('fotos_clinicas', 'delete', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_foto', value: 'photo-1' },
      ]);
      return { data: null, error: null };
    });

    const removeCalls = [];
    setStorageHandler('veterinary-photos', 'remove', ({ paths }) => {
      removeCalls.push(paths);
      return { data: null, error: null };
    });

    const response = await request(app)
      .delete('/veterinary/photos/photo-1')
      .set('Authorization', `Bearer ${vetToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Foto eliminada exitosamente');
    expect(removeCalls).toHaveLength(1);
    expect(removeCalls[0]).toEqual(['existing.jpg']);
  });

  test('Handle unauthorized access', async () => {
    const response = await request(app).get('/veterinary/photos/clinic-123');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token, autorización denegada');
  });
});
