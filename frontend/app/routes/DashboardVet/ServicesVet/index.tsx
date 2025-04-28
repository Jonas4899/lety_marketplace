import { useState, useEffect, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { useAuthStore } from "~/stores/useAuthStore";
import toast from "react-hot-toast";

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const categoryNames = {
  todos: "Todos los servicios",
  general: "Consulta General",
  preventive: "Medicina Preventiva",
  dental: "Odontología",
  surgery: "Cirugía",
  laboratory: "Laboratorio",
  imaging: "Imagenología",
  emergency: "Emergencias",
  grooming: "Estética",
  other: "Otros Servicios",
} as const;

type Category = keyof typeof categoryNames;

interface Service {
  id: string;
  id_servicio?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Category;
  disponible: boolean;
}

interface AddServiceDialogProps {
  open: boolean;
  onClose: () => void;
  defaultCategory: string;
  onSave: (service: Service) => Promise<void>;
}

const AddServiceDialog = ({
  open,
  onClose,
  defaultCategory,
  onSave,
}: AddServiceDialogProps) => {
  const newService: Service = {
    id: Date.now().toString(),
    nombre: "",
    descripcion: "",
    precio: 0,
    categoria: (defaultCategory as Category) || "general",
    disponible: true,
  };

  const [tempService, setTempService] = useState<Service>(newService);

  const handleSave = async () => {
    if (!tempService.nombre || tempService.precio <= 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      await onSave(tempService);
      onClose();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
          <DialogDescription>
            Completa los detalles del nuevo servicio
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-service-name">Nombre del Servicio</Label>
              <Input
                id="new-service-name"
                value={tempService.nombre}
                onChange={(e) =>
                  setTempService({ ...tempService, nombre: e.target.value })
                }
                placeholder="Ej: Consulta General"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-service-category">Categoría</Label>
              <Select
                value={tempService.categoria}
                onValueChange={(value) =>
                  setTempService({
                    ...tempService,
                    categoria: value as Category,
                  })
                }
              >
                <SelectTrigger id="new-service-category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-service-description">Descripción</Label>
              <Textarea
                id="new-service-description"
                value={tempService.descripcion}
                onChange={(e) =>
                  setTempService({
                    ...tempService,
                    descripcion: e.target.value,
                  })
                }
                placeholder="Describe el servicio..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-service-price">Precio (COP)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-service-price"
                  type="number"
                  min="0"
                  value={tempService.precio}
                  onChange={(e) =>
                    setTempService({
                      ...tempService,
                      precio: Number(e.target.value),
                    })
                  }
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Servicio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NoServicesMessage = ({
  category,
  onAddService,
}: {
  category: string;
  onAddService: (category: string) => void;
}) => (
  <div className="flex flex-col items-center justify-center p-8">
    <p className="text-gray-500 mb-4">No tienes servicios en esta categoría</p>
    <Button onClick={() => onAddService(category)}>Agregar Servicio</Button>
  </div>
);

const ServicesVet = () => {
  const { user, userType } = useAuthStore();
  const clinicId = userType === "vet" && user ? (user as any).id_clinica : null;

  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("todos");
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleAddService = (category: string) => {
    setSelectedCategory(category);
    setShowAddServiceForm(true);
  };

  const filteredServices = useMemo(() => {
    if (selectedTab === "todos") return services;
    return services.filter((service) => service.categoria === selectedTab);
  }, [services, selectedTab]);

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
            categoria: (service.categoria as Category) || "general",
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

  const handleCreateService = async (service: Service) => {
    if (!service || !clinicId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/veterinary/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_clinica: clinicId,
          nombre: service.nombre,
          descripcion: service.descripcion,
          precio: service.precio,
          categoria: service.categoria,
          disponible: service.disponible,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear servicio");
      }

      const newService = await response.json();
      setServices([
        ...services,
        { ...service, id_servicio: newService.servicio.id_servicio },
      ]);
      toast.success("Servicio creado correctamente");
    } catch (err) {
      console.error("Error al crear servicio:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al crear servicio: ${errorMessage}`);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Update an existing service via PUT and update local state without duplication.
   */
  const handleUpdateService = async (service: Service) => {
    if (!service.id_servicio || !clinicId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/veterinary/services/${service.id_servicio}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: service.nombre,
            descripcion: service.descripcion,
            precio: service.precio,
            categoria: service.categoria,
            disponible: service.disponible,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar servicio");
      }
      const result = await response.json();
      setServices(
        services.map((s) =>
          s.id === service.id
            ? {
                ...s,
                ...result.servicio,
                id_servicio: result.servicio.id_servicio,
              }
            : s
        )
      );
      toast.success("Servicio actualizado correctamente");
      setEditingService(null);
      setTempService(null);
    } catch (err) {
      console.error("Error al actualizar servicio:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al actualizar servicio: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="container mx-auto p-6">
      <Tabs defaultValue="todos" onValueChange={setSelectedTab}>
        <div className="flex justify-end my-4">
          <Button onClick={() => handleAddService(selectedTab)}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar Servicio
          </Button>
        </div>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="general">Consultas</TabsTrigger>
          <TabsTrigger value="preventive">Preventiva</TabsTrigger>
          <TabsTrigger value="dental">Odontología</TabsTrigger>
          <TabsTrigger value="surgery">Cirugía</TabsTrigger>
          <TabsTrigger value="laboratory">Laboratorio</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
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
                              handleTempServiceChange("nombre", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service-category">Categoría</Label>
                          <Select
                            value={tempService.categoria}
                            onValueChange={(value) =>
                              handleTempServiceChange(
                                "categoria",
                                value as Category
                              )
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
                        <Label htmlFor="service-description">Descripción</Label>
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
                          <Label htmlFor="service-price">Precio (COP)</Label>
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
                          onClick={() => handleUpdateService(tempService)}
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
          ) : (
            <NoServicesMessage
              category={selectedTab}
              onAddService={handleAddService}
            />
          )}
        </TabsContent>
      </Tabs>

      {showAddServiceForm && (
        <AddServiceDialog
          open={showAddServiceForm}
          onClose={() => setShowAddServiceForm(false)}
          defaultCategory={selectedCategory}
          onSave={handleCreateService}
        />
      )}
    </div>
  );
};

export default ServicesVet;
