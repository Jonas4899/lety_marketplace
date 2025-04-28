import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Plus,
  ImageIcon,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";
// import { useToast } from "~/components/ui/use-toast"; // <--- Eliminado
import { useAuthStore } from "~/stores/useAuthStore";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast"; // <--- Importamos react-hot-toast

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Photo {
  id: string;
  url: string;
  title: string;
  type: "exterior" | "interior" | "staff" | "services" | "other";
  isPrimary?: boolean;
  file?: File;
}

export default function PhotosPage() {
  // const { toast } = useToast(); // <--- Eliminado
  const { user, userType } = useAuthStore();
  const clinicId = userType === "vet" && user ? (user as any).id_clinica : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Fetch clinic photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!clinicId) {
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true); // Poner loading mientras se hace fetch
      setError(null); // Limpiar errores previos

      try {
        const response = await fetch(
          `${API_URL}/veterinary/photos/${clinicId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Intentar parsear error
          throw new Error(
            errorData.message || "Error al cargar las fotos de la clínica"
          );
        }

        const data = await response.json();

        if (data && data.fotos && Array.isArray(data.fotos)) {
          const formattedPhotos = data.fotos.map((photo: any) => ({
            // Añadir tipo explícito any si no se conoce la estructura
            id: photo.id_foto.toString(),
            url: photo.url,
            title: photo.titulo || `Foto ${photo.id_foto}`, // Añadir título por defecto
            type: photo.tipo || "other", // Añadir tipo por defecto
            isPrimary: photo.es_principal || false, // Asegurar booleano
          }));
          setPhotos(formattedPhotos);
        } else {
          setPhotos([]);
        }
      } catch (err) {
        console.error("Error al cargar fotos:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(
          `No se pudieron cargar las fotos de la clínica. ${errorMessage}. Por favor, intente nuevamente.`
        );
        // Opcional: Mostrar toast de error
        // toast.error(`Error al cargar fotos: ${errorMessage}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPhotos();
  }, [clinicId]); // Dependencia clinicId es correcta

  const handleDragStart = (id: string) => {
    setDraggedPhoto(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedPhoto || draggedPhoto === targetId) {
      setDraggedPhoto(null);
      return;
    }

    const draggedIndex = photos.findIndex((photo) => photo.id === draggedPhoto);
    const targetIndex = photos.findIndex((photo) => photo.id === targetId);

    // Validar índices
    if (draggedIndex === -1 || targetIndex === -1) {
      console.error("Error: Foto arrastrada o destino no encontrada.");
      setDraggedPhoto(null);
      return;
    }

    const newPhotos = [...photos];
    const [draggedItem] = newPhotos.splice(draggedIndex, 1); // Forma más segura de obtener el item

    if (draggedItem) {
      // Asegurarse que el item existe
      newPhotos.splice(targetIndex, 0, draggedItem);
      setPhotos(newPhotos);
    }

    setDraggedPhoto(null);
  };

  const handleRemovePhoto = async (id: string) => {
    const photoToRemove = photos.find((photo) => photo.id === id);

    if (!photoToRemove) return; // Si no se encuentra, no hacer nada

    // Si la foto es una URL (existente en el servidor)
    if (photoToRemove.url.startsWith("http")) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/veterinary/photos/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Aquí podrías necesitar añadir headers de autenticación si tu API lo requiere
            // "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "No se pudo eliminar la foto del servidor"
          );
        }

        setPhotos(photos.filter((photo) => photo.id !== id));
        toast.success("La foto se ha eliminado correctamente"); // <--- Cambio aquí
      } catch (err) {
        console.error("Error al eliminar la foto:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(`Error al eliminar la foto: ${errorMessage}`);
        toast.error(`Error al eliminar la foto: ${errorMessage}`); // <--- Mostrar error con toast
      } finally {
        setIsLoading(false);
      }
    } else {
      // Si es una foto local (recién añadida, URL tipo blob:), solo quitarla del estado
      setPhotos(photos.filter((photo) => photo.id !== id));
      toast.success("Foto local eliminada de la lista."); // <--- Notificación para fotos locales
    }
  };

  const handleSetPrimary = async (id: string) => {
    const photoToSet = photos.find((p) => p.id === id);
    if (!photoToSet) return; // No hacer nada si no se encuentra

    setIsLoading(true);
    setError(null);

    try {
      // Si la foto ya existe en el servidor (URL http) Y tenemos clinicId
      if (clinicId && photoToSet.url.startsWith("http")) {
        const response = await fetch(
          `${API_URL}/veterinary/photos/${id}/set-primary`,
          {
            // Asumiendo endpoint dedicado o ajusta según tu API
            method: "PUT", // O POST según tu API
            headers: {
              "Content-Type": "application/json",
              // "Authorization": `Bearer ${token}` // Si se requiere auth
            },
            // No necesitas body si el ID va en la URL, o ajusta si tu API espera `isPrimary: true`
            body: JSON.stringify({ isPrimary: true }), // Opcional según tu API
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              "No se pudo establecer la foto como principal en el servidor"
          );
        }
      }
      // Si es una foto local o la API no requiere llamada para marcar como principal,
      // actualizamos el estado localmente igualmente.
      // Si la llamada a la API falla, el estado no se actualiza gracias al throw/catch.

      // Actualiza el estado localmente DESPUÉS de la llamada exitosa (si aplica)
      setPhotos(
        photos.map((photo) => ({
          ...photo,
          isPrimary: photo.id === id, // Solo la seleccionada es true
        }))
      );

      toast.success("Se ha establecido la foto como principal"); // <--- Cambio aquí
    } catch (err) {
      console.error("Error al establecer foto principal:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al establecer la foto como principal: ${errorMessage}`);
      toast.error(`Error al establecer como principal: ${errorMessage}`); // <--- Mostrar error con toast
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoTitleChange = (id: string, title: string) => {
    setPhotos(
      photos.map((photo) => (photo.id === id ? { ...photo, title } : photo))
    );
  };

  const handlePhotoTypeChange = (id: string, type: Photo["type"]) => {
    setPhotos(
      photos.map((photo) => (photo.id === id ? { ...photo, type } : photo))
    );
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024; // 5 MB (ajusta según necesites)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const newPhotosToAdd: Photo[] = [];
    let hasError = false;

    files.forEach((file) => {
      // Validación de tamaño
      if (file.size > maxFileSize) {
        toast.error(
          `El archivo "${file.name}" es demasiado grande (Máx: ${
            maxFileSize / 1024 / 1024
          }MB).`
        );
        hasError = true;
        return; // Saltar este archivo
      }

      // Validación de tipo
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `El tipo de archivo "${file.name}" no es válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).`
        );
        hasError = true;
        return; // Saltar este archivo
      }

      const tempUrl = URL.createObjectURL(file);
      const newPhoto: Photo = {
        id: uuidv4(), // ID único temporal
        url: tempUrl, // URL local temporal
        title: file.name.split(".").slice(0, -1).join(".") || "Nueva foto", // Quitar extensión
        type: "other", // Tipo por defecto
        file: file, // Guardamos el objeto File para subirlo luego
        isPrimary: false, // Por defecto no es principal
      };
      newPhotosToAdd.push(newPhoto);
    });

    if (!hasError && newPhotosToAdd.length > 0) {
      // Si no hay foto principal aún, marcar la primera nueva como principal? (Opcional)
      const needsPrimary =
        !photos.some((p) => p.isPrimary) &&
        !newPhotosToAdd.some((p) => p.isPrimary);
      if (needsPrimary && newPhotosToAdd[0]) {
        newPhotosToAdd[0].isPrimary = true;
        toast.success(
          `"${newPhotosToAdd[0].title}" se marcó como principal (ninguna existía).`
        );
      }

      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotosToAdd]);
      toast.success(`${newPhotosToAdd.length} foto(s) añadida(s) a la lista.`);
    }

    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo si es necesario
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleSaveChanges = async () => {
    if (!clinicId) {
      const msg =
        "No se pudo identificar la clínica. Por favor, inicie sesión nuevamente.";
      setError(msg);
      toast.error(msg); // <--- Mostrar error con toast
      return;
    }

    // Verificar si hay al menos una foto principal
    const primaryPhotoExists = photos.some((photo) => photo.isPrimary);
    if (photos.length > 0 && !primaryPhotoExists) {
      const msg = "Debes seleccionar una foto como principal antes de guardar.";
      setError(msg);
      toast.error(msg); // <--- Mostrar error con toast
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadStatus(null); // Limpiar estado de subida

    // Separar fotos nuevas (con 'file') de las existentes (sin 'file')
    const photosToUpload = photos.filter((photo) => photo.file);
    const photosToUpdate = photos.filter(
      (photo) => !photo.file && photo.url.startsWith("http")
    ); // Asumimos que las URLs http son existentes

    let uploadedCount = 0;
    const totalToUpload = photosToUpload.length;
    let operationFailed = false; // Flag para saber si algo falló

    // 1. Subir fotos nuevas
    if (totalToUpload > 0) {
      setUploadStatus(`Subiendo 0/${totalToUpload} fotos nuevas...`);

      for (let i = 0; i < photosToUpload.length; i++) {
        const photo = photosToUpload[i];
        if (!photo.file) continue; // Seguridad extra

        const formData = new FormData();
        formData.append("foto", photo.file); // El backend espera 'foto'
        formData.append("title", photo.title);
        formData.append("type", photo.type);
        formData.append("isPrimary", String(photo.isPrimary || false)); // Enviar como string 'true'/'false'

        try {
          const response = await fetch(
            `${API_URL}/veterinary/photos/upload/${clinicId}`,
            {
              method: "POST",
              body: formData,
              // Headers: No 'Content-Type', FormData lo maneja. Añadir Auth si es necesario.
              // "Authorization": `Bearer ${token}`
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Error al subir la foto: ${photo.title}`
            );
          }
          uploadedCount++;
          setUploadStatus(
            `Subiendo ${uploadedCount}/${totalToUpload} fotos nuevas...`
          );

          // Opcional: Actualizar la foto en el estado con la URL devuelta por el backend
          // const result = await response.json();
          // const uploadedUrl = result.url; // Asumiendo que la API devuelve la URL
          // setPhotos(currentPhotos => currentPhotos.map(p =>
          //    p.id === photo.id ? { ...p, url: uploadedUrl, file: undefined } : p // Quitar file y poner URL real
          // ));
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Error desconocido";
          console.error(`Error subiendo ${photo.title}:`, err);
          setError(
            `Error al subir "${photo.title}": ${errorMessage}. Algunos cambios podrían no haberse guardado.`
          );
          toast.error(`Error al subir "${photo.title}".`); // <--- Notificación específica
          operationFailed = true;
          // ¿Continuar con las demás o detener? Decidimos continuar por ahora.
        }
      }
      // Limpiar el estado de 'file' y las URLs blob de las subidas exitosas (si no se hizo antes)
      setPhotos((currentPhotos) =>
        currentPhotos.map((p) =>
          photosToUpload.some(
            (uploaded) => uploaded.id === p.id && !p.url.startsWith("http")
          )
            ? {
                ...p,
                file: undefined,
                url: p.url.startsWith("blob:")
                  ? "#uploaded-placeholder"
                  : p.url,
              } // O la URL real si la obtuviste
            : p
        )
      );
    }

    // 2. Actualizar metadatos de fotos existentes (título, tipo, isPrimary)
    if (photosToUpdate.length > 0 && !operationFailed) {
      // Solo intentar si la subida no falló gravemente
      setUploadStatus(
        `Actualizando metadatos de ${photosToUpdate.length} fotos existentes...`
      );
      try {
        // Crear un array de promesas para actualizar todas las fotos existentes
        const updatePromises = photosToUpdate.map((photo) => {
          return fetch(`${API_URL}/veterinary/photos/${photo.id}`, {
            // Usar ID de la foto existente
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              // "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              title: photo.title,
              type: photo.type,
              isPrimary: photo.isPrimary || false,
              // Podrías necesitar enviar el order/posición si tu API lo soporta
            }),
          });
        });

        const results = await Promise.allSettled(updatePromises); // Esperar todas las actualizaciones

        // Verificar resultados de las actualizaciones
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            const photo = photosToUpdate[index];
            console.error(
              `Error actualizando metadatos de ${photo?.title}:`,
              result.reason
            );
            setError(
              (prev) =>
                (prev ? prev + "; " : "") +
                `Error al actualizar metadatos de "${photo?.title}".`
            );
            toast.error(`Error al actualizar "${photo?.title}".`);
            operationFailed = true;
          } else if (result.status === "fulfilled" && !result.value.ok) {
            // Si la promesa se resolvió pero la respuesta no fue OK
            const photo = photosToUpdate[index];
            // Intentar obtener mensaje de error del cuerpo de la respuesta
            result.value
              .json()
              .catch(() => ({}))
              .then((errorData) => {
                const message =
                  errorData.message ||
                  `Error HTTP ${result.value.status} al actualizar "${photo?.title}"`;
                console.error(message);
                setError((prev) => (prev ? prev + "; " : "") + message);
                toast.error(message);
              });
            operationFailed = true;
          }
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        console.error("Error general actualizando metadatos:", err);
        setError(`Error general al actualizar metadatos: ${errorMessage}`);
        toast.error("Error al actualizar metadatos.");
        operationFailed = true;
      }
    }

    setIsLoading(false);
    setUploadStatus(null); // Limpiar mensaje de estado

    // Mensaje final
    if (!operationFailed) {
      toast.success("¡Cambios guardados correctamente!"); // <--- Cambio aquí
      // Opcional: Volver a cargar las fotos desde el servidor para asegurar consistencia
      // fetchPhotos();
    } else {
      toast.error(
        "Algunas operaciones fallaron. Revisa los errores y vuelve a intentarlo."
      );
      // No mostramos mensaje de éxito si algo falló. El estado de error ya debería estar visible.
    }
  };

  // Renderizado Condicional Principal
  if (!clinicId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se ha podido identificar la clínica. Por favor, asegúrate de
            haber iniciado sesión correctamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Cargando fotos de la clínica...</p>
      </div>
    );
  }

  // Renderizado Principal de la Página
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {" "}
        {/* Mejorado para responsiveness */}
        <h1 className="text-2xl font-bold tracking-tight">
          Fotos de la Clínica
        </h1>
        <div className="flex flex-wrap gap-2">
          {" "}
          {/* Mejorado para responsiveness */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/gif, image/webp" // Especificar tipos aceptados
            multiple
            onChange={handleFileUpload}
            disabled={isLoading} // Deshabilitar si está cargando
          />
          <Button
            variant="outline"
            className="gap-1"
            onClick={handleFileSelect}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4" />
            Subir Fotos
          </Button>
          <Button
            onClick={handleSaveChanges}
            className="gap-1"
            disabled={isLoading || photos.length === 0} // Deshabilitar si no hay fotos o está cargando
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadStatus ? "Guardando..." : "Procesando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mostrar errores generales */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mostrar estado de subida/guardado */}
      {uploadStatus && (
        <Alert>
          {/* Podría ser un icono diferente según el estado, pero Loader es genérico */}
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>{uploadStatus}</AlertDescription>
        </Alert>
      )}

      {/* Tabs para filtrar fotos */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({photos.length})</TabsTrigger>
          <TabsTrigger value="exterior">
            Exterior ({photos.filter((p) => p.type === "exterior").length})
          </TabsTrigger>
          <TabsTrigger value="interior">
            Interior ({photos.filter((p) => p.type === "interior").length})
          </TabsTrigger>
          <TabsTrigger value="staff">
            Personal ({photos.filter((p) => p.type === "staff").length})
          </TabsTrigger>
          <TabsTrigger value="services">
            Servicios ({photos.filter((p) => p.type === "services").length})
          </TabsTrigger>
          <TabsTrigger value="other">
            Otros ({photos.filter((p) => p.type === "other").length})
          </TabsTrigger>{" "}
          {/* Añadido Otros */}
        </TabsList>

        {/* Contenido de la Tab "Todas" */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Fotos</CardTitle>
              <CardDescription>
                Gestiona todas las fotos de tu clínica. Arrastra para reordenar
                (la primera foto es la principal por defecto si no marcas otra).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aún no has subido ninguna foto.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFileSelect}
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Añadir la primera foto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {" "}
                  {/* Ajustado grid */}
                  {photos.map(
                    (
                      photo,
                      index // Añadir index para posible reordenamiento futuro por API
                    ) => (
                      <div
                        key={photo.id}
                        draggable
                        onDragStart={() => handleDragStart(photo.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(photo.id)}
                        className={`group relative cursor-move rounded-lg border p-2 transition-all ${
                          draggedPhoto === photo.id
                            ? "opacity-50 scale-95 shadow-lg"
                            : "hover:shadow-md" // Mejor feedback visual drag & hover
                        } ${photo.isPrimary ? "border-primary border-2" : ""}`} // Resaltar principal
                      >
                        {/* Contenedor de la imagen */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                          <img
                            src={
                              photo.url.startsWith("blob:")
                                ? photo.url
                                : photo.url === "#uploaded-placeholder"
                                ? "/placeholder.svg"
                                : photo.url
                            } // Mostrar blob o URL final
                            alt={photo.title || `Foto ${index + 1}`}
                            className="absolute h-full w-full object-cover transition-transform group-hover:scale-105" // Efecto zoom al pasar el ratón
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }} // Fallback si la imagen no carga
                          />
                          {/* Indicador de Foto Principal */}
                          {photo.isPrimary && (
                            <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow">
                              Principal
                            </div>
                          )}
                          {/* Indicador de Foto Nueva (pendiente de guardar) */}
                          {photo.file && (
                            <div className="absolute right-2 top-2 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground shadow animate-pulse">
                              Nueva
                            </div>
                          )}
                        </div>

                        {/* Inputs para título y tipo */}
                        <div className="mt-2 space-y-2">
                          <Input
                            value={photo.title}
                            onChange={(e) =>
                              handlePhotoTitleChange(photo.id, e.target.value)
                            }
                            placeholder="Título de la foto"
                            className="text-sm"
                            disabled={isLoading}
                          />
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`type-${photo.id}`}
                              className="text-xs whitespace-nowrap"
                            >
                              Tipo:
                            </Label>
                            <select
                              id={`type-${photo.id}`}
                              value={photo.type}
                              onChange={(e) =>
                                handlePhotoTypeChange(
                                  photo.id,
                                  e.target.value as Photo["type"]
                                )
                              }
                              className="h-8 flex-grow rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              disabled={isLoading}
                            >
                              <option value="exterior">Exterior</option>
                              <option value="interior">Interior</option>
                              <option value="staff">Personal</option>
                              <option value="services">Servicios</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                        </div>

                        {/* Botones de acción (hover) */}
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {/* Botón para marcar como principal (si no lo es ya) */}
                          {!photo.isPrimary && (
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                              title="Marcar como principal"
                              onClick={() => handleSetPrimary(photo.id)}
                              disabled={isLoading}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Botón para eliminar */}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            title="Eliminar foto"
                            onClick={() => handleRemovePhoto(photo.id)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                  {/* Placeholder para añadir más fotos */}
                  <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:bg-muted/50 transition-colors">
                    <Button
                      variant="ghost"
                      className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                      onClick={handleFileSelect}
                      disabled={isLoading}
                    >
                      <Plus className="h-8 w-8" />
                      <span>Agregar más fotos</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de las otras Tabs (filtradas) */}
        {["exterior", "interior", "staff", "services", "other"].map((type) => {
          const filteredPhotos = photos.filter((photo) => photo.type === type);
          const typeLabels: Record<string, string> = {
            // Para mostrar nombres amigables
            exterior: "Exterior",
            interior: "Interior",
            staff: "Personal",
            services: "Servicios",
            other: "Otros",
          };

          return (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <CardTitle>Fotos de {typeLabels[type]}</CardTitle>
                  <CardDescription>
                    Gestiona las fotos de {typeLabels[type].toLowerCase()} de tu
                    clínica. Los cambios aquí se reflejan en "Todas".
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay fotos de tipo "{typeLabels[type]}".
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleFileSelect}
                        disabled={isLoading}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Añadir fotos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {" "}
                      {/* Ajustado grid */}
                      {filteredPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          // No draggable en vistas filtradas para simplificar
                          className={`group relative rounded-lg border p-2 transition-all hover:shadow-md ${
                            photo.isPrimary ? "border-primary border-2" : ""
                          }`}
                        >
                          {/* Contenedor de la imagen */}
                          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                            <img
                              src={
                                photo.url.startsWith("blob:")
                                  ? photo.url
                                  : photo.url === "#uploaded-placeholder"
                                  ? "/placeholder.svg"
                                  : photo.url
                              }
                              alt={photo.title || `Foto ${type} ${index + 1}`}
                              className="absolute h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            {/* Indicador de Foto Principal */}
                            {photo.isPrimary && (
                              <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow">
                                Principal
                              </div>
                            )}
                            {/* Indicador de Foto Nueva */}
                            {photo.file && (
                              <div className="absolute right-2 top-2 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground shadow animate-pulse">
                                Nueva
                              </div>
                            )}
                          </div>
                          {/* Input para título */}
                          <div className="mt-2">
                            <Input
                              value={photo.title}
                              onChange={(e) =>
                                handlePhotoTitleChange(photo.id, e.target.value)
                              }
                              placeholder="Título de la foto"
                              className="text-sm"
                              disabled={isLoading}
                            />
                            {/* Podrías mostrar el tipo aquí si quisieras, aunque ya está filtrado */}
                            {/* <p className="text-xs text-muted-foreground mt-1">Tipo: {typeLabels[type]}</p> */}
                          </div>

                          {/* Botones de acción (hover) */}
                          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!photo.isPrimary && (
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                                title="Marcar como principal"
                                onClick={() => handleSetPrimary(photo.id)}
                                disabled={isLoading}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              title="Eliminar foto"
                              onClick={() => handleRemovePhoto(photo.id)}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {/* Placeholder para añadir más fotos (opcional en vistas filtradas) */}
                      <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:bg-muted/50 transition-colors">
                        <Button
                          variant="ghost"
                          className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                          onClick={handleFileSelect}
                          disabled={isLoading}
                        >
                          <Plus className="h-8 w-8" />
                          <span>Agregar más fotos</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
