import express from 'express';
import { createClient } from '@supabase/supabase-js';
import autenticacionToken from '../middleware/auth.js';

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

roter.post('url', autenticacionToken, async (req, res) => {
  //Contenido de la ruta
});
