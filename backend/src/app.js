import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';

// Configurar variables de entorno
dotenv.config();

if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

const app = express();
app.use(
  cors({
    origin: [
      'https://lety-marketplace.vercel.app',
      'https://lety-marketplace-juan-romeros-projects-f4ebe484.vercel.app',
      'https://lety-marketplace-git-main-juan-romeros-projects-f4ebe484.vercel.app',
      'https://lety-marketplace-p5hthhw13-juan-romeros-projects-f4ebe484.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ], // URL de tu frontend - both localhost and IP
    credentials: true, // Permitir cookies
  })
);

app.use(cookieParser());

app.use(express.json());

// Usar las rutas definidas en el índice
app.use('/', routes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}
export default app;
