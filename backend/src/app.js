import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fs from "fs";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

// Configurar variables de entorno
dotenv.config();

if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // URL de tu frontend
    credentials: true, // Permitir cookies
  })
);

app.use(cookieParser());

app.use(express.json());

// Usar las rutas definidas en el índice
app.use("/", routes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}
export default app;
