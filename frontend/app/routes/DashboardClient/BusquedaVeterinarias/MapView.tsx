import { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { Button } from "~/components/ui/button";
import { MapPin, AlertCircle } from "lucide-react";
import config from "~/config";

// Google Maps API key from config
const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;

// Default center (Bogotá, Colombia)
const DEFAULT_CENTER = { lat: 4.711, lng: -74.0721 };

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Map options
const mapOptions = {
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  maxZoom: 18,
  minZoom: 3,
  mapId: "761150eb81f56251",
};

// Define libraries array outside component to prevent reloading warnings
const libraries: Libraries = ["marker"];

interface MapViewProps {
  clinics: {
    id_clinica: number;
    nombre: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
  }[];
  onClinicSelect: (clinicId: number) => void;
  isMapViewActive?: boolean;
}

export default function MapView({
  clinics,
  onClinicSelect,
  isMapViewActive = false,
}: MapViewProps) {
  // Load the Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Store the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // State for tracking user's location
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // State for the selected clinic ID
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);

  // State for advanced markers
  const [advancedMarkers, setAdvancedMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);
  const [userMarker, setUserMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Get the user's location
  useEffect(() => {
    if (isLoaded) {
      if (!navigator.geolocation) {
        setLocationError(
          "La geolocalización no es compatible con este navegador"
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setLocationError(
              "Permiso de ubicación denegado. Por favor habilita el acceso a tu ubicación."
            );
          } else {
            setLocationError(`Error al obtener la ubicación: ${error.message}`);
          }
        }
      );
    }
  }, [isLoaded]);

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMap(map);
  }, []);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    console.log("Map unmounted");

    // Clear markers when map unmounts
    if (advancedMarkers.length > 0) {
      advancedMarkers.forEach((marker) => (marker.map = null));
      setAdvancedMarkers([]);
    }

    if (userMarker) {
      userMarker.map = null;
      setUserMarker(null);
    }

    setMap(null);
  }, [advancedMarkers, userMarker]);

  // Use memo to prevent unnecessary re-renders
  const center = useMemo(() => {
    // If user location is available, use it
    if (userLocation) return userLocation;

    // Find the first clinic with valid coordinates
    const clinicWithCoords = clinics.find(
      (clinic) => clinic.latitud !== undefined && clinic.longitud !== undefined
    );

    // If a clinic with coords exists, use it
    if (clinicWithCoords) {
      return {
        lat: clinicWithCoords.latitud as number,
        lng: clinicWithCoords.longitud as number,
      };
    }

    // Fallback to default center
    return DEFAULT_CENTER;
  }, [userLocation, clinics]);

  // Handle resize when map becomes visible
  useEffect(() => {
    if (map && isMapViewActive) {
      window.google.maps.event.trigger(map, "resize");
      map.setCenter(center);
    }
  }, [map, isMapViewActive, center]);

  // Create user location marker
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || !google.maps.marker) return;

    // Clear existing user marker
    if (userMarker) {
      userMarker.map = null;
    }

    try {
      // Create a pin for user location
      const { PinElement } = google.maps.marker;
      const userPin = new PinElement({
        background: "#4f46e5",
        borderColor: "#ffffff",
        glyphColor: "#ffffff",
        scale: 1.2,
      });

      // Create advanced marker for user location
      const { AdvancedMarkerElement } = google.maps.marker;
      const newUserMarker = new AdvancedMarkerElement({
        position: userLocation,
        map: map,
        title: "Tu ubicación",
        content: userPin.element,
      });

      setUserMarker(newUserMarker);
    } catch (error) {
      console.error("Error creating user marker:", error);
    }
  }, [isLoaded, map, userLocation]);

  // Create markers for clinics
  useEffect(() => {
    if (!isLoaded || !map || !google.maps.marker) return;

    // First clear any existing markers
    if (advancedMarkers.length > 0) {
      advancedMarkers.forEach((marker) => (marker.map = null));
      setAdvancedMarkers([]);
    }

    // Create an array to hold new markers
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    // Add bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();
    if (userLocation) {
      bounds.extend(userLocation);
    }

    try {
      // Get marker constructor
      const { AdvancedMarkerElement, PinElement } = google.maps.marker;

      // Create a marker for each clinic with valid coordinates
      clinics.forEach((clinic) => {
        if (!clinic.latitud || !clinic.longitud) return;

        const position = { lat: clinic.latitud, lng: clinic.longitud };

        // Create a pin with a unique color
        const clinicPin = new PinElement({
          background: "#ef4444", // Red color for clinics
          borderColor: "#ffffff",
          glyphColor: "#ffffff",
        });

        // Create the marker
        const marker = new AdvancedMarkerElement({
          position: position,
          map: map,
          title: clinic.nombre,
          content: clinicPin.element,
        });

        // Add click event to marker
        marker.addListener("click", () => {
          setSelectedClinic(clinic.id_clinica);
        });

        // Add to our array and to bounds
        newMarkers.push(marker);
        bounds.extend(position);
      });

      // Set the new markers in state
      setAdvancedMarkers(newMarkers);

      // Only adjust bounds if we have points to include
      if (newMarkers.length > 0 || userLocation) {
        // Fit bounds of map to include all markers
        map.fitBounds(bounds);

        // Prevent excessive zoom when only one point
        const listener = google.maps.event.addListenerOnce(map, "idle", () => {
          const zoom = map.getZoom();
          if (zoom !== undefined && zoom > 15) {
            map.setZoom(15);
          }
        });
      }
    } catch (error) {
      console.error("Error creating clinic markers:", error);
    }
  }, [isLoaded, map, clinics, userLocation]);

  // If the map isn't loaded yet, show a loading indicator
  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="text-xl font-semibold">Error al cargar el mapa</h3>
          <p className="text-muted-foreground">
            {loadError.message ||
              "No se pudo cargar Google Maps. Por favor, intenta de nuevo más tarde."}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // If there's a location error, show an error message
  if (locationError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="text-xl font-semibold">
            No se pudo obtener tu ubicación
          </h3>
          <p className="text-muted-foreground">{locationError}</p>
          {!permissionDenied && (
            <Button onClick={() => window.location.reload()} className="mt-2">
              <MapPin className="mr-2 h-4 w-4" /> Intentar de nuevo
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" data-testid="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Info window for selected clinic */}
        {selectedClinic && (
          <InfoWindow
            position={{
              lat:
                clinics.find((c) => c.id_clinica === selectedClinic)?.latitud ||
                0,
              lng:
                clinics.find((c) => c.id_clinica === selectedClinic)
                  ?.longitud || 0,
            }}
            onCloseClick={() => setSelectedClinic(null)}
          >
            <div className="p-2 max-w-[200px]">
              <h3 className="font-bold mb-2">
                {clinics.find((c) => c.id_clinica === selectedClinic)?.nombre}
              </h3>
              <p className="text-sm mb-2">
                {
                  clinics.find((c) => c.id_clinica === selectedClinic)
                    ?.direccion
                }
              </p>
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => onClinicSelect(selectedClinic)}
              >
                Ver detalle
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Clinic count overlay */}
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-background/95 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium">
          {clinics.filter((c) => c.latitud && c.longitud).length}{" "}
          {clinics.filter((c) => c.latitud && c.longitud).length === 1
            ? "veterinaria"
            : "veterinarias"}{" "}
          en el mapa
        </p>
        <p className="text-xs text-muted-foreground">
          {clinics.filter((c) => c.latitud && c.longitud).length === 0
            ? "No hay veterinarias con ubicación registrada."
            : "Haz clic en los marcadores para ver más información."}
        </p>
      </div>

      {/* Center on user location button */}
      {userLocation && (
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10 bg-background/95 shadow-md backdrop-blur-sm"
          onClick={() => {
            if (map && userLocation) {
              map.panTo(userLocation);
              map.setZoom(15);
            }
          }}
        >
          <MapPin className="mr-2 h-4 w-4" /> Mi ubicación
        </Button>
      )}
    </div>
  );
}
