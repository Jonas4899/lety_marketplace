import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar token para rutas protegidas
const autenticacionToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Token de autenticacion requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    req.user = user; // Guardar la información del usuario en la solicitud
    next(); // Continuar con la siguiente función de middleware
  });
};

export default autenticacionToken;
