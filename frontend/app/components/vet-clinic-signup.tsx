import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Building2,
  Mail,
  Lock,
  // MapPin, // Removed as it's likely handled within GooglePlacesAutocomplete or not needed
  Phone,
  ArrowLeft,
  Plus,
  Clipboard,
  DollarSign,
  Info,
  CheckCircle2,
  Loader2,
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

import { AddressAutocompleteInput } from "./adressAutocompleteInput";

interface Service {
  id: string;
  name: string;
  price: string;
  category: string;
}

// Interface OperationalHours (assuming it remains the same)
// interface OperationalHours { ... } // Keep if needed elsewhere, otherwise remove

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

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    control,
    trigger,
    setValue,
    clearErrors,
    // --- Removed watch ---
  } = useForm<VetClinicFormData>({
    resolver: zodResolver(vetClinicSchema),
    defaultValues: {
      clinicName: "",
      nit: "",
      address: "", // Ensure address has a default value
      phone: "",
      description: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
      businessLicense: false,
    },
    mode: "onChange", // Or "onBlur"
  });

  const handleCheckboxChange = (
    name: keyof VetClinicFormData,
    checked: boolean
  ) => {
    setValue(name, checked, { shouldValidate: true });
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

  const handleServiceChange = (
    id: string,
    field: keyof Service,
    value: string
  ) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHealthCertificateFile(e.target.files[0]);
      // Optionally clear previous errors related to the file if needed
    } else {
      setHealthCertificateFile(null);
    }
  };

  // Function to handle form navigation
  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      // Validate fields for step 1, including address
      isValid = await trigger([
        "clinicName",
        "nit",
        "address", // Ensure address is validated
        "phone",
        "description",
        "businessLicense",
      ]);

      if (!isValid) return;

      if (!healthCertificateFile) {
        setRegistrationError(
          "Por favor, cargue el Certificado de la Secretaría Distrital de Salud"
        );
        // Optionally trigger validation for a hidden file input if using RHF for it
        return;
      }

      setRegistrationError(null);
      setStep(2);
    } else if (step === 2) {
      const hasValidService = services.some(
        (service) => service.name.trim() !== "" && service.price.trim() !== ""
      );

      if (!hasValidService) {
        setRegistrationError(
          "Por favor, agregue al menos un servicio con nombre y precio"
        );
        return;
      }

      // Duplicados por nombre (case-insensitive, trim)
      const names = services
        .map((s) => s.name.trim().toLowerCase())
        .filter((n) => n !== "");
      const hasDuplicateNames = new Set(names).size !== names.length;

      if (hasDuplicateNames) {
        setRegistrationError("No se permiten servicios con el mismo nombre.");
        return;
      }

      setRegistrationError(null);
      clearErrors(); // Clear all form validation errors before showing step 3
      setStep(3);
    }
    // No 'else' needed as step 3 submits
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
      setRegistrationError(null); // Clear errors when going back
    }
  };

  /**
   * Submit veterinary clinic registration to backend.
   * @param {VetClinicFormData} formData - Validated form data.
   * @returns {Promise<void>}
   */
  const submitVetRegistration = async (formData: VetClinicFormData) => {
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const apiFormData = new FormData();

      // Append standard form fields
      apiFormData.append("nombre", formData.clinicName);
      apiFormData.append("direccion", formData.address); // Use validated address
      apiFormData.append("telefono", formData.phone);
      apiFormData.append("correo", formData.email);
      apiFormData.append("contrasena", formData.password);
      apiFormData.append("descripcion", formData.description || "");
      apiFormData.append("NIT", formData.nit);

      // Append coordinates if available and needed by backend
      // if (coordinates?.lat && coordinates?.lng) {
      //   apiFormData.append("latitud", coordinates.lat.toString());
      //   apiFormData.append("longitud", coordinates.lng.toString());
      // } else {
      //   console.error("Coordinates missing at submission");
      //   setRegistrationError(
      //     "No se pudieron determinar las coordenadas de la dirección. Por favor, seleccione una dirección válida."
      //   );
      //   setIsRegistering(false);
      //   return;
      // }

      // Append file if selected
      if (healthCertificateFile) {
        apiFormData.append("certificadoSalud", healthCertificateFile);
      } else {
        // Handle case where file might be mandatory but wasn't caught earlier
        console.error("Health certificate file is missing at submission.");
        setRegistrationError("Falta el certificado de salud.");
        setIsRegistering(false);
        return; // Stop submission
      }

      // Append services
      apiFormData.append("servicios", JSON.stringify(services));

      console.log(
        "Submitting FormData:",
        Object.fromEntries(apiFormData.entries())
      ); // Log FormData content for debugging

      const response = await fetch(
        `http://localhost:3001/register/veterinary`, // Consider using environment variables for API URL
        {
          method: "POST",
          body: apiFormData,
          // No 'Content-Type' header needed for FormData; browser sets it with boundary
        }
      );

      console.log("Server Response Status:", response.status);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
        console.log("Server Response JSON:", data);
      } else {
        const text = await response.text();
        console.log("Server Response Text:", text);
        // Attempt to create a meaningful error message from text response
        data = { message: text || `Server returned status ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(
          data?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      console.log("Registration successful:", data);
      setRegistrationSuccess(true); // Show success dialog
    } catch (error: any) {
      console.error("Error during registration submission:", error);
      setRegistrationError(
        error.message ||
          "Ocurrió un error durante el registro. Intente de nuevo."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle final form submission trigger
  const onSubmit = (data: VetClinicFormData) => {
    // This function is called by react-hook-form's handleSubmit
    // only when the form is valid according to the schema.
    if (step < 3) {
      // This case should ideally not happen if buttons are managed correctly,
      // but acts as a safeguard.
      console.warn("onSubmit called on step", step, "- navigating next.");
      handleNext();
      return;
    }

    // Log data just before sending
    console.log("Final form data validated:", data);
    // console.log("Coordinates state at submission:", coordinates);

    // Proceed with the actual API call
    submitVetRegistration(data);
  };

  // Function to handle the click on the final submit button
  const handleFinalSubmit = async () => {
    setAttemptedFinalSubmit(true); // Keep if used for UI feedback

    // Validate only the fields relevant to the current (final) step
    const isValid = await trigger([
      "email",
      "password",
      "confirmPassword",
      "agreeTerms",
    ]);

    if (isValid) {
      // If step 3 fields are valid, let RHF's handleSubmit trigger the full validation
      // and call `onSubmit` if everything passes.
      handleFormSubmit(onSubmit)();
    } else {
      console.log("Step 3 validation failed.");
      // Errors will be displayed automatically by RHF
    }
  };

  // Function to redirect to dashboard
  const redirectToDashboard = () => {
    // Consider using react-router's navigate function if using React Router
    window.location.href = "/dashboard-vet";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {registrationSuccess ? (
        // --- Success Dialog Content (remains the same) ---
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
        // --- Main Signup Form Dialog Content ---
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            {/* Header content remains the same */}
            <div className="flex items-center">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 h-8 w-8"
                  onClick={handleBack}
                  disabled={isRegistering} // Disable back button during registration
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
              {/* Add a placeholder for the back button width if needed for alignment */}
              {step === 1 && <div className="w-8 mr-2" />}
            </div>
          </DialogHeader>

          {/* Use handleFormSubmit here, but button types control flow */}
          <form
            onSubmit={handleFormSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
            noValidate // Prevent browser validation, rely on RHF/Zod
          >
            {/* --- Step 1: Clinic Information --- */}
            {step === 1 && (
              <div className="grid gap-4 py-4 overflow-y-auto pl-1 pr-1 max-h-[calc(90vh-200px)]">
                {" "}
                {/* Adjust max-height */}
                {/* Clinic Name */}
                <div className="grid gap-2">
                  <Label htmlFor="clinicName">Nombre de la clínica</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clinicName"
                      {...register("clinicName")}
                      placeholder="Nombre de tu clínica"
                      className={`pl-9 ${
                        errors.clinicName ? "border-destructive" : ""
                      }`}
                      aria-invalid={errors.clinicName ? "true" : "false"}
                    />
                  </div>
                  {errors.clinicName && (
                    <p className="text-xs text-destructive">
                      {errors.clinicName.message}
                    </p>
                  )}
                </div>
                {/* NIT */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nit">
                      NIT (Número de Identificación Tributaria)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button" // Prevent form submission
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0" // Smaller icon button
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
                    {/* No icon needed for NIT typically */}
                    <Input
                      id="nit"
                      {...register("nit")}
                      placeholder="Ej. 900-123456-7"
                      className={errors.nit ? "border-destructive" : ""}
                      aria-invalid={errors.nit ? "true" : "false"}
                    />
                  </div>
                  {errors.nit && (
                    <p className="text-xs text-destructive">
                      {errors.nit.message}
                    </p>
                  )}
                </div>
                {/* Health Certificate */}
                <div className="grid gap-2">
                  <Label htmlFor="healthCertificate">
                    Certificado Camara de Comercio
                  </Label>
                  <Input
                    id="healthCertificate"
                    name="healthCertificate" // Name is important for FormData
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    // required // RHF doesn't handle file required well, validate manually in handleNext/submit
                    className={`cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${
                      !healthCertificateFile &&
                      attemptedFinalSubmit &&
                      step === 1 // Example: Show error border if submit attempted and file missing
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  {healthCertificateFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Archivo: {healthCertificateFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG. Max 5MB.
                  </p>
                  {/* Manual error display if needed */}
                  {!healthCertificateFile &&
                    registrationError?.includes("Certificado") && (
                      <p className="text-xs text-destructive">
                        {registrationError}
                      </p>
                    )}
                </div>
                {/* Address - Uses AddressAutocompleteInput component */}
                <Controller
                  name="address"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <AddressAutocompleteInput
                      label="Dirección de la clínica"
                      placeholder="Escribe la dirección completa..."
                      name={field.name}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      required
                      className={error ? "border-destructive" : ""}
                      disabled={isRegistering || field.disabled}
                      errorMessage={error?.message}
                    />
                  )}
                />
                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...register("phone")}
                      type="tel"
                      placeholder="Número de teléfono"
                      className={`pl-9 ${
                        errors.phone ? "border-destructive" : ""
                      }`}
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción de la clínica</Label>
                  <div className="relative">
                    <Clipboard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe brevemente tu clínica y especialidades (opcional)"
                      className="min-h-[100px] pl-9"
                      // No error border needed if optional
                    />
                  </div>
                  {/* No error message needed if optional */}
                </div>
                {/* Business License Checkbox */}
                <div className="flex items-start space-x-2 pt-2">
                  <Controller
                    name="businessLicense"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="businessLicense"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={errors.businessLicense ? "true" : "false"}
                        className={
                          errors.businessLicense ? "border-destructive" : ""
                        }
                      />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="businessLicense"
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        errors.businessLicense ? "text-destructive" : ""
                      }`}
                    >
                      Confirmo que tengo licencia para operar como clínica
                      veterinaria
                    </Label>
                    {errors.businessLicense && (
                      <p className="text-xs text-destructive">
                        {errors.businessLicense.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- Step 2: Services --- */}
            {step === 2 && (
              <div className="grid gap-4 py-4 overflow-y-auto pr-1 max-h-[calc(90vh-200px)]">
                {" "}
                {/* Adjust max-height */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Servicios ofrecidos</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                    className="flex items-center gap-1"
                    disabled={isRegistering}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar servicio
                  </Button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {" "}
                  {/* Added padding-right */}
                  {services.map((service, index) => (
                    <ServiceItem
                      key={service.id}
                      id={service.id}
                      name={service.name}
                      price={service.price}
                      category={service.category}
                      onRemove={handleRemoveService}
                      onChange={handleServiceChange}
                      isRemovable={services.length > 1} // Pass prop to disable remove on last item
                      // Consider adding error handling display per item if needed
                    />
                  ))}
                </div>
                {/* Display general service error if needed */}
                {registrationError?.includes("servicio") && (
                  <p className="text-xs text-destructive mt-2">
                    {registrationError}
                  </p>
                )}
                <div className="rounded-md border bg-muted p-4 mt-4">
                  {" "}
                  {/* Added border */}
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-semibold">
                        Información de precios
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Los precios que indiques serán visibles para los dueños
                        de mascotas. Puedes actualizar esta información más
                        adelante desde tu panel de control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Step 3: Account Information --- */}
            {step === 3 && (
              <div className="grid gap-4 py-4 overflow-y-auto pr-1 max-h-[calc(90vh-200px)]">
                {" "}
                {/* Adjust max-height */}
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="clinica@email.com"
                      className={`pl-9 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      {...register("password")}
                      type="password"
                      placeholder="Crea una contraseña segura"
                      className={`pl-9 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                  {/* Password requirements hint */}
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>La contraseña debe contener al menos:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li>8 caracteres</li>
                      <li>Una minúscula (a-z)</li>
                      <li>Una mayúscula (A-Z)</li>
                      <li>Un número (0-9)</li>
                      <li>Un símbolo (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>
                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="Vuelve a escribir la contraseña"
                      className={`pl-9 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {/* Terms Checkbox */}
                <div className="flex items-start space-x-2 pt-2">
                  <Controller
                    name="agreeTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="agreeTerms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={errors.agreeTerms ? "true" : "false"}
                        className={
                          errors.agreeTerms ? "border-destructive" : ""
                        }
                      />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreeTerms"
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        errors.agreeTerms ? "text-destructive" : ""
                      }`}
                    >
                      Acepto los{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        términos y condiciones
                      </a>{" "}
                      y la{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        política de privacidad
                      </a>
                    </Label>
                    {errors.agreeTerms && (
                      <p className="text-xs text-destructive">
                        {errors.agreeTerms.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- Footer with Buttons and Error Message --- */}
            <DialogFooter className="mt-auto pt-4 border-t flex-col sm:flex-row sm:justify-between">
              {" "}
              {/* Ensure footer sticks to bottom */}
              <div className="w-full mb-2 sm:mb-0 sm:flex-1">
                {" "}
                {/* Error message container */}
                {registrationError && (
                  <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center sm:text-left">
                    {registrationError}
                  </div>
                )}
              </div>
              <div className="flex w-full justify-end space-x-2">
                {" "}
                {/* Button container */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isRegistering}
                  className="w-full sm:w-auto"
                >
                  {step === 1 ? "Volver a Selección" : "Anterior"}
                </Button>
                {step < 3 ? (
                  <Button
                    type="button" // Important: Not type="submit"
                    onClick={handleNext}
                    disabled={isRegistering} // Disable while registering
                    className="w-full sm:w-auto"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="button" // Changed to button, triggers validation via handleFinalSubmit
                    onClick={handleFinalSubmit}
                    disabled={isRegistering}
                    className="w-full sm:w-auto"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
