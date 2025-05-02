import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ClinicPhoto {
  id_foto?: number;
  url: string;
  es_principal?: boolean;
  titulo?: string;
}

interface ClinicImageCarouselProps {
  photos: ClinicPhoto[];
  clinicName: string;
  featured?: boolean;
  onFavoriteClick?: () => void;
  isFavorite?: boolean;
}

export default function ClinicImageCarousel({
  photos,
  clinicName,
  featured = false,
  onFavoriteClick,
  isFavorite = false,
}: ClinicImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Si no hay fotos, crear una foto por defecto con el nombre de la clínica
  const defaultPhoto: ClinicPhoto = {
    url: `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(
      clinicName
    )}`,
  };

  const effectivePhotos = photos && photos.length > 0 ? photos : [defaultPhoto];

  // Ordenar fotos poniendo la principal primero
  useEffect(() => {
    if (photos && photos.length > 0) {
      // Si hay alguna marcada como principal, ponerla primera
      const mainPhotoIndex = photos.findIndex((photo) => photo.es_principal);
      if (mainPhotoIndex > 0) {
        setCurrentIndex(0);
      }
    }
  }, [photos]);

  const nextPhoto = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === effectivePhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevPhoto = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? effectivePhotos.length - 1 : prevIndex - 1
    );
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Si la imagen falla, reemplazar con una imagen por defecto
    e.currentTarget.src = `/images/default-clinic.jpg`;
    e.currentTarget.onerror = null; // Evitar bucles infinitos
    setIsLoading(false);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "16/10" }}
    >
      {/* Imagen actual */}
      <div className="absolute inset-0 bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
        <img
          src={effectivePhotos[currentIndex].url}
          alt={effectivePhotos[currentIndex].titulo || clinicName}
          className="h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: isLoading ? 0 : 1 }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Navegación del carousel (visible solo si hay más de 1 foto) */}
      {effectivePhotos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={prevPhoto}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={nextPhoto}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Indicadores de posición */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {effectivePhotos.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full ${
                  currentIndex === index
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-primary/50"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Children slots para favorite y featured badges */}
      {onFavoriteClick && (
        <div className="absolute right-2 top-2 z-10">
          {/* Content provided through children */}
        </div>
      )}

      {featured && (
        <div className="absolute left-2 top-2 z-10">
          {/* Content provided through children */}
        </div>
      )}
    </div>
  );
}
