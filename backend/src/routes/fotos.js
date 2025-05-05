import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { uploadFile } from "../utils.js";
import dotenv from "dotenv";
import autenticacionToken from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// Configurar conexión a la base de datos de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Guardar temporalmente en la carpeta local /uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Obtener la extensión del archivo
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Crear un nombre único
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Aplica el middleware a todas las rutas de este router:
router.use(autenticacionToken);

// Endpoint para subir una foto de la clínica veterinaria
router.post(
  "/veterinary/photos/upload/:id_clinica",
  upload.single("foto"),
  async (req, res) => {
    try {
      const { id_clinica } = req.params;
      const { title, type, isPrimary } = req.body;
      const fotoFile = req.file;

      // Validar datos
      if (!id_clinica || !title || !type || !fotoFile) {
        return res.status(400).json({
          message: "Faltan campos requeridos (id_clinica, title, type, foto)",
        });
      }

      // Verificar que la clínica existe
      const { data: clinica, error: errorClinica } = await supabaseClient
        .from("clinicas")
        .select("id_clinica")
        .eq("id_clinica", id_clinica)
        .single();

      if (errorClinica || !clinica) {
        return res.status(404).json({
          message: "Clínica no encontrada",
        });
      }

      // Subir la foto a Supabase Storage
      let foto_url = null;
      try {
        foto_url = await uploadFile(fotoFile, "veterinary-photos");
        console.log("URL de la foto:", foto_url);
      } catch (uploadError) {
        console.error("Error al subir la foto:", uploadError);
        return res.status(500).json({
          message: "Error al procesar la foto: " + uploadError.message,
        });
      }

      // Si la foto se marca como primaria, actualizar las demás fotos
      if (isPrimary === "true" || isPrimary === true) {
        const { error: errorUpdatePrimary } = await supabaseClient
          .from("fotos_clinicas")
          .update({ es_principal: false })
          .eq("id_clinica", id_clinica);

        if (errorUpdatePrimary) {
          console.error(
            "Error al actualizar fotos principales:",
            errorUpdatePrimary
          );
        }
      }

      // Insertar la información de la foto en la base de datos
      const { data: foto, error: errorFoto } = await supabaseClient
        .from("fotos_clinicas")
        .insert([
          {
            id_clinica,
            titulo: title,
            url: foto_url,
            tipo: type,
            es_principal: isPrimary === "true" || isPrimary === true,
          },
        ])
        .select()
        .single();

      if (errorFoto) {
        console.error("Error de Supabase:", errorFoto);
        return res.status(400).json({
          message: "Error al registrar la foto: " + errorFoto.message,
        });
      }

      // Limpiar el archivo temporal
      if (fotoFile && fs.existsSync(fotoFile.path)) {
        fs.unlinkSync(fotoFile.path);
      }

      res.status(201).json({
        message: "Foto subida exitosamente",
        foto,
      });
    } catch (error) {
      console.error("Error interno del servidor:", error);

      // Limpiar el archivo temporal en caso de error
      try {
        const fotoFile = req.file;
        if (fotoFile && fs.existsSync(fotoFile.path)) {
          fs.unlinkSync(fotoFile.path);
        }
      } catch (cleanupError) {
        console.warn("Error al limpiar archivos temporales:", cleanupError);
      }

      res.status(500).json({
        message: "Error interno del servidor: " + error.message,
      });
    }
  }
);

// Endpoint para obtener todas las fotos de una clínica veterinaria
router.get("/veterinary/photos/:id_clinica", async (req, res) => {
  try {
    const { id_clinica } = req.params;

    // Verificar que la clínica existe
    const { data: clinica, error: errorClinica } = await supabaseClient
      .from("clinicas")
      .select("id_clinica")
      .eq("id_clinica", id_clinica)
      .single();

    if (errorClinica || !clinica) {
      return res.status(404).json({
        message: "Clínica no encontrada",
      });
    }

    // Obtener todas las fotos
    const { data: fotos, error: errorFotos } = await supabaseClient
      .from("fotos_clinicas")
      .select("*")
      .eq("id_clinica", id_clinica)
      .order("es_principal", { ascending: false })
      .order("created_at", { ascending: false });

    if (errorFotos) {
      return res.status(400).json({
        message: "Error al obtener fotos",
        error: errorFotos.message,
      });
    }

    res.status(200).json({ fotos });
  } catch (error) {
    console.error("Error al obtener fotos:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// Endpoint para actualizar información de una foto
router.put("/veterinary/photos/:id_foto", async (req, res) => {
  try {
    const { id_foto } = req.params;
    const { title, type, isPrimary } = req.body;

    if (!title && !type && isPrimary === undefined) {
      return res.status(400).json({
        message: "No se proporcionaron datos para actualizar",
      });
    }

    // Datos para actualizar
    const updateData = {};
    if (title) updateData.titulo = title;
    if (type) updateData.tipo = type;
    if (isPrimary !== undefined) updateData.es_principal = isPrimary;

    // Si la foto se marca como primaria, actualizar las demás fotos
    if (isPrimary === true || isPrimary === "true") {
      // Primero obtener el id_clinica de la foto
      const { data: foto, error: errorFoto } = await supabaseClient
        .from("fotos_clinicas")
        .select("id_clinica")
        .eq("id_foto", id_foto)
        .single();

      if (errorFoto || !foto) {
        return res.status(404).json({
          message: "Foto no encontrada",
        });
      }

      // Actualizar todas las fotos de la clínica para que no sean principales
      const { error: errorUpdatePrimary } = await supabaseClient
        .from("fotos_clinicas")
        .update({ es_principal: false })
        .eq("id_clinica", foto.id_clinica);

      if (errorUpdatePrimary) {
        console.error(
          "Error al actualizar fotos principales:",
          errorUpdatePrimary
        );
      }
    }

    // Actualizar la foto
    const { data, error: errorUpdate } = await supabaseClient
      .from("fotos_clinicas")
      .update(updateData)
      .eq("id_foto", id_foto)
      .select();

    if (errorUpdate) {
      return res.status(400).json({
        message: "Error al actualizar la foto",
        error: errorUpdate.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Foto no encontrada",
      });
    }

    res.status(200).json({
      message: "Foto actualizada exitosamente",
      foto: data[0],
    });
  } catch (error) {
    console.error("Error al actualizar foto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// Endpoint para eliminar una foto
router.delete("/veterinary/photos/:id_foto", async (req, res) => {
  try {
    const { id_foto } = req.params;

    // Primero, obtener la información de la foto para poder eliminar el archivo
    const { data: foto, error: errorFoto } = await supabaseClient
      .from("fotos_clinicas")
      .select("*")
      .eq("id_foto", id_foto)
      .single();

    if (errorFoto || !foto) {
      return res.status(404).json({
        message: "Foto no encontrada",
      });
    }

    // Eliminar el registro de la base de datos
    const { error: errorDelete } = await supabaseClient
      .from("fotos_clinicas")
      .delete()
      .eq("id_foto", id_foto);

    if (errorDelete) {
      return res.status(400).json({
        message: "Error al eliminar la foto",
        error: errorDelete.message,
      });
    }

    // Intentar eliminar el archivo del storage (esto podría fallar si la URL no es de Supabase)
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(foto.url);
      const filePath = url.pathname.split("/").slice(-1)[0];

      if (filePath) {
        const { error: storageError } = await supabaseClient.storage
          .from("veterinary-photos")
          .remove([filePath]);

        if (storageError) {
          console.warn(
            "No se pudo eliminar el archivo de storage:",
            storageError
          );
        }
      }
    } catch (storageError) {
      console.warn(
        "Error al intentar eliminar archivo de storage:",
        storageError
      );
      // No interrumpimos el flujo por este error
    }

    res.status(200).json({
      message: "Foto eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

export default router;
