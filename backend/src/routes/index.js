import express from 'express';
import authRoutes from './autenticacion.js';
import userRoutes from './usuarios.js';
import petRoutes from './mascotas.js';
import vetRoutes from './vets.js';
import serviceRoutes from './servicios.js';
import scheduleRoutes from './horarios.js';
import analyticsRoutes from './analytics.js';
import photosRoutes from './fotos.js';
import appoinmentRoutes from './citas.js';
import pets from './mascotas.js';

const router = express.Router();

// Rutas de autenticación
router.use('/', authRoutes);

// Rutas de usuarios
router.use('/', userRoutes);

// Rutas de mascotas
router.use('/', petRoutes);

// Rutas de veterinarias
router.use('/', vetRoutes);

// Rutas de servicios
router.use('/', serviceRoutes);

// Rutas de horarios
router.use('/', scheduleRoutes);

// Rutas de analytics
router.use('/', analyticsRoutes);

// Rutas de fotos
router.use('/', photosRoutes);

// Rutas de programación de citas
router.use('/', appoinmentRoutes);

// Rutas de mascotas y servicios
router.use('/', pets);

export default router;
