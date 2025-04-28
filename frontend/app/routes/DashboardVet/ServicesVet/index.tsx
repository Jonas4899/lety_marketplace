import { useState } from "react";
import {
  Plus,
  Save,
  DollarSign,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
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

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  duration: number;
  isPopular: boolean;
  isAvailable: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Consulta General",
      description: "Evaluación completa del estado de salud de tu mascota",
      price: 500,
      category: "general",
      duration: 30,
      isPopular: true,
      isAvailable: true,
    },
    {
      id: "2",
      name: "Vacunación",
      description: "Aplicación de vacunas para prevenir enfermedades",
      price: 350,
      category: "preventive",
      duration: 15,
      isPopular: true,
      isAvailable: true,
    },
    {
      id: "3",
      name: "Limpieza Dental",
      description: "Limpieza profesional de dientes y encías",
      price: 800,
      category: "dental",
      duration: 60,
      isPopular: false,
      isAvailable: true,
    },
    {
      id: "4",
      name: "Cirugía de Esterilización",
      description: "Procedimiento quirúrgico para esterilizar a tu mascota",
      price: 1500,
      category: "surgery",
      duration: 120,
      isPopular: false,
      isAvailable: true,
    },
    {
      id: "5",
      name: "Análisis de Sangre",
      description:
        "Análisis completo de sangre para detectar problemas de salud",
      price: 600,
      category: "laboratory",
      duration: 20,
      isPopular: false,
      isAvailable: true,
    },
  ]);

  const [editingService, setEditingService] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Service | null>(null);

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

  const handleSaveEdit = () => {
    if (tempService) {
      setServices(
        services.map((service) =>
          service.id === tempService.id ? tempService : service
        )
      );
      setEditingService(null);
      setTempService(null);
    }
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const handleAddService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "Nuevo Servicio",
      description: "Descripción del servicio",
      price: 0,
      category: "general",
      duration: 30,
      isPopular: false,
      isAvailable: true,
    };

    setServices([...services, newService]);
    setTempService({ ...newService });
    setEditingService(newService.id);
  };

  const handleToggleAvailability = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id
          ? { ...service, isAvailable: !service.isAvailable }
          : service
      )
    );
  };

  const handleTogglePopular = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id
          ? { ...service, isPopular: !service.isPopular }
          : service
      )
    );
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

  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log("Guardando servicios:", services);
    alert("Cambios guardados correctamente");
  };

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
          >
            <Plus className="h-4 w-4" />
            Agregar Servicio
          </Button>
          <Button onClick={handleSaveChanges} className="gap-1">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

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
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-lg border p-4 transition-all ${
                      !service.isAvailable ? "bg-muted/50" : ""
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
                              value={tempService.name}
                              onChange={(e) =>
                                handleTempServiceChange("name", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="service-category">Categoría</Label>
                            <Select
                              value={tempService.category}
                              onValueChange={(value) =>
                                handleTempServiceChange("category", value)
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
                            value={tempService.description}
                            onChange={(e) =>
                              handleTempServiceChange(
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="service-price">Precio (MXN)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="service-price"
                                type="number"
                                value={tempService.price}
                                onChange={(e) =>
                                  handleTempServiceChange(
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                className="pl-9"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="service-duration">
                              Duración (minutos)
                            </Label>
                            <Input
                              id="service-duration"
                              type="number"
                              value={tempService.duration}
                              onChange={(e) =>
                                handleTempServiceChange(
                                  "duration",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div className="flex items-end gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="service-popular"
                                checked={tempService.isPopular}
                                onCheckedChange={(checked) =>
                                  handleTempServiceChange("isPopular", checked)
                                }
                              />
                              <Label htmlFor="service-popular">Popular</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="service-available"
                                checked={tempService.isAvailable}
                                onCheckedChange={(checked) =>
                                  handleTempServiceChange(
                                    "isAvailable",
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
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check className="mr-1 h-4 w-4" />
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.name}</h3>
                            {service.isPopular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                            {!service.isAvailable && (
                              <Badge variant="outline" className="text-xs">
                                No disponible
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              ${service.price.toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditService(service.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className="mb-2 text-sm text-muted-foreground">
                          {service.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>
                            {categoryNames[service.category] ||
                              service.category}
                          </span>
                          <span>•</span>
                          <span>{service.duration} minutos</span>
                          <div className="ml-auto flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`popular-${service.id}`}
                                checked={service.isPopular}
                                onCheckedChange={() =>
                                  handleTogglePopular(service.id)
                                }
                              />
                              <Label
                                htmlFor={`popular-${service.id}`}
                                className="text-xs"
                              >
                                Popular
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`available-${service.id}`}
                                checked={service.isAvailable}
                                onCheckedChange={() =>
                                  handleToggleAvailability(service.id)
                                }
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

        {Object.entries(categoryNames)
          .slice(0, 6)
          .map(([category, label]) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>
                    Gestiona los servicios de {label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services
                      .filter((service) => service.category === category)
                      .map((service) => (
                        <div
                          key={service.id}
                          className={`rounded-lg border p-4 transition-all ${
                            !service.isAvailable ? "bg-muted/50" : ""
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{service.name}</h3>
                              {service.isPopular && (
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              )}
                              {!service.isAvailable && (
                                <Badge variant="outline" className="text-xs">
                                  No disponible
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                ${service.price.toLocaleString()}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditService(service.id)}
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <p className="mb-2 text-sm text-muted-foreground">
                            {service.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span>{service.duration} minutos</span>
                            <div className="ml-auto flex gap-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`popular-${service.id}`}
                                  checked={service.isPopular}
                                  onCheckedChange={() =>
                                    handleTogglePopular(service.id)
                                  }
                                />
                                <Label
                                  htmlFor={`popular-${service.id}`}
                                  className="text-xs"
                                >
                                  Popular
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`available-${service.id}`}
                                  checked={service.isAvailable}
                                  onCheckedChange={() =>
                                    handleToggleAvailability(service.id)
                                  }
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
                      ))}

                    {services.filter((service) => service.category === category)
                      .length === 0 && (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                        <p className="mb-4 text-center text-muted-foreground">
                          No hay servicios en esta categoría
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
