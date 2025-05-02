/*
 * googlePlaces.ts - Utility functions for Google Places API integration via backend proxy
 * Provides autocomplete predictions and place details (including coordinates)
 */

// API_KEY is no longer needed in frontend as it's managed securely on the backend

/**
 * Fetch address predictions from Google Places Autocomplete API via backend proxy
 * @param input - Partial address input
 * @returns Array of predictions with place_id and description
 */
export async function fetchPlacePredictions(
  input: string
): Promise<{ place_id: string; description: string }[]> {
  if (!input) return [];

  try {
    console.log(`[Places API] Fetching predictions for input: ${input}`);
    const url = `http://localhost:3001/api/places/autocomplete?input=${encodeURIComponent(
      input
    )}`;
    console.log(`[Places API] Request URL: ${url}`);

    const response = await fetch(url);
    console.log(`[Places API] Response status:`, response.status);
    console.log(
      `[Places API] Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Places API] Error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return [];
    }

    const data = await response.json();
    console.log(
      `[Places API] Received ${data.predictions?.length || 0} predictions`
    );
    return data.predictions || [];
  } catch (error) {
    console.error("[Places API] Error fetching predictions:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
}

/**
 * Fetch place details (including coordinates) by place_id from Google Places Details API via backend proxy
 * @param place_id - Unique identifier for the place
 * @returns Object containing latitude, longitude, and formatted address
 */
export async function fetchPlaceDetails(
  place_id: string
): Promise<{ lat: number; lng: number; address: string }> {
  if (!place_id) {
    throw new Error("Place ID is required");
  }

  try {
    console.log(`[Places API] Fetching details for place_id: ${place_id}`);
    const url = `http://localhost:3001/api/places/details?place_id=${encodeURIComponent(
      place_id
    )}`;
    console.log(`[Places API] Request URL: ${url}`);

    const response = await fetch(url);
    console.log(`[Places API] Response status:`, response.status);
    console.log(
      `[Places API] Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error("[Places API] Error response:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new Error(
        typeof errorData === "object" && errorData.error
          ? errorData.error
          : `API request failed: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("[Places API] Successfully retrieved place details");
    return data;
  } catch (error) {
    console.error("[Places API] Error fetching place details:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
