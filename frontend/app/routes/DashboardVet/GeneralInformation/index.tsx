import type React from "react";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Save,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Alert } from "~/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    clinicName: "Centro Veterinario Salud Animal",
    address: "Av. Principal 123, Colonia Centro",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "01000",
    phone: "(55) 1234-5678",
    email: "contacto@saludanimal.com",
    website: "www.saludanimal.com",
    description:
      "Centro Veterinario Salud Animal es una clínica de atención integral para mascotas con más de 10 años de experiencia. Ofrecemos servicios de consulta general, vacunación, cirugía, laboratorio y más.",
    specialties: ["Perros", "Gatos", "Aves", "Exóticos"],
    nit: "900-123456-7", // Nuevo campo para el NIT
    openingHours: {
      monday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        is24Hours: false,
      },
      tuesday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        is24Hours: false,
      },
      wednesday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        is24Hours: false,
      },
      thursday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        is24Hours: false,
      },
      friday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        is24Hours: false,
      },
      saturday: {
        open: "10:00",
        close: "14:00",
        closed: false,
        is24Hours: false,
      },
      sunday: { open: "00:00", close: "00:00", closed: true, is24Hours: false },
    },
    facilities: [
      "Estacionamiento",
      "Acceso para discapacitados",
      "Sala de espera",
      "Farmacia",
    ],
    paymentMethods: [
      "Efectivo",
      "Tarjeta de crédito",
      "Tarjeta de débito",
      "Transferencia",
    ],
  });

  const [nitError, setNitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validación específica para el NIT
    if (name === "nit") {
      // Limpiar cualquier error previo
      setNitError(null);

      // Validar formato del NIT (solo números y guiones, 9-12 caracteres)
      const nitRegex = /^[0-9-]{9,12}$/;
      if (value && !nitRegex.test(value)) {
        setNitError(
          "El NIT debe contener entre 9-12 caracteres (números y guiones)"
        );
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNestedChange = (
    category: string,
    field: string,
    value: string | boolean
  ) => {
    const currentValue = formData[category as keyof typeof formData];
    if (typeof currentValue !== "object" || currentValue === null) return;

    setFormData({
      ...formData,
      [category]: {
        ...currentValue,
        [field]: value,
      },
    });
  };

  const handleHoursChange = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day as keyof typeof formData.openingHours],
          [field]: value,
        },
      },
    });
  };

  // Manejar cambio en la opción de 24 horas
  const handle24HoursChange = (day: string, checked: boolean) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day as keyof typeof formData.openingHours],
          is24Hours: checked,
          // Si se activa 24 horas, establecer horarios predeterminados
          open: checked
            ? "00:00"
            : formData.openingHours[day as keyof typeof formData.openingHours]
                .open,
          close: checked
            ? "23:59"
            : formData.openingHours[day as keyof typeof formData.openingHours]
                .close,
        },
      },
    });
  };

  const handleCheckboxChange = (
    list: string,
    item: string,
    checked: boolean
  ) => {
    const currentList = formData[list as keyof typeof formData] as string[];

    let updatedList: string[];
    if (checked) {
      updatedList = [...currentList, item];
    } else {
      updatedList = currentList.filter((i) => i !== item);
    }

    setFormData({
      ...formData,
      [list]: updatedList,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar NIT antes de guardar
    if (formData.nit) {
      const nitRegex = /^[0-9-]{9,12}$/;
      if (!nitRegex.test(formData.nit)) {
        setNitError(
          "El NIT debe contener entre 9-12 caracteres (números y guiones)"
        );
        return;
      }
    }

    // Aquí iría la lógica para guardar los cambios
    console.log("Guardando cambios:", formData);

    // Mostrar mensaje de éxito
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Función para aplicar 24 horas a todos los días
  const applyAll24Hours = (checked: boolean) => {
    const updatedHours = { ...formData.openingHours };
    (Object.keys(updatedHours) as Array<keyof typeof updatedHours>).forEach(
      (day) => {
        updatedHours[day] = {
          ...updatedHours[day],
          is24Hours: checked,
          open: checked ? "00:00" : updatedHours[day].open,
          close: checked ? "23:59" : updatedHours[day].close,
          closed: updatedHours[day].closed && !checked ? true : false,
        };
      }
    );

    setFormData({
      ...formData,
      openingHours: updatedHours,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Información General
        </h1>
        <Button onClick={handleSubmit} className="gap-1">
          <Save className="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-100 text-green-800 border-green-300">
          <AlertCircle className="h-4 w-4" />
          <span>Cambios guardados correctamente</span>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Actualiza la información principal de tu clínica veterinaria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nombre de la Clínica</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clinicName"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="nit">
                    NIT (Número de Identificación Tributaria)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 ml-1"
                        >
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Información sobre NIT</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Formato: 9-12 dígitos con posibles guiones (ej.
                          900-123456-7)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="nit"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  className={nitError ? "border-red-500" : ""}
                />
                {nitError && <p className="text-xs text-red-500">{nitError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe tu clínica veterinaria..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
              <CardDescription>
                Información adicional sobre tu clínica y servicios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[
                    "Perros",
                    "Gatos",
                    "Aves",
                    "Exóticos",
                    "Reptiles",
                    "Roedores",
                    "Animales de granja",
                    "Otros",
                  ].map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "specialties",
                            specialty,
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor={`specialty-${specialty}`}
                        className="text-sm"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Métodos de Pago Aceptados</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[
                    "Efectivo",
                    "Tarjeta de crédito",
                    "Tarjeta de débito",
                    "Transferencia",
                    "PayPal",
                    "Mercado Pago",
                    "Pago en línea",
                    "Otros",
                  ].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${method}`}
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "paymentMethods",
                            method,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`payment-${method}`} className="text-sm">
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
              <CardDescription>
                Configura los horarios de atención de tu clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">Configuración rápida</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="all-24-hours" className="text-sm">
                      Todos 24 horas
                    </Label>
                    <Switch
                      id="all-24-hours"
                      onCheckedChange={applyAll24Hours}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(formData.openingHours).map(([day, hours]) => {
                  const dayNames: Record<string, string> = {
                    monday: "Lunes",
                    tuesday: "Martes",
                    wednesday: "Miércoles",
                    thursday: "Jueves",
                    friday: "Viernes",
                    saturday: "Sábado",
                    sunday: "Domingo",
                  };

                  return (
                    <div key={day} className="grid gap-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <Label>{dayNames[day]}</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor={`closed-${day}`}
                              className="text-sm"
                            >
                              Cerrado
                            </Label>
                            <Switch
                              id={`closed-${day}`}
                              checked={hours.closed}
                              onCheckedChange={(checked) => {
                                handleHoursChange(day, "closed", checked);
                                // Si se marca como cerrado, desactivar 24 horas
                                if (checked && hours.is24Hours) {
                                  handleHoursChange(day, "is24Hours", false);
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`24h-${day}`} className="text-sm">
                              24 horas
                            </Label>
                            <Switch
                              id={`24h-${day}`}
                              checked={hours.is24Hours}
                              disabled={hours.closed}
                              onCheckedChange={(checked) =>
                                handle24HoursChange(day, checked)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {!hours.closed && !hours.is24Hours && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleHoursChange(day, "open", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                          <span>a</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) =>
                              handleHoursChange(day, "close", e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                      )}

                      {hours.is24Hours && (
                        <div className="text-sm text-muted-foreground italic">
                          Abierto las 24 horas
                        </div>
                      )}

                      {hours.closed && (
                        <div className="text-sm text-muted-foreground italic">
                          Cerrado este día
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
