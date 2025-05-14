// filepath: c:\apl\Web dev\lety_marketplace\backend\src\routes\places.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// Get API key from environment variables
const MAPS_API_KEY = process.env.MAPS_API_KEY;

/**
 * Proxy endpoint for Google Places Autocomplete API
 * @route GET /places/autocomplete
 * @param {string} input - The partial address input from user
 * @returns {Object} JSON response from Google API with predictions
 */
router.get("/places/autocomplete", async (req, res) => {
  console.log("[Places API] Received autocomplete request");

  try {
    // Validate input parameter
    const input = req.query.input;
    if (!input) {
      return res.status(400).json({
        error: "Missing required parameter: input",
        message: "El parámetro de entrada es obligatorio",
      });
    }

    // Validate API key
    if (!MAPS_API_KEY) {
      console.error("[Places API] ERROR: Google Maps API key not configured");
      return res.status(500).json({
        error: "Server configuration error",
        message: "Error de configuración del servidor (API key no configurada)",
      });
    }

    console.log(`[Places API] Searching for: "${input}"`);

    // Build Google Places API URL
    const googleApiUrl =
      "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    const params = {
      input: input,
      key: MAPS_API_KEY,
      types: "address", // Focus on address results
      components: "country:co", // Restrict to Colombia
      language: "es", // Spanish results
    };

    // Make request to Google API
    const response = await axios.get(googleApiUrl, { params });

    // Check for API-specific errors
    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      console.error(
        `[Places API] Google API error: ${response.data.status}`,
        response.data.error_message
      );
      return res.status(400).json({
        error: `Google API error: ${response.data.status}`,
        message:
          response.data.error_message ||
          "No se pudieron recuperar las predicciones",
      });
    }

    console.log(
      `[Places API] Found ${response.data.predictions?.length || 0} predictions`
    );

    // Return a simplified response structure
    return res.json({
      status: response.data.status,
      predictions: response.data.predictions || [],
    });
  } catch (error) {
    console.error("[Places API] Error in autocomplete proxy:", error.message);
    return res.status(500).json({
      error: "Failed to retrieve autocomplete predictions",
      message: "Error al buscar direcciones. Por favor, intente de nuevo.",
      details: error.message,
    });
  }
});

/**
 * Proxy endpoint for Google Places Details API
 * @route GET /places/details
 * @param {string} place_id - The place ID from Google Autocomplete
 * @returns {Object} Simplified object with coordinates and formatted address
 */
router.get("/places/details", async (req, res) => {
  console.log("[Places API] Received details request");

  try {
    // Validate place_id parameter
    const placeId = req.query.place_id;
    if (!placeId) {
      return res.status(400).json({
        error: "Missing required parameter: place_id",
        message: "El ID del lugar es obligatorio",
      });
    }

    // Validate API key
    if (!MAPS_API_KEY) {
      console.error("[Places API] ERROR: Google Maps API key not configured");
      return res.status(500).json({
        error: "Server configuration error",
        message: "Error de configuración del servidor (API key no configurada)",
      });
    }

    console.log(`[Places API] Getting details for place ID: ${placeId}`);

    // Build Google Places API URL
    const googleApiUrl =
      "https://maps.googleapis.com/maps/api/place/details/json";
    const params = {
      place_id: placeId,
      key: MAPS_API_KEY,
      fields: "geometry,formatted_address,name,address_components", // Request needed fields
      language: "es", // Spanish results
    };

    // Make request to Google API
    const response = await axios.get(googleApiUrl, { params });

    // Check if Google API request was successful
    if (response.data.status !== "OK") {
      console.error(
        `[Places API] Google API error: ${response.data.status}`,
        response.data.error_message
      );
      return res.status(400).json({
        error: `Google API error: ${response.data.status}`,
        message:
          response.data.error_message ||
          "No se pudieron recuperar los detalles del lugar",
      });
    }

    // Extract required information from response
    const result = response.data.result;

    // Verify that required fields exist in the response
    if (!result || !result.geometry || !result.geometry.location) {
      console.error(
        "[Places API] Invalid response: Missing location data in API response"
      );
      return res.status(500).json({
        error: "Invalid response from Google API",
        message:
          "Los datos de ubicación no están disponibles para esta dirección",
      });
    }

    console.log(
      `[Places API] Successfully retrieved details for: ${result.formatted_address}`
    );
    console.log(
      `[Places API] Coordinates: ${result.geometry.location.lat}, ${result.geometry.location.lng}`
    );

    // Return simplified object with required fields
    return res.json({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      address: result.formatted_address || "",
      addressComponents: result.address_components || [],
      name: result.name || "",
    });
  } catch (error) {
    console.error("[Places API] Error in place details proxy:", error.message);
    return res.status(500).json({
      error: "Failed to retrieve place details",
      message:
        "Error al obtener detalles de la ubicación. Por favor, intente de nuevo.",
      details: error.message,
    });
  }
});

export default router;
