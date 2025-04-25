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
  CheckCircle2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { ServiceItem } from "./service-item";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  vetClinicSchema,
  type VetClinicFormData,
} from "~/zodSchemas/vetClinic";
import { v4 as uuidv4 } from "uuid";

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
  const [services, setServices] = useState<Service[]>([
    { id: uuidv4(), name: "", price: "", category: "general" },
  ]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [healthCertificateFile, setHealthCertificateFile] =
    useState<File | null>(null);
  const [attemptedFinalSubmit, setAttemptedFinalSubmit] = useState(false);

  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    control,
    trigger,
    getValues,
    setValue,
    clearErrors,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(vetClinicSchema),
    defaultValues: {
      clinicName: "",
      address: "",
      phone: "",
      description: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
      businessLicense: false,
      nit: "",
    },
    mode: "onChange", // Change from onSubmit to onChange for real-time validation
  });

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setValue(name as any, checked);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHealthCertificateFile(e.target.files[0]);
    }
  };

  // Function to handle form navigation
  const handleNext = async () => {
    if (step === 1) {
      // Validate fields for step 1
      const isValid = await trigger([
        "clinicName",
        "nit",
        "address",
        "phone",
        "description",
        "businessLicense",
      ]);

      if (!isValid) return;

      // Check if health certificate file is uploaded
      if (!healthCertificateFile) {
        setRegistrationError(
          "Por favor, cargue el Certificado de la Secretaría Distrital de Salud"
        );
        return;
      }

      setRegistrationError(null); // Clear any previous errors
      setStep(2);
    } else if (step === 2) {
      // Validate that at least one service is filled out
      const hasValidService = services.some(
        (service) => service.name.trim() !== "" && service.price.trim() !== ""
      );

      if (!hasValidService) {
        setRegistrationError(
          "Por favor, agregue al menos un servicio con nombre y precio"
        );
        return;
      }

      setRegistrationError(null); // Clear any previous errors
      clearErrors(); // Clear all form validation errors before showing step 3
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  // Function to submit the form to the backend
  const submitVetRegistration = async (
    formData: z.infer<typeof vetClinicSchema>
  ) => {
    try {
      setIsRegistering(true);
      setRegistrationError(null);

      // Create FormData object to send to the backend
      const apiFormData = new FormData();

      // Add form fields to FormData
      apiFormData.append("nombre", formData.clinicName);
      apiFormData.append("direccion", formData.address);
      apiFormData.append("telefono", formData.phone);
      apiFormData.append("correo", formData.email);
      apiFormData.append("contrasena", formData.password);
      apiFormData.append("descripcion", formData.description || "");
      apiFormData.append("NIT", formData.nit);

      // Add certificate file with correct field name
      if (healthCertificateFile) {
        apiFormData.append("certificadoSalud", healthCertificateFile);
      }

      // Add services as JSON string
      apiFormData.append("servicios", JSON.stringify(services));

      console.log("Enviando datos al servidor...");

      try {
        const response = await fetch(
          `http://localhost:3001/register/veterinary`,
          {
            method: "POST",
            body: apiFormData,
          }
        );

        console.log("Respuesta del servidor:", response.status);

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
          console.log("Datos de respuesta:", data);
        } else {
          const text = await response.text();
          console.log("Respuesta del servidor (texto):", text);
          data = { message: text || "Error del servidor" };
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Error ${response.status}: ${response.statusText}`
          );
        }

        console.log("Registro exitoso:", data);

        // Show success instead of immediate redirect
        setRegistrationSuccess(true);
      } catch (fetchError: any) {
        console.error("Error de fetch:", fetchError);
        throw new Error(
          fetchError.message ||
            "Error de conexión con el servidor. Asegúrate de que el servidor esté configurado correctamente."
        );
      }
    } catch (error: any) {
      console.error("Error durante el registro:", error);
      setRegistrationError(
        error.message || "Ocurrió un error durante el registro"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle final form submission
  const onSubmit = (data: z.infer<typeof vetClinicSchema>) => {
    if (step < 3) {
      // This shouldn't be called for steps 1-2, but just in case
      handleNext();
      return;
    }

    // Only submit the data on the final step
    submitVetRegistration(data);
  };

  // New function to handle final submission attempt
  const handleFinalSubmit = async () => {
    setAttemptedFinalSubmit(true);

    // Validate only the account fields
    const isValid = await trigger([
      "email",
      "password",
      "confirmPassword",
      "agreeTerms",
    ]);

    if (isValid) {
      // If valid, submit the form
      handleFormSubmit(onSubmit)();
    }
  };

  // Function to redirect to dashboard
  const redirectToDashboard = () => {
    window.location.href = "/dashboard-vet";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {registrationSuccess ? (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Registro Exitoso</DialogTitle>
              <DialogDescription>
                Su clínica veterinaria ha sido registrada correctamente.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <p className="text-center text-sm">
              Podrá iniciar sesión y comenzar a gestionar su clínica en el panel
              de control.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={redirectToDashboard}
              className="w-full"
            >
              Ir al Panel de Control
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
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
                    : "Información de cuenta"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleFormSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {step === 1 ? (
              <div className="grid gap-4 py-4 overflow-y-auto pl-1 pr-1 max-h-[60vh]">
                <div className="grid gap-2">
                  <Label htmlFor="clinicName">Nombre de la clínica</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clinicName"
                      {...register("clinicName")}
                      placeholder="Nombre de tu clínica"
                      className={`pl-9 ${
                        errors.clinicName ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.clinicName && (
                    <p className="text-xs text-red-500">
                      {errors.clinicName.message as string}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nit">
                    NIT (Número de Identificación Tributaria)
                  </Label>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 ml-1"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">
                              Información sobre NIT
                            </span>
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
                      {...register("nit")}
                      placeholder="Ej. 900-123456-7"
                      className={errors.nit ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.nit && (
                    <p className="text-xs text-red-500">
                      {errors.nit.message as string}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="healthCertificate">
                    Certificado vigente expedido por la Secretaría Distrital de
                    Salud
                  </Label>
                  <div className="relative">
                    <Input
                      id="healthCertificate"
                      name="healthCertificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      required
                      className="cursor-pointer"
                    />
                  </div>
                  {healthCertificateFile && (
                    <p className="text-xs text-muted-foreground">
                      Archivo seleccionado: {healthCertificateFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos aceptados: PDF, JPG, JPEG, PNG. Tamaño máximo: 5MB.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Dirección de la clínica"
                      className={`pl-9 ${
                        errors.address ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-500">
                      {errors.address.message as string}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...register("phone")}
                      type="tel"
                      placeholder="Número de teléfono"
                      className={`pl-9 ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message as string}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción de la clínica</Label>
                  <div className="relative">
                    <Clipboard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe brevemente tu clínica y especialidades"
                      className="min-h-[100px] pl-9"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="businessLicense"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="businessLicense"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="businessLicense" className="text-sm">
                    Confirmo que tengo licencia para operar como clínica
                    veterinaria
                  </Label>
                </div>
                {errors.businessLicense && (
                  <p className="text-xs text-red-500">
                    {errors.businessLicense.message as string}
                  </p>
                )}
              </div>
            ) : step === 2 ? (
              <div className="grid gap-4 py-4 overflow-y-auto pr-1 max-h-[60vh]">
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
                        Los precios que indiques serán visibles para los dueños
                        de mascotas. Puedes actualizar esta información más
                        adelante desde tu panel de control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Step 3: Account information
              <div className="grid gap-4 py-4 overflow-y-auto pr-1 max-h-[60vh]">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="clinica@email.com"
                      className={`pl-9 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      {...register("password")}
                      type="password"
                      placeholder="Crea una contraseña"
                      className={`pl-9 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message as string}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>La contraseña debe contener:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Al menos 8 caracteres</li>
                      <li>Al menos una letra minúscula (a-z)</li>
                      <li>Al menos una letra mayúscula (A-Z)</li>
                      <li>Al menos un número (0-9)</li>
                      <li>Al menos un carácter especial (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="Confirma tu contraseña"
                      className={`pl-9 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="agreeTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="agreeTerms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    Acepto los términos y condiciones y la política de
                    privacidad
                  </Label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-xs text-red-500">
                    {errors.agreeTerms.message as string}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="mt-2 pt-2 border-t">
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
              {step < 3 ? (
                // For steps 1-2, use a button that calls handleNext directly
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    isRegistering || (step === 1 && !healthCertificateFile)
                  }
                >
                  Continuar
                </Button>
              ) : (
                // Only on step 3, use a button that triggers validation and then submits
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Registrando...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
