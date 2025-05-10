import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronRight, Clock, PawPrint } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { format, type Day } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";
import { useAuthStore } from "~/stores/useAuthStore";
import type { Owner } from "~/types/usersTypes";

interface AppointmentSchedulerProps {
  clinicId: string;
}

export function AppointmentScheduler({ clinicId }: AppointmentSchedulerProps) {
  const router = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    petId: "",
    serviceId: "",
    date: undefined as Date | undefined,
    timeSlot: "",
    reason: "",
    notes: "",
  });

  // Tipos de mascotas
  interface Mascota {
    id: string;
    name: string;
    type: string;
    breed: string;
    // Otros campos que tengas, como imagen, edad, etc
  }

  // Tipos de servicios
  interface Servicio {
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    image?: string;
    // Otros campos si los tienes
  }

  const customWeekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = useAuthStore((state) => state.token);
  console.log(token);

  const [mascotas, setMascotas] = useState<Mascota[]>([]);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        //const token = localStorage.getItem("token");
        const user = useAuthStore.getState().user;
        const userType = useAuthStore.getState().userType;

        if (!token || !user || userType !== "owner") {
          console.error("Token no encontrado o usuario no válido");
          return;
        }

        const owner = user as Owner;

        const response = await fetch(
          `${API_URL}/pets/get?id_usuario=${owner.id_usuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener mascotas");
        }

        const data = await response.json();

        const mascotasFormateadas = data.mascotas.map((mascota: any) => ({
          id: mascota.id_mascota || mascota.id,
          name: mascota.nombre || "Sin nombre",
          type: mascota.especie || "Sin tipo",
          breed: mascota.raza || "Sin raza",
          image:
            mascota.foto_url ||
            "/placeholder.svg?height=60&width=60&text=" +
              (mascota.nombre || "Mascota"),
        }));

        setMascotas(mascotasFormateadas);
      } catch (error) {
        console.error("Error trayendo mascotas:", error);
      }
    };

    fetchMascotas();
  }, []);

  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch(`${API_URL}/clinic/${clinicId}/services`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener servicios");
        }

        const data = await response.json();

        const serviciosFormateados = data.servicios.map((servicio: any) => ({
          id: servicio.id_servicio,
          name: servicio.nombre,
          duration: servicio.duracion || 30, // 🔥 Si no guardas duración aún, pone un default de 30 min
          price: servicio.precio || 0,
          description: servicio.descripcion || "",
          image: servicio.imagen || "/placeholder.svg",
        }));

        setServicios(serviciosFormateados);
      } catch (error) {
        console.error("Error trayendo servicios:", error);
      }
    };

    if (clinicId) {
      fetchServicios();
    }
  }, [clinicId]);

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ];

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      try {
        const token = localStorage.getItem("token"); // Recuperar el token

        if (!token) {
          alert("No estás autenticado");
          return;
        }

        const response = await fetch(`${API_URL}/appointments/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔥 Mandar el token como Authorization Bearer
          },
          body: JSON.stringify({
            petId: formData.petId,
            serviceId: formData.serviceId,
            clinicId: clinicId,
            date: formData.date?.toISOString(), // fecha en formato ISO
            timeSlot: formData.timeSlot,
            reason: formData.reason,
            notes: formData.notes,
            acceptedTerms: true, // 🔥 Backend espera que venga esto explícitamente
            reminderPreference: "both", // Opcional
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al crear la cita");
        }

        // Si todo salió bien, redirigimos
        router("/dashboard-client/appointments?success=true");
      } catch (error) {
        console.error("Error agendando cita:", error);
        alert("Hubo un problema al programar tu cita. Inténtalo más tarde.");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!formData.petId;
      case 2:
        return !!formData.serviceId;
      case 3:
        return !!formData.date && !!formData.timeSlot;
      case 4:
        return true; // Siempre permitir completar el último paso
      default:
        return false;
    }
  };

  const selectedPet = mascotas.find((pet) => pet.id === formData.petId);
  const selectedService = servicios.find(
    (service) => service.id === formData.serviceId
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                  step === i
                    ? "bg-primary text-primary-foreground"
                    : step > i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > i ? <Check className="h-5 w-5" /> : <span>{i}</span>}
              </div>
              <span
                className={cn(
                  "text-xs hidden md:block",
                  step === i
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {i === 1
                  ? "Mascota"
                  : i === 2
                  ? "Servicio"
                  : i === 3
                  ? "Fecha y Hora"
                  : "Confirmación"}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-muted" />
          </div>
          <div
            className="absolute inset-0 flex items-center"
            style={{ width: `${(step - 1) * 33.33}%` }}
          >
            <div className="h-1 bg-primary" />
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="mb-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Selecciona tu mascota
            </h2>
            <div className="grid gap-4">
              {mascotas.map((pet) => (
                <Card
                  key={pet.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.petId === pet.id
                      ? "border-primary ring-2 ring-primary ring-opacity-50"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => setFormData({ ...formData, petId: pet.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pet.type} • {pet.breed}
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border">
                        {formData.petId === pet.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="mt-2" asChild>
                <a href="/pet-dashboard/pets/add">
                  <PawPrint className="mr-2 h-4 w-4" />
                  Agregar nueva mascota
                </a>
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Selecciona el servicio
            </h2>
            <div className="grid gap-4">
              {servicios.map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.serviceId === service.id
                      ? "border-primary ring-2 ring-primary ring-opacity-50"
                      : "hover:border-primary/50"
                  )}
                  onClick={() =>
                    setFormData({ ...formData, serviceId: service.id })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Duración: {service.duration}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{service.price}</span>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border">
                          {formData.serviceId === service.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Selecciona fecha y hora
            </h2>

            <div>
              {/*<div className="grid gap-6 md:grid-cols-2">*/}
              <div>
                <h3 className="text-sm font-medium mb-2">Fecha</h3>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    disabled={
                      (date) => date < new Date() || date.getDay() === 0 // Domingo
                    }
                    locale={es}
                    className="rounded-md border"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Hora</h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={
                        formData.timeSlot === time ? "default" : "outline"
                      }
                      className={cn(
                        "justify-start",
                        formData.timeSlot === time && "text-primary-foreground"
                      )}
                      onClick={() =>
                        setFormData({ ...formData, timeSlot: time })
                      }
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">
                Motivo de la consulta
              </h3>
              <Textarea
                placeholder="Describe brevemente el motivo de tu visita..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirma tu cita</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumen de la cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPet && (
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                      <img alt={selectedPet.name} className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedPet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPet.type} • {selectedPet.breed}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">
                      {formData.date &&
                        format(formData.date, "PPP", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora:</span>
                    <span className="font-medium">{formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">
                      {selectedService?.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-medium">
                      {selectedService?.price}
                    </span>
                  </div>
                </div>

                {formData.reason && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-1">
                      Motivo de la consulta:
                    </h4>
                    <p className="text-sm">{formData.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Notas adicionales (opcional)
                </h3>
                <Textarea
                  placeholder="¿Algo más que debamos saber?"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">
                  Preferencia de recordatorio
                </h3>
                <RadioGroup defaultValue="both" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Email y SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Solo email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms">Solo SMS</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300"
                />
                <label htmlFor="terms" className="text-sm">
                  Acepto los términos y condiciones de la clínica veterinaria
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!isStepComplete()}>
          {step < 4 ? (
            <>
              Continuar
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Confirmar Cita"
          )}
        </Button>
      </div>
    </div>
  );
}
