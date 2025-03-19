import type React from "react";

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  MapPin,
  Phone,
  ArrowLeft,
  Plus,
  Clipboard,
  DollarSign,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { ServiceItem } from "./service-item";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
// import { useAuth } from "@/context/auth-context"

// Actualizar la interfaz Service para incluir los nuevos campos
interface Service {
  id: string;
  name: string;
  price: string;
  category: string;
}

// Actualizar la interfaz para los horarios operativos
interface OperationalHours {
  monday: { open: string; close: string; is24Hours: boolean; closed: boolean };
  tuesday: { open: string; close: string; is24Hours: boolean; closed: boolean };
  wednesday: {
    open: string;
    close: string;
    is24Hours: boolean;
    closed: boolean;
  };
  thursday: {
    open: string;
    close: string;
    is24Hours: boolean;
    closed: boolean;
  };
  friday: { open: string; close: string; is24Hours: boolean; closed: boolean };
  saturday: {
    open: string;
    close: string;
    is24Hours: boolean;
    closed: boolean;
  };
  sunday: { open: string; close: string; is24Hours: boolean; closed: boolean };
}

interface VetClinicSignupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function VetClinicSignup({
  open,
  onOpenChange,
  onBack,
}: VetClinicSignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clinicName: "",
    address: "",
    phone: "",
    description: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    businessLicense: false,
    nit: "", // Nuevo campo para el NIT
  });

  // Inicializar los horarios operativos
  const [operationalHours, setOperationalHours] = useState<OperationalHours>({
    monday: { open: "09:00", close: "18:00", is24Hours: false, closed: false },
    tuesday: { open: "09:00", close: "18:00", is24Hours: false, closed: false },
    wednesday: {
      open: "09:00",
      close: "18:00",
      is24Hours: false,
      closed: false,
    },
    thursday: {
      open: "09:00",
      close: "18:00",
      is24Hours: false,
      closed: false,
    },
    friday: { open: "09:00", close: "18:00", is24Hours: false, closed: false },
    saturday: {
      open: "10:00",
      close: "14:00",
      is24Hours: false,
      closed: false,
    },
    sunday: { open: "00:00", close: "00:00", is24Hours: false, closed: true },
  });

  const [services, setServices] = useState<Service[]>([
    { id: uuidv4(), name: "", price: "", category: "general" },
  ]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [nitError, setNitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

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
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Manejar cambios en los horarios operativos
  const handleHoursChange = (
    day: keyof OperationalHours,
    field: string,
    value: string | boolean
  ) => {
    setOperationalHours({
      ...operationalHours,
      [day]: {
        ...operationalHours[day],
        [field]: value,
      },
    });
  };

  // Manejar cambio en la opción de 24 horas
  const handle24HoursChange = (
    day: keyof OperationalHours,
    checked: boolean
  ) => {
    setOperationalHours({
      ...operationalHours,
      [day]: {
        ...operationalHours[day],
        is24Hours: checked,
        // Si se activa 24 horas, establecer horarios predeterminados
        open: checked ? "00:00" : operationalHours[day].open,
        close: checked ? "23:59" : operationalHours[day].close,
      },
    });
  };

  const handleAddService = () => {
    setServices([
      ...services,
      { id: uuidv4(), name: "", price: "", category: "general" },
    ]);
  };

  const handleRemoveService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter((service) => service.id !== id));
    }
  };

  const handleServiceChange = (id: string, field: string, value: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar NIT antes de continuar
    if (step === 1 && formData.nit) {
      const nitRegex = /^[0-9-]{9,12}$/;
      if (!nitRegex.test(formData.nit)) {
        setNitError(
          "El NIT debe contener entre 9-12 caracteres (números y guiones)"
        );
        return;
      }
    }

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4); // Nuevo paso para horarios operativos
    } else {
      // Aquí enviarías todos los datos, incluyendo horarios operativos
      console.log("Submitting vet clinic registration:", {
        ...formData,
        services,
        operationalHours,
      });
      // Cerrar el diálogo y redirigir al dashboard
      onOpenChange(false);
      registerClinic({ ...formData, services, operationalHours });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  // const { login } = useAuth();

  const registerClinic = async (clinicData: any) => {
    try {
      // En una aplicación real, harías una llamada a la API para registrar la clínica
      // Para fines de demostración, simularemos un registro exitoso

      // Simular llamada a la API con un breve retraso
      setIsRegistering(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Crear objeto de datos de la clínica
      const clinicAuthData = {
        id: "clinic-" + Date.now(),
        name: clinicData.clinicName,
        email: clinicData.email,
        isAuthenticated: true,
      };

      // Usar el contexto de autenticación para iniciar sesión
      // login(clinicAuthData);

      // Redirigir al dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationError(
        "Hubo un problema al registrar la clínica. Por favor intenta de nuevo."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Función para renderizar el día de la semana en español
  const getDayName = (day: string): string => {
    const dayNames: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    };
    return dayNames[day] || day;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center">
            {step > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col items-center justify-center w-full">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Registro como Clínica Veterinaria</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? "Información de la clínica"
                  : step === 2
                  ? "Servicios y precios"
                  : step === 3
                  ? "Información de cuenta"
                  : "Horarios de atención"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clinicName">Nombre de la clínica</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinicName"
                    name="clinicName"
                    placeholder="Nombre de tu clínica"
                    className="pl-9"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
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
                <div className="relative">
                  <Input
                    id="nit"
                    name="nit"
                    placeholder="Ej. 900-123456-7"
                    className={nitError ? "border-red-500" : ""}
                    value={formData.nit}
                    onChange={handleChange}
                    required
                  />
                </div>
                {nitError && <p className="text-xs text-red-500">{nitError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Dirección de la clínica"
                    className="pl-9"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Número de teléfono"
                    className="pl-9"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción de la clínica</Label>
                <div className="relative">
                  <Clipboard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe brevemente tu clínica y especialidades"
                    className="min-h-[100px] pl-9"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessLicense"
                  checked={formData.businessLicense}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("businessLicense", checked as boolean)
                  }
                  required
                />
                <Label htmlFor="businessLicense" className="text-sm">
                  Confirmo que tengo licencia para operar como clínica
                  veterinaria
                </Label>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Servicios ofrecidos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddService}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar servicio
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {services.map((service) => (
                  <ServiceItem
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    price={service.price}
                    category={service.category}
                    onRemove={handleRemoveService}
                    onChange={handleServiceChange}
                  />
                ))}
              </div>

              <div className="rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">
                      Información de precios
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Los precios que indiques serán visibles para los dueños de
                      mascotas. Puedes actualizar esta información más adelante
                      desde tu panel de control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="clinica@email.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Crea una contraseña"
                    className="pl-9"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    className="pl-9"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("agreeTerms", checked as boolean)
                  }
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  Acepto los términos y condiciones y la política de privacidad
                </Label>
              </div>
            </div>
          ) : (
            // Paso 4: Horarios operativos
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Horarios de atención</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="all-24-hours" className="text-xs">
                    Todos 24 horas
                  </Label>
                  <Switch
                    id="all-24-hours"
                    onCheckedChange={(checked) => {
                      // Aplicar 24 horas a todos los días
                      const updatedHours = { ...operationalHours };
                      (
                        Object.keys(updatedHours) as Array<
                          keyof OperationalHours
                        >
                      ).forEach((day) => {
                        updatedHours[day] = {
                          ...updatedHours[day],
                          is24Hours: checked,
                          open: checked ? "00:00" : "09:00",
                          close: checked ? "23:59" : "18:00",
                          closed: false,
                        };
                      });
                      setOperationalHours(updatedHours);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {(
                  Object.keys(operationalHours) as Array<keyof OperationalHours>
                ).map((day) => (
                  <div key={day} className="grid gap-2 border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{getDayName(day)}</Label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`${day}-closed`} className="text-sm">
                            Cerrado
                          </Label>
                          <Switch
                            id={`${day}-closed`}
                            checked={operationalHours[day].closed}
                            onCheckedChange={(checked) => {
                              handleHoursChange(day, "closed", checked);
                              // Si se marca como cerrado, desactivar 24 horas
                              if (checked && operationalHours[day].is24Hours) {
                                handleHoursChange(day, "is24Hours", false);
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`${day}-24h`} className="text-sm">
                            24 horas
                          </Label>
                          <Switch
                            id={`${day}-24h`}
                            checked={operationalHours[day].is24Hours}
                            disabled={operationalHours[day].closed}
                            onCheckedChange={(checked) =>
                              handle24HoursChange(day, checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {!operationalHours[day].closed &&
                      !operationalHours[day].is24Hours && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`${day}-open`} className="text-sm">
                              Apertura
                            </Label>
                            <Input
                              id={`${day}-open`}
                              type="time"
                              value={operationalHours[day].open}
                              onChange={(e) =>
                                handleHoursChange(day, "open", e.target.value)
                              }
                              disabled={
                                operationalHours[day].closed ||
                                operationalHours[day].is24Hours
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${day}-close`} className="text-sm">
                              Cierre
                            </Label>
                            <Input
                              id={`${day}-close`}
                              type="time"
                              value={operationalHours[day].close}
                              onChange={(e) =>
                                handleHoursChange(day, "close", e.target.value)
                              }
                              disabled={
                                operationalHours[day].closed ||
                                operationalHours[day].is24Hours
                              }
                            />
                          </div>
                        </div>
                      )}

                    {operationalHours[day].is24Hours && (
                      <div className="text-sm text-muted-foreground italic">
                        Abierto las 24 horas
                      </div>
                    )}

                    {operationalHours[day].closed && (
                      <div className="text-sm text-muted-foreground italic">
                        Cerrado este día
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">
                      Información de horarios
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Los horarios que indiques serán visibles para los dueños
                      de mascotas. Puedes actualizar esta información más
                      adelante desde tu panel de control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {registrationError && (
              <div className="mb-4 w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {registrationError}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isRegistering}
            >
              {step === 1 ? "Volver" : "Anterior"}
            </Button>
            <Button
              type="submit"
              disabled={isRegistering || (step === 1 && !!nitError)}
            >
              {isRegistering ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  {step === 4 ? "Registrando..." : "Continuar"}
                </>
              ) : step === 4 ? (
                "Crear cuenta"
              ) : (
                "Continuar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
