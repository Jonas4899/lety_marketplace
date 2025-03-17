import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

// Mock data for map markers
const mapMarkers = [
  { id: 1, lat: 40.7128, lng: -74.006, name: "Central Pet Hospital" },
  { id: 2, lat: 40.7148, lng: -74.013, name: "Happy Tails Veterinary" },
  { id: 3, lat: 40.7118, lng: -74.009, name: "Paws & Claws Animal Clinic" },
  { id: 4, lat: 40.7138, lng: -74.003, name: "City Pets Veterinary" },
  { id: 5, lat: 40.7158, lng: -74.008, name: "Animal Care Center" },
];

export default function VetMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // This is a simplified map implementation for demonstration
  // In a real application, you would use a library like Google Maps, Mapbox, or Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = mapRef.current.clientWidth;
    canvas.height = mapRef.current.clientHeight;
    mapRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a simple map background
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some "streets"
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    // Horizontal streets
    for (let y = 20; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical streets
    for (let x = 20; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw markers
    mapMarkers.forEach((marker, index) => {
      // Convert geo coordinates to canvas coordinates (simplified)
      const x = 50 + ((index * 80) % (canvas.width - 100));
      const y = 50 + Math.floor((index * 80) / (canvas.width - 100)) * 80;

      // Draw marker pin
      ctx.fillStyle = activeMarker === marker.id ? "#7c3aed" : "#ef4444";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw marker label
      if (activeMarker === marker.id) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.fillText(marker.name, x - 40, y - 15);
      }
    });

    setIsMapLoaded(true);

    // Cleanup
    return () => {
      if (mapRef.current && canvas.parentNode === mapRef.current) {
        mapRef.current.removeChild(canvas);
      }
    };
  }, [activeMarker]);

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[300px] w-full bg-muted">
        {!isMapLoaded && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 flex flex-col gap-2">
        <div className="rounded-md bg-background p-2 shadow-md">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Your Location</span>
          </div>
        </div>

        <div className="rounded-md bg-background p-2 shadow-md">
          <p className="text-xs text-muted-foreground">
            {mapMarkers.length} veterinary clinics in this area
          </p>
        </div>
      </div>

      <div className="absolute right-3 top-3 rounded-md bg-background p-2 shadow-md">
        <div className="flex gap-2">
          <button className="rounded-md border p-1 hover:bg-muted">+</button>
          <button className="rounded-md border p-1 hover:bg-muted">−</button>
        </div>
      </div>
    </div>
  );
}
