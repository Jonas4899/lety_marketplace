/*
 * googlePlaces.ts - Utility functions for Google Places API integration
 * Provides autocomplete predictions and place details (including coordinates)
 */
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Fetch address predictions from Google Places Autocomplete API
 * @param input - Partial address input
 * @returns Array of predictions with place_id and description
 */
export async function fetchPlacePredictions(
  input: string
): Promise<{ place_id: string; description: string }[]> {
  if (!input) return [];
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${API_KEY}&types=address&components=country:co`
  );
  const data = await response.json();
  return data.predictions || [];
}

/**
 * Fetch place details (including coordinates) by place_id from Google Places Details API
 * @param place_id - Unique identifier for the place
 * @returns Object containing latitude, longitude, and formatted address
 */
export async function fetchPlaceDetails(
  place_id: string
): Promise<{ lat: number; lng: number; address: string }> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${API_KEY}`
  );
  const data = await response.json();
  const result = data.result;
  const { lat, lng } = result.geometry.location;
  const address = result.formatted_address;
  return { lat, lng, address };
}
