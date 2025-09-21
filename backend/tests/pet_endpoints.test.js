import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import {
  setupSupabaseMock,
  setupUtilsMock,
  setSupabaseHandler,
  clearSupabaseHandlers,
  uploadFileMock,
  deleteFileMock,
  getFilePathFromUrlMock,
} from './helpers/supabaseMock.js';

await setupSupabaseMock();
await setupUtilsMock();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://localhost';
process.env.SERVICE_ROL_KEY = 'service-role-key';

const { default: app } = await import('../src/app.js');

const ownerToken = jwt.sign(
  { userId: 'owner-001', userType: 'owner' },
  process.env.JWT_SECRET
);

beforeEach(() => {
  clearSupabaseHandlers();
  uploadFileMock.mockResolvedValue(null);
  deleteFileMock.mockResolvedValue(true);
  getFilePathFromUrlMock.mockImplementation(() => null);
});

describe('Mascotas API Tests', () => {
  test('Registrar nueva mascota', async () => {
    uploadFileMock.mockImplementation(async (file, bucket) => {
      if (!file) return null;
      return `https://storage.test/${bucket}/${file.originalname}`;
    });

    setSupabaseHandler('mascotas', 'insert', (context) => {
      expect(context.payload[0]).toMatchObject({
        nombre: 'Firulais',
        edad: 5,
        raza: 'Labrador',
        especie: 'Perro',
        genero: 'Macho',
        peso: 25,
        id_usuario: 'owner-001',
      });
      return {
        data: [
          {
            id_mascota: 10,
            nombre: 'Firulais',
            foto_url: 'https://storage.test/fotos-mascotas/Firulais.jpg',
          },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .post('/pets/add?id_usuario=owner-001')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('petName', 'Firulais')
      .field('petAge', '5')
      .field('petBreed', 'Labrador')
      .field('petSpecies', 'Perro')
      .field('petGender', 'Macho')
      .field('petWeight', '25')
      .attach('foto', Buffer.from('fake-image'), 'firulais.jpg')
      .attach('historial', Buffer.from('medical-history'), 'history.pdf');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Mascota registrada exitosamente');
    expect(uploadFileMock).toHaveBeenCalledWith(
      expect.objectContaining({ originalname: 'firulais.jpg' }),
      'fotos-mascotas'
    );
    expect(uploadFileMock).toHaveBeenCalledWith(
      expect.objectContaining({ originalname: 'history.pdf' }),
      'historiales-mascotas'
    );
  });

  test('Obtener mascotas de un usuario', async () => {
    setSupabaseHandler('mascotas', 'select', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_usuario', value: 'owner-001' },
      ]);
      return {
        data: [
          { id_mascota: 1, nombre: 'Firulais' },
          { id_mascota: 2, nombre: 'Mishi' },
        ],
        error: null,
      };
    });

    const response = await request(app)
      .get('/pets/get?id_usuario=owner-001')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.mascotas).toHaveLength(2);
  });

  test('Obtener detalle de una mascota específica', async () => {
    setSupabaseHandler('mascotas', 'single', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_mascota', value: '22' },
      ]);
      return {
        data: { id_mascota: 22, nombre: 'Firulais', edad: 5 },
        error: null,
      };
    });

    const response = await request(app)
      .get('/pets/get-a-pet?id_mascota=22')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.mascota).toMatchObject({ nombre: 'Firulais' });
  });

  test('Actualizar información de mascota con nueva foto e historial', async () => {
    uploadFileMock.mockImplementation(async (file, bucket) =>
      `https://storage.test/${bucket}/${file.originalname}`
    );
    getFilePathFromUrlMock.mockImplementation((url) => url.split('/').pop());
    deleteFileMock.mockResolvedValue(true);

    setSupabaseHandler('mascotas', 'single', () => ({
      data: {
        id_mascota: '22',
        id_usuario: 'owner-001',
        nombre: 'Firulais',
        edad: 5,
        raza: 'Labrador',
        especie: 'Perro',
        genero: 'Macho',
        peso: 25,
        foto_url: 'https://storage.test/fotos-mascotas/old.jpg',
        historial_medico: 'https://storage.test/historiales-mascotas/old.pdf',
      },
      error: null,
    }));

    setSupabaseHandler('mascotas', 'update', (context) => {
      expect(context.payload).toMatchObject({
        nombre: 'Firulais 2',
        edad: 6,
        raza: 'Golden',
        peso: 27,
      });
      return {
        data: {
          id_mascota: '22',
          nombre: 'Firulais 2',
          foto_url: 'https://storage.test/fotos-mascotas/foto-nueva.jpg',
        },
        error: null,
      };
    });

    const response = await request(app)
      .put('/pets/update?id_usuario=owner-001&id_mascota=22')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('petName', 'Firulais 2')
      .field('petAge', '6')
      .field('petBreed', 'Golden')
      .field('petSpecies', 'Perro')
      .field('petGender', 'Macho')
      .field('petWeight', '27')
      .attach('foto', Buffer.from('new-photo'), 'foto-nueva.jpg')
      .attach('historial', Buffer.from('new-history'), 'historial.pdf');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Mascota actualizada exitosamente');
    expect(deleteFileMock).toHaveBeenCalledWith('old.jpg', 'fotos-mascotas');
    expect(deleteFileMock).toHaveBeenCalledWith('old.pdf', 'historiales-mascotas');
  });

  test('Eliminar mascota existente', async () => {
    getFilePathFromUrlMock.mockImplementation((url, bucket) => {
      expect(['fotos-mascotas', 'historiales-mascotas']).toContain(bucket);
      return url.split('/').pop();
    });
    deleteFileMock.mockResolvedValue(true);

    setSupabaseHandler('mascotas', 'single', () => ({
      data: {
        id_mascota: '33',
        id_usuario: 'owner-001',
        foto_url: 'https://storage.test/fotos-mascotas/old.jpg',
        historial_medico: 'https://storage.test/historiales-mascotas/old.pdf',
      },
      error: null,
    }));

    setSupabaseHandler('mascotas', 'delete', (context) => {
      expect(context.filters).toEqual([
        { type: 'eq', column: 'id_mascota', value: '33' },
        { type: 'eq', column: 'id_usuario', value: 'owner-001' },
      ]);
      return { data: null, error: null };
    });

    const response = await request(app)
      .delete('/pets/delete?id_usuario=owner-001&id_mascota=33')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Mascota eliminada correctamente');
    expect(deleteFileMock).toHaveBeenCalledTimes(2);
  });

  test('Manejar acceso no autorizado', async () => {
    const response = await request(app).get('/pets/get?id_usuario=owner-001');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token, autorización denegada');
  });

  test('Manejar solicitud para mascota inexistente', async () => {
    setSupabaseHandler('mascotas', 'single', () => ({
      data: null,
      error: null,
    }));

    const response = await request(app)
      .get('/pets/get-a-pet?id_mascota=999')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Mascota NO encontrada');
  });
});
