# lety-marketplace

Una plataforma para que los dueños de mascotas puedan conectar con clinicas veterinarias

# Google Places API Integration for Address Autocomplete

This document explains how to set up and use the Google Places API integration for address autocomplete in the Lety Marketplace application.

## Overview

The integration allows users to:

1. Start typing an address and see autocomplete suggestions
2. Select an address and automatically retrieve its coordinates (latitude and longitude)
3. Use the coordinates for location-based features

## Setup Instructions

### 1. Obtain a Google Maps API Key

1. Go to the [Google Cloud Platform Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Library
4. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
5. Go to APIs & Services > Credentials
6. Click "Create Credentials" > "API Key"
7. Restrict the API key:
   - Application restrictions: HTTP referrers (websites)
   - Add your website domains (e.g., `http://localhost:5173/*` for development)
   - API restrictions: Select "Places API" only
8. Copy your API key

### 2. Configure Backend

1. Create or edit `.env` file in the backend directory:

   ```
   # backend/.env
   MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```

2. Ensure the Places API routes are properly imported in your `routes/index.js`

### 3. Test the Integration

1. Start your backend server
2. Start your frontend application
3. Navigate to a form with address autocomplete
4. Test by typing an address and selecting from the suggestions

## Usage in Forms

The `AddressAutocompleteInput` component is used in forms to provide address autocomplete. It:

1. Displays autocomplete suggestions as you type
2. Fetches coordinates when an address is selected
3. Passes the address and coordinates to the form

### Example Integration:

```tsx
import { AddressAutocompleteInput } from "./components/adressAutocompleteInput";

// In your form component:
const handleAddressSelection = (
  address: string,
  placeId?: string,
  details?: { lat: number; lng: number }
) => {
  // Update form state with address and coordinates
  setValue("address", address);
  if (details?.lat && details?.lng) {
    setCoordinates({ lat: details.lat, lng: details.lng });
  }
};

// In your JSX:
<AddressAutocompleteInput
  label="Dirección"
  placeholder="Empieza a escribir tu dirección..."
  onAddressSelect={handleAddressSelection}
  required
/>;
```

## Troubleshooting

### Common Issues:

1. **"Google Maps API key not configured"**

   - Check that your `.env` file contains the MAPS_API_KEY variable
   - Ensure the backend is loading environment variables correctly

2. **No autocomplete suggestions appear**

   - Verify your API key has the Places API enabled
   - Check console for any error messages
   - Ensure your API key restrictions allow your domain

3. **Coordinates not being returned**

   - Check if the Places API Details endpoint is working
   - Verify your API key has the necessary permissions

4. **"For development purposes only" watermark**
   - Add a valid billing account to your Google Cloud project

## Security Considerations

- Keep your API key secure and never expose it in client-side code
- Use appropriate API key restrictions to prevent unauthorized use
- Monitor your API usage in the Google Cloud Console to detect unusual activity
