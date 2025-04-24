import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

const uploadFile = async (file, bucket) => {
  if (!file) return null; // Verifica si hay archivo antes de continuar

  const filePath = `${bucket}/${Date.now()}-${file.originalname}`; // Ruta de donde se guardará el archivo

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, fs.createReadStream(file.path), {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false,
      duplex: "half",
    });

  if (error) throw error;

  // Obtener la URL pública del archivo subido
  const { data: urlData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(filePath);
  return urlData.publicUrl;
};

const validateDate = (dateStr) => {
  if (!dateStr) return true; // Allow undefined/null dates
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export { uploadFile, validateDate, supabaseClient };
