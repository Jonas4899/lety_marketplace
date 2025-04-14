import express from 'express';
import authRoutes from './autenticacion.js';
import userRoutes from './usuarios.js';
import vetRoutes from './vets.js';
import serviceRoutes from './servicios.js';
import scheduleRoutes from './horarios.js';

const router = express.Router();

// Rutas de autenticación
router.use('/', authRoutes);

// Rutas de usuarios
router.use('/', userRoutes);

// Rutas de veterinarias
router.use('/', vetRoutes);

// Rutas de servicios
router.use('/', serviceRoutes);

// Rutas de horarios
router.use('/', scheduleRoutes);

export default router;
