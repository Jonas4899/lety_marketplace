import { useState } from "react";
import { Upload, X, Plus, ImageIcon, Save } from "lucide-react";
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

interface Photo {
  id: string;
  url: string;
  title: string;
  type: "exterior" | "interior" | "staff" | "services" | "other";
  isPrimary?: boolean;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: "1",
      url: "/placeholder.svg?height=300&width=500&text=Fachada",
      title: "Fachada de la clínica",
      type: "exterior",
      isPrimary: true,
    },
    {
      id: "2",
      url: "/placeholder.svg?height=300&width=500&text=Recepción",
      title: "Área de recepción",
      type: "interior",
    },
    {
      id: "3",
      url: "/placeholder.svg?height=300&width=500&text=Consultorio",
      title: "Consultorio principal",
      type: "interior",
    },
    {
      id: "4",
      url: "/placeholder.svg?height=300&width=500&text=Equipo",
      title: "Nuestro equipo médico",
      type: "staff",
    },
    {
      id: "5",
      url: "/placeholder.svg?height=300&width=500&text=Cirugía",
      title: "Sala de cirugía",
      type: "services",
    },
  ]);

  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);

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

    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedIndex];

    // Remove the dragged item
    newPhotos.splice(draggedIndex, 1);
    // Insert it at the target position
    newPhotos.splice(targetIndex, 0, draggedItem);

    setPhotos(newPhotos);
    setDraggedPhoto(null);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setPhotos(
      photos.map((photo) => ({
        ...photo,
        isPrimary: photo.id === id,
      }))
    );
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

  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log("Guardando fotos:", photos);
    alert("Cambios guardados correctamente");
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fotos</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Upload className="h-4 w-4" />
            Subir Fotos
          </Button>
          <Button onClick={handleSaveChanges} className="gap-1">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="exterior">Exterior</TabsTrigger>
          <TabsTrigger value="interior">Interior</TabsTrigger>
          <TabsTrigger value="staff">Personal</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Fotos</CardTitle>
              <CardDescription>
                Gestiona todas las fotos de tu clínica. Arrastra para reordenar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(photo.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(photo.id)}
                    className={`group relative rounded-lg border p-2 transition-all ${
                      draggedPhoto === photo.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.title}
                        className="absolute h-full w-full object-cover"
                      />
                      {photo.isPrimary && (
                        <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                          Principal
                        </div>
                      )}
                    </div>

                    <div className="mt-2 space-y-2">
                      <Input
                        value={photo.title}
                        onChange={(e) =>
                          handlePhotoTitleChange(photo.id, e.target.value)
                        }
                        placeholder="Título de la foto"
                        className="text-sm"
                      />

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`type-${photo.id}`} className="text-xs">
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
                          className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="exterior">Exterior</option>
                          <option value="interior">Interior</option>
                          <option value="staff">Personal</option>
                          <option value="services">Servicios</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!photo.isPrimary && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                          onClick={() => handleSetPrimary(photo.id)}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 rounded-md"
                        onClick={() => handleRemovePhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed">
                  <Button
                    variant="ghost"
                    className="flex h-full w-full flex-col items-center justify-center gap-1"
                  >
                    <Plus className="h-8 w-8" />
                    <span>Agregar foto</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {["exterior", "interior", "staff", "services"].map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Fotos de{" "}
                  {type === "exterior"
                    ? "Exterior"
                    : type === "interior"
                    ? "Interior"
                    : type === "staff"
                    ? "Personal"
                    : "Servicios"}
                </CardTitle>
                <CardDescription>
                  Gestiona las fotos de{" "}
                  {type === "exterior"
                    ? "exterior"
                    : type === "interior"
                    ? "interior"
                    : type === "staff"
                    ? "personal"
                    : "servicios"}{" "}
                  de tu clínica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {photos
                    .filter((photo) => photo.type === type)
                    .map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-lg border p-2"
                      >
                        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.title}
                            className="absolute h-full w-full object-cover"
                          />
                          {photo.isPrimary && (
                            <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                              Principal
                            </div>
                          )}
                        </div>

                        <div className="mt-2">
                          <Input
                            value={photo.title}
                            onChange={(e) =>
                              handlePhotoTitleChange(photo.id, e.target.value)
                            }
                            placeholder="Título de la foto"
                            className="text-sm"
                          />
                        </div>

                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!photo.isPrimary && (
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                              onClick={() => handleSetPrimary(photo.id)}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => handleRemovePhoto(photo.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                  <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed">
                    <Button
                      variant="ghost"
                      className="flex h-full w-full flex-col items-center justify-center gap-1"
                    >
                      <Plus className="h-8 w-8" />
                      <span>Agregar foto</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
