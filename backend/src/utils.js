import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRolKey = process.env.SERVICE_ROL_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRolKey);

/**
 * Uploads a file to Supabase Storage using read stream.
 * @param {object|null|undefined} file - The file object from Multer.
 * @param {string} bucketName - The name of the Supabase bucket.
 * @returns {Promise<string|null>} - The public URL of the uploaded file or null.
 */
const uploadFile = async (file, bucketName) => {
  if (!file || !file.path || !fs.existsSync(file.path)) {
    console.warn('uploadFile: File object or path is invalid or missing.');
    return null;
  }

  const filePathInBucket = `${Date.now()}-${path.basename(file.originalname)}`;

  try {
    const fileStream = fs.createReadStream(file.path);

    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePathInBucket, fileStream, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
        duplex: 'half',
      });

    if (error) {
      console.error(
        `Supabase upload error to ${bucketName}/${filePathInBucket}:`,
        error
      );
      if (!fileStream.destroyed) {
        fileStream.destroy();
      }
      throw error;
    }

    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePathInBucket);

    console.log(
      `File uploaded successfully to ${bucketName}/${filePathInBucket}. Public URL: ${urlData?.publicUrl}`
    );
    return urlData?.publicUrl || null;
  } catch (uploadError) {
    console.error(
      `Error during file upload stream for ${filePathInBucket}:`,
      uploadError
    );
    throw uploadError;
  }
};

/**
 * Deletes a file from Supabase Storage.
 * @param {string|null} filePathInBucket - The path of the file within the bucket.
 * @param {string} bucketName - The name of the Supabase bucket.
 * @returns {Promise<boolean>} - True if deletion was successful or no path provided, false otherwise.
 */
export const deleteFile = async (filePathInBucket, bucketName) => {
  if (!filePathInBucket) {
    console.log(`deleteFile: No file path provided for bucket ${bucketName}.`);
    return true;
  }
  try {
    console.log(
      `Attempting to delete ${filePathInBucket} from bucket ${bucketName}`
    );
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .remove([filePathInBucket]);

    if (error) {
      if (error.message && error.message.includes('Not found')) {
        console.warn(
          `File ${filePathInBucket} not found in bucket ${bucketName} for deletion (maybe already deleted).`
        );
        return true;
      }
      console.error(
        `Error deleting file ${filePathInBucket} from ${bucketName}:`,
        error
      );
      return false;
    }
    console.log(
      `Successfully deleted ${filePathInBucket} from ${bucketName}. Response:`,
      data
    );
    return true;
  } catch (error) {
    console.error(
      `Unexpected error during file deletion of ${filePathInBucket}:`,
      error
    );
    return false;
  }
};

/**
 * Extracts the file path from a Supabase public URL.
 * Assumes the URL structure is like: .../storage/v1/object/public/bucketName/filePath
 * @param {string|null} url - The public URL of the file.
 * @param {string} bucketName - The name of the bucket.
 * @returns {string|null} - The extracted file path or null if extraction fails.
 */
export const getFilePathFromUrl = (url, bucketName) => {
  if (!url || !bucketName) return null;
  try {
    const prefix = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
    if (url.startsWith(prefix)) {
      const filePath = decodeURIComponent(url.substring(prefix.length));
      return filePath;
    }

    console.warn(
      `Could not extract file path from URL: ${url} with expected prefix for bucket ${bucketName}`
    );
    return null;
  } catch (error) {
    console.error(`Error parsing file path from URL ${url}:`, error);
    return null;
  }
};

const validateDate = (dateStr) => {
  if (!dateStr) return true; // Allow undefined/null dates
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export { uploadFile, validateDate, supabaseClient };
