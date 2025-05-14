import type React from "react";

interface User {
  id?: number;
  id_usuario?: number;
  id_clinica?: number;
  nombre?: string;
  correo?: string;
}

interface Vet extends User {
  id_clinica: number;
}

interface OpeningHour {
  open: string;
  close: string;
  closed: boolean;
  is24Hours: boolean;
}

interface OpeningHours {
  [key: string]: OpeningHour;
}

interface FormData {
  clinicName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  nit: string;
  openingHours: OpeningHours;
  facilities: string[];
  paymentMethods: string[];
}

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "~/stores/useAuthStore";
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
import { AddressAutocompleteInput } from "~/components/adressAutocompleteInput";

// URL base para las peticiones
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ProfilePage() {
  const { user } = useAuthStore() as { user: User | null };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    clinicName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    specialties: [] as string[],
    nit: "",
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
    facilities: [] as string[],
    paymentMethods: [] as string[],
  });

  const [nitError, setNitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>(
    "Cambios guardados correctamente"
  );

  // Cargar los datos de la clínica al montar el componente
  useEffect(() => {
    console.log("useEffect running, user:", user);
    if (user) {
      // Obtener el ID correcto dependiendo del tipo de usuario
      const clinicId = (user as Vet).id_clinica;
      console.log("Fetching clinic data for ID:", clinicId);

      if (clinicId) {
        fetchClinicData(clinicId);
      } else {
        console.log("Invalid clinic ID");
        setLoading(false);
        setError(
          "No se pudo identificar la clínica. Por favor, inicie sesión nuevamente."
        );
      }
    } else {
      console.log("No user available, setting loading to false");
      setLoading(false);
      setError(
        "No se pudo identificar la clínica. Por favor, inicie sesión nuevamente."
      );
    }
  }, [user]);

  // Función para cargar los datos de la clínica
  const fetchClinicData = async (clinicId: number) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener el token de autenticación
      const token = useAuthStore.getState().token;

      if (!token) {
        setError("No hay sesión activa. Por favor, inicie sesión nuevamente.");
        setLoading(false);
        return;
      }

      console.log(
        `Fetching data from: ${API_BASE_URL}/veterinary/profile/${clinicId}`
      );
      const response = await axios.get(
        `${API_BASE_URL}/veterinary/profile/${clinicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response);

      const clinic = response.data;

      // Mapear los datos de la API al formato del formulario
      setFormData({
        clinicName: clinic.nombre || "",
        address: clinic.direccion || "",
        city: clinic.ciudad || "",
        state: clinic.estado || "", // Incluir state property
        zipCode: clinic.codigo_postal || "",
        phone: clinic.telefono || "",
        email: clinic.correo || "",
        website: clinic.sitio_web || "",
        description: clinic.descripcion || "",
        nit: clinic.NIT || "",
        specialties: clinic.specialties || [],
        facilities: clinic.facilities || [],
        paymentMethods: clinic.paymentMethods || [],
        openingHours: clinic.openingHours
          ? clinic.openingHours
          : formData.openingHours,
      });
    } catch (err: any) {
      console.error("Error al cargar datos de la clínica:", err);
      console.log("Error response:", err.response);
      setError(`No se pudieron cargar los datos de la clínica: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  // Función para guardar los cambios según la pestaña activa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaveSuccess(false);

    console.log("Attempting to save all form data, active tab:", activeTab);
    console.log("Form data state:", formData);

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        setError("No hay sesión activa. Por favor, inicie sesión nuevamente.");
        setSaving(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const clinicId = (user as Vet).id_clinica;
      if (!clinicId) {
        setError(
          "No se pudo identificar la clínica. Por favor, inicie sesión nuevamente."
        );
        setSaving(false);
        return;
      }

      // Validate address
      if (!formData.address || formData.address.trim().length < 5) {
        setError(
          "La dirección es obligatoria y debe tener al menos 5 caracteres"
        );
        setSaving(false);
        return;
      }

      // Realizamos las tres peticiones secuencialmente
      try {
        // 1. Actualizar información básica
        const basicData = {
          nombre: formData.clinicName,
          direccion: formData.address,
          telefono: formData.phone,
          correo: formData.email,
          descripcion: formData.description,
          NIT: formData.nit,
          sitio_web: formData.website,
          codigo_postal: formData.zipCode,
          ciudad: formData.city,
        };

        console.log("Sending basic data to API:", basicData);
        const basicResponse = await axios.put(
          `${API_BASE_URL}/update/veterinary/info/${clinicId}`,
          basicData,
          config
        );
        console.log("Basic info API response:", basicResponse.data);
      } catch (basicError: any) {
        console.error("Error actualizando información básica:", basicError);
        setError(
          `Error en información básica: ${
            basicError.response?.data?.message || basicError.message
          }`
        );
        setSaving(false);
        return;
      }

      try {
        // 2. Actualizar horarios
        console.log("Sending hours data to API:", {
          openingHours: formData.openingHours,
        });
        const hoursResponse = await axios.put(
          `${API_BASE_URL}/update/veterinary/hours/${clinicId}`,
          { openingHours: formData.openingHours },
          config
        );
        console.log("Hours API response:", hoursResponse.data);
      } catch (hoursError: any) {
        console.error("Error actualizando horarios:", hoursError);
        setError(
          `Error en horarios: ${
            hoursError.response?.data?.message || hoursError.message
          }`
        );
        setSaving(false);
        return;
      }

      try {
        // 3. Actualizar detalles (especialidades y métodos de pago)
        const detailsData = {
          specialties: formData.specialties,
          paymentMethods: formData.paymentMethods,
          facilities: formData.facilities,
        };

        console.log("Sending details data to API:", detailsData);
        const detailsResponse = await axios.put(
          `${API_BASE_URL}/update/veterinary/details/${clinicId}`,
          detailsData,
          config
        );
        console.log("Details API response:", detailsResponse.data);
      } catch (detailsError: any) {
        console.error("Error actualizando detalles:", detailsError);
        setError(
          `Error en detalles: ${
            detailsError.response?.data?.message || detailsError.message
          }`
        );
        setSaving(false);
        return;
      }

      // Si todo salió bien, mostramos el mensaje de éxito
      setSaveMessage(
        "Se actualizó correctamente la información básica, horarios y detalles de la clínica"
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error: any) {
      console.error("Error al actualizar información:", error);
      console.log("Error details:", error.response?.data);

      setError(
        error.response?.data?.message ||
          `Error al actualizar la información: ${error.message}`
      );
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Cargando información de la clínica...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Información General
        </h1>
        <Button
          onClick={(e) => {
            console.log("Botón Guardar Cambios clickeado");
            handleSubmit(e);
          }}
          className="gap-1"
          disabled={saving}
          id="guardar-cambios-btn"
          type="button"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-100 text-green-800 border-green-300">
          <AlertCircle className="h-4 w-4" />
          <span>{saveMessage}</span>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-100 text-red-800 border-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      <Tabs
        defaultValue="basic"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
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
                <AddressAutocompleteInput
                  label="Dirección de la clínica"
                  placeholder="Escribe la dirección completa..."
                  name="address"
                  value={formData.address}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      address: value,
                    });
                  }}
                  required
                  className={
                    error?.includes("dirección") ? "border-destructive" : ""
                  }
                  errorMessage={
                    error?.includes("dirección") ? error : undefined
                  }
                />
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
