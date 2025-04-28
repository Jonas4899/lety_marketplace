import { useState, useEffect } from "react";
import {
  Plus,
  Save,
  DollarSign,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useAuthStore } from "~/stores/useAuthStore";
import toast from "react-hot-toast";

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Service = {
  id: string;
  id_servicio?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

export default function ServicesPage() {
  const { user, userType } = useAuthStore();
  const clinicId = userType === "vet" && user ? (user as any).id_clinica : null;

  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar servicios al montar el componente
  useEffect(() => {
    const fetchServices = async () => {
      if (!clinicId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/veterinary/services/${clinicId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al cargar servicios");
        }

        const data = await response.json();

        if (data && Array.isArray(data.servicios)) {
          // Transformar los datos del backend al formato esperado por el componente
          const formattedServices = data.servicios.map((service: any) => ({
            id_servicio: service.id_servicio,
            id: service.id_servicio.toString(), // Crear un id para manejar el estado en el frontend
            nombre: service.nombre || "",
            descripcion: service.descripcion || "",
            precio: service.precio || 0,
            categoria: service.categoria || "general",
            disponible: service.disponible === true,
          }));

          setServices(formattedServices);
        }
      } catch (err) {
        console.error("Error al cargar servicios:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(`No se pudieron cargar los servicios: ${errorMessage}`);
        toast.error(`Error al cargar servicios: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [clinicId]);

  const handleEditService = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setTempService({ ...service });
      setEditingService(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setTempService(null);
  };

  const handleSaveEdit = async () => {
    if (!tempService || !clinicId) return;

    setIsSubmitting(true);

    // Si el servicio ya existe (tiene id_servicio), actualizar
    if (tempService.id_servicio) {
      try {
        const response = await fetch(
          `${API_URL}/veterinary/services/${tempService.id_servicio}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre: tempService.nombre,
              descripcion: tempService.descripcion,
              precio: tempService.precio,
              categoria: tempService.categoria,
              disponible: tempService.disponible,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al actualizar servicio");
        }

        const updatedService = await response.json();

        // Actualizar estado local
        setServices(
          services.map((service) =>
            service.id === tempService.id
              ? {
                  ...tempService,
                  id_servicio: updatedService.servicio.id_servicio,
                }
              : service
          )
        );

        toast.success("Servicio actualizado correctamente");
      } catch (err) {
        console.error("Error al actualizar servicio:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        toast.error(`Error al actualizar servicio: ${errorMessage}`);
      }
    } else {
      // Es un servicio nuevo, crear
      try {
        const response = await fetch(`${API_URL}/veterinary/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_clinica: clinicId,
            nombre: tempService.nombre,
            descripcion: tempService.descripcion,
            precio: tempService.precio,
            categoria: tempService.categoria,
            disponible: tempService.disponible,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al crear servicio");
        }

        const newService = await response.json();

        // Actualizar estado local con el nuevo ID asignado por el backend
        setServices(
          services.map((service) =>
            service.id === tempService.id
              ? {
                  ...tempService,
                  id_servicio: newService.servicio.id_servicio,
                  id: newService.servicio.id_servicio.toString(),
                }
              : service
          )
        );

        toast.success("Servicio creado correctamente");
      } catch (err) {
        console.error("Error al crear servicio:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        toast.error(`Error al crear servicio: ${errorMessage}`);
      }
    }

    setIsSubmitting(false);
    setEditingService(null);
    setTempService(null);
  };

  const handleDeleteService = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service || !service.id_servicio) {
      // Si no tiene id_servicio, solo lo quitamos del estado
      setServices(services.filter((s) => s.id !== id));
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este servicio?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/veterinary/services/${service.id_servicio}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar servicio");
      }

      setServices(services.filter((s) => s.id !== id));
      toast.success("Servicio eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al eliminar servicio: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      nombre: "Nuevo Servicio",
      descripcion: "Descripción del servicio",
      precio: 0,
      categoria: "general",
      disponible: true,
    };

    setServices([...services, newService]);
    setTempService({ ...newService });
    setEditingService(newService.id);
  };

  const handleToggleAvailability = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service || !service.id_servicio) return;

    const newAvailability = !service.disponible;

    try {
      const response = await fetch(
        `${API_URL}/veterinary/services/${service.id_servicio}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disponible: newAvailability,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error al actualizar disponibilidad"
        );
      }

      // Actualizar estado local
      setServices(
        services.map((s) =>
          s.id === id ? { ...s, disponible: newAvailability } : s
        )
      );

      toast.success(
        `Servicio ${newAvailability ? "habilitado" : "deshabilitado"}`
      );
    } catch (err) {
      console.error("Error al actualizar disponibilidad:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al actualizar disponibilidad: ${errorMessage}`);
    }
  };

  const handleTempServiceChange = (field: keyof Service, value: any) => {
    if (tempService) {
      setTempService({
        ...tempService,
        [field]: value,
      });
    }
  };

  const categoryNames: Record<string, string> = {
    general: "Consulta General",
    preventive: "Medicina Preventiva",
    dental: "Odontología",
    surgery: "Cirugía",
    laboratory: "Laboratorio",
    imaging: "Imagenología",
    emergency: "Emergencias",
    grooming: "Estética",
    other: "Otros Servicios",
  };

  // Si no hay clínica identificada
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

  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Servicios y Precios
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddService}
            className="gap-1"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Agregar Servicio
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Información importante</AlertTitle>
        <AlertDescription>
          Los precios y servicios que configures aquí serán visibles para los
          dueños de mascotas en la plataforma.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="general">Consultas</TabsTrigger>
          <TabsTrigger value="preventive">Preventiva</TabsTrigger>
          <TabsTrigger value="dental">Odontología</TabsTrigger>
          <TabsTrigger value="surgery">Cirugía</TabsTrigger>
          <TabsTrigger value="laboratory">Laboratorio</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Servicios</CardTitle>
              <CardDescription>
                Gestiona todos los servicios y precios de tu clínica veterinaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      Aún no tienes servicios registrados
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                )}

                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-lg border p-4 transition-all ${
                      !service.disponible ? "bg-muted/50" : ""
                    }`}
                  >
                    {editingService === service.id && tempService ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="service-name">
                              Nombre del Servicio
                            </Label>
                            <Input
                              id="service-name"
                              value={tempService.nombre}
                              onChange={(e) =>
                                handleTempServiceChange(
                                  "nombre",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="service-category">Categoría</Label>
                            <Select
                              value={tempService.categoria}
                              onValueChange={(value) =>
                                handleTempServiceChange("categoria", value)
                              }
                            >
                              <SelectTrigger id="service-category">
                                <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(categoryNames).map(
                                  ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service-description">
                            Descripción
                          </Label>
                          <Textarea
                            id="service-description"
                            value={tempService.descripcion}
                            onChange={(e) =>
                              handleTempServiceChange(
                                "descripcion",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="service-price">Precio (MXN)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="service-price"
                                type="number"
                                value={tempService.precio}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "precio",
                                    Number(e.target.value)
                                  )
                                }
                                className="pl-9"
                              />
                            </div>
                          </div>

                          <div className="flex items-end gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="service-available"
                                checked={tempService.disponible}
                                onCheckedChange={(checked) =>
                                  handleTempServiceChange("disponible", checked)
                                }
                              />
                              <Label htmlFor="service-available">
                                Disponible
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Check className="mr-1 h-4 w-4" />
                                Guardar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.nombre}</h3>
                            {!service.disponible && (
                              <Badge variant="outline" className="text-xs">
                                No disponible
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              ${service.precio.toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditService(service.id)}
                                disabled={isSubmitting}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteService(service.id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className="mb-2 text-sm text-muted-foreground">
                          {service.descripcion}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>
                            {categoryNames[service.categoria] ||
                              service.categoria}
                          </span>
                          <div className="ml-auto flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`available-${service.id}`}
                                checked={service.disponible}
                                onCheckedChange={() =>
                                  handleToggleAvailability(service.id)
                                }
                                disabled={isSubmitting}
                              />
                              <Label
                                htmlFor={`available-${service.id}`}
                                className="text-xs"
                              >
                                Disponible
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Consultas Generales</CardTitle>
              <CardDescription>
                Servicios relacionados con consultas y revisiones veterinarias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter((s) => s.categoria === "general").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      No tienes servicios en esta categoría
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                ) : (
                  services
                    .filter((service) => service.categoria === "general")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 transition-all ${
                          !service.disponible ? "bg-muted/50" : ""
                        }`}
                      >
                        {editingService === service.id && tempService ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-name">
                                  Nombre del Servicio
                                </Label>
                                <Input
                                  id="service-name"
                                  value={tempService.nombre}
                                  onChange={(e) =>
                                    handleTempServiceChange(
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="service-category">
                                  Categoría
                                </Label>
                                <Select
                                  value={tempService.categoria}
                                  onValueChange={(value) =>
                                    handleTempServiceChange("categoria", value)
                                  }
                                >
                                  <SelectTrigger id="service-category">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryNames).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="service-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="service-description"
                                value={tempService.descripcion}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-price">
                                  Precio (MXN)
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="service-price"
                                    type="number"
                                    value={tempService.precio}
                                    onChange={(e) =>
                                      handleTempServiceChange(
                                        "precio",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="pl-9"
                                  />
                                </div>
                              </div>

                              <div className="flex items-end gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="service-available"
                                    checked={tempService.disponible}
                                    onCheckedChange={(checked) =>
                                      handleTempServiceChange(
                                        "disponible",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor="service-available">
                                    Disponible
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {service.nombre}
                                </h3>
                                {!service.disponible && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${service.precio.toLocaleString()}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleEditService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mb-2 text-sm text-muted-foreground">
                              {service.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span>
                                {categoryNames[service.categoria] ||
                                  service.categoria}
                              </span>
                              <span>•</span>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`toggle-${service.id}`}
                                  checked={service.disponible}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={`toggle-${service.id}`}>
                                  {service.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preventive">
          <Card>
            <CardHeader>
              <CardTitle>Medicina Preventiva</CardTitle>
              <CardDescription>
                Servicios relacionados con vacunación, desparasitación y
                prevención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter((s) => s.categoria === "preventive").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      No tienes servicios en esta categoría
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                ) : (
                  services
                    .filter((service) => service.categoria === "preventive")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 transition-all ${
                          !service.disponible ? "bg-muted/50" : ""
                        }`}
                      >
                        {editingService === service.id && tempService ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-name">
                                  Nombre del Servicio
                                </Label>
                                <Input
                                  id="service-name"
                                  value={tempService.nombre}
                                  onChange={(e) =>
                                    handleTempServiceChange(
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="service-category">
                                  Categoría
                                </Label>
                                <Select
                                  value={tempService.categoria}
                                  onValueChange={(value) =>
                                    handleTempServiceChange("categoria", value)
                                  }
                                >
                                  <SelectTrigger id="service-category">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryNames).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="service-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="service-description"
                                value={tempService.descripcion}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-price">
                                  Precio (MXN)
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="service-price"
                                    type="number"
                                    value={tempService.precio}
                                    onChange={(e) =>
                                      handleTempServiceChange(
                                        "precio",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="pl-9"
                                  />
                                </div>
                              </div>

                              <div className="flex items-end gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="service-available"
                                    checked={tempService.disponible}
                                    onCheckedChange={(checked) =>
                                      handleTempServiceChange(
                                        "disponible",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor="service-available">
                                    Disponible
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {service.nombre}
                                </h3>
                                {!service.disponible && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${service.precio.toLocaleString()}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleEditService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mb-2 text-sm text-muted-foreground">
                              {service.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span>
                                {categoryNames[service.categoria] ||
                                  service.categoria}
                              </span>
                              <span>•</span>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`toggle-${service.id}`}
                                  checked={service.disponible}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={`toggle-${service.id}`}>
                                  {service.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dental">
          <Card>
            <CardHeader>
              <CardTitle>Odontología Veterinaria</CardTitle>
              <CardDescription>
                Servicios relacionados con la salud dental de las mascotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter((s) => s.categoria === "dental").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      No tienes servicios en esta categoría
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                ) : (
                  services
                    .filter((service) => service.categoria === "dental")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 transition-all ${
                          !service.disponible ? "bg-muted/50" : ""
                        }`}
                      >
                        {editingService === service.id && tempService ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-name">
                                  Nombre del Servicio
                                </Label>
                                <Input
                                  id="service-name"
                                  value={tempService.nombre}
                                  onChange={(e) =>
                                    handleTempServiceChange(
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="service-category">
                                  Categoría
                                </Label>
                                <Select
                                  value={tempService.categoria}
                                  onValueChange={(value) =>
                                    handleTempServiceChange("categoria", value)
                                  }
                                >
                                  <SelectTrigger id="service-category">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryNames).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="service-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="service-description"
                                value={tempService.descripcion}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-price">
                                  Precio (MXN)
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="service-price"
                                    type="number"
                                    value={tempService.precio}
                                    onChange={(e) =>
                                      handleTempServiceChange(
                                        "precio",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="pl-9"
                                  />
                                </div>
                              </div>

                              <div className="flex items-end gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="service-available"
                                    checked={tempService.disponible}
                                    onCheckedChange={(checked) =>
                                      handleTempServiceChange(
                                        "disponible",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor="service-available">
                                    Disponible
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {service.nombre}
                                </h3>
                                {!service.disponible && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${service.precio.toLocaleString()}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleEditService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mb-2 text-sm text-muted-foreground">
                              {service.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span>
                                {categoryNames[service.categoria] ||
                                  service.categoria}
                              </span>
                              <span>•</span>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`toggle-${service.id}`}
                                  checked={service.disponible}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={`toggle-${service.id}`}>
                                  {service.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surgery">
          <Card>
            <CardHeader>
              <CardTitle>Cirugía</CardTitle>
              <CardDescription>
                Servicios quirúrgicos para mascotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter((s) => s.categoria === "surgery").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      No tienes servicios en esta categoría
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                ) : (
                  services
                    .filter((service) => service.categoria === "surgery")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 transition-all ${
                          !service.disponible ? "bg-muted/50" : ""
                        }`}
                      >
                        {editingService === service.id && tempService ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-name">
                                  Nombre del Servicio
                                </Label>
                                <Input
                                  id="service-name"
                                  value={tempService.nombre}
                                  onChange={(e) =>
                                    handleTempServiceChange(
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="service-category">
                                  Categoría
                                </Label>
                                <Select
                                  value={tempService.categoria}
                                  onValueChange={(value) =>
                                    handleTempServiceChange("categoria", value)
                                  }
                                >
                                  <SelectTrigger id="service-category">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryNames).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="service-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="service-description"
                                value={tempService.descripcion}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-price">
                                  Precio (MXN)
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="service-price"
                                    type="number"
                                    value={tempService.precio}
                                    onChange={(e) =>
                                      handleTempServiceChange(
                                        "precio",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="pl-9"
                                  />
                                </div>
                              </div>

                              <div className="flex items-end gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="service-available"
                                    checked={tempService.disponible}
                                    onCheckedChange={(checked) =>
                                      handleTempServiceChange(
                                        "disponible",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor="service-available">
                                    Disponible
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {service.nombre}
                                </h3>
                                {!service.disponible && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${service.precio.toLocaleString()}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleEditService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mb-2 text-sm text-muted-foreground">
                              {service.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span>
                                {categoryNames[service.categoria] ||
                                  service.categoria}
                              </span>
                              <span>•</span>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`toggle-${service.id}`}
                                  checked={service.disponible}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={`toggle-${service.id}`}>
                                  {service.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laboratory">
          <Card>
            <CardHeader>
              <CardTitle>Laboratorio</CardTitle>
              <CardDescription>
                Servicios de laboratorio y análisis clínicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter((s) => s.categoria === "laboratory").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <p className="mb-4 text-center text-muted-foreground">
                      No tienes servicios en esta categoría
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                ) : (
                  services
                    .filter((service) => service.categoria === "laboratory")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 transition-all ${
                          !service.disponible ? "bg-muted/50" : ""
                        }`}
                      >
                        {editingService === service.id && tempService ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-name">
                                  Nombre del Servicio
                                </Label>
                                <Input
                                  id="service-name"
                                  value={tempService.nombre}
                                  onChange={(e) =>
                                    handleTempServiceChange(
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="service-category">
                                  Categoría
                                </Label>
                                <Select
                                  value={tempService.categoria}
                                  onValueChange={(value) =>
                                    handleTempServiceChange("categoria", value)
                                  }
                                >
                                  <SelectTrigger id="service-category">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryNames).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="service-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="service-description"
                                value={tempService.descripcion}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="service-price">
                                  Precio (MXN)
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="service-price"
                                    type="number"
                                    value={tempService.precio}
                                    onChange={(e) =>
                                      handleTempServiceChange(
                                        "precio",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="pl-9"
                                  />
                                </div>
                              </div>

                              <div className="flex items-end gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="service-available"
                                    checked={tempService.disponible}
                                    onCheckedChange={(checked) =>
                                      handleTempServiceChange(
                                        "disponible",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor="service-available">
                                    Disponible
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Guardar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {service.nombre}
                                </h3>
                                {!service.disponible && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${service.precio.toLocaleString()}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleEditService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mb-2 text-sm text-muted-foreground">
                              {service.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span>
                                {categoryNames[service.categoria] ||
                                  service.categoria}
                              </span>
                              <span>•</span>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`toggle-${service.id}`}
                                  checked={service.disponible}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={`toggle-${service.id}`}>
                                  {service.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
