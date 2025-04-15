import { useState } from "react"
import { useNavigate } from "react-router";
import { Check, ChevronRight, Clock, PawPrint } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Calendar} from "~/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Textarea } from "~/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"
import { format, type Day } from "date-fns"
import { es } from "date-fns/locale"
import "react-day-picker/style.css";


interface AppointmentSchedulerProps {
  clinicId: string
}

export function AppointmentScheduler({ clinicId }: AppointmentSchedulerProps) {
  const router = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    petId: "",
    serviceId: "",
    date: undefined as Date | undefined,
    timeSlot: "",
    reason: "",
    notes: "",
  })

  const customWeekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];


  // Datos simulados
  const pets = [
    { id: "1", name: "Max", type: "Perro", breed: "Labrador", image: "/placeholder.svg?height=60&width=60&text=Max" },
    { id: "2", name: "Luna", type: "Gato", breed: "Siamés", image: "/placeholder.svg?height=60&width=60&text=Luna" },
    {
      id: "3",
      name: "Rocky",
      type: "Perro",
      breed: "Bulldog",
      image: "/placeholder.svg?height=60&width=60&text=Rocky",
    },
  ]

  const services = [
    { id: "1", name: "Consulta General", price: "$500", duration: "30 min" },
    { id: "2", name: "Vacunación", price: "$350", duration: "20 min" },
    { id: "3", name: "Control de Rutina", price: "$450", duration: "30 min" },
    { id: "4", name: "Limpieza Dental", price: "$800", duration: "45 min" },
    { id: "5", name: "Desparasitación", price: "$300", duration: "15 min" },
  ]

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
  ]

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      // Enviar datos y redirigir
      console.log("Datos de la cita:", formData)
      router("/pet-dashboard/appointments?success=true")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!formData.petId
      case 2:
        return !!formData.serviceId
      case 3:
        return !!formData.date && !!formData.timeSlot
      case 4:
        return true // Siempre permitir completar el último paso
      default:
        return false
    }
  }

  const selectedPet = pets.find((pet) => pet.id === formData.petId)
  const selectedService = services.find((service) => service.id === formData.serviceId)

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
                      : "bg-muted text-muted-foreground",
                )}
              >
                {step > i ? <Check className="h-5 w-5" /> : <span>{i}</span>}
              </div>
              <span
                className={cn(
                  "text-xs hidden md:block",
                  step === i ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {i === 1 ? "Mascota" : i === 2 ? "Servicio" : i === 3 ? "Fecha y Hora" : "Confirmación"}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-muted" />
          </div>
          <div className="absolute inset-0 flex items-center" style={{ width: `${(step - 1) * 33.33}%` }}>
            <div className="h-1 bg-primary" />
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="mb-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Selecciona tu mascota</h2>
            <div className="grid gap-4">
              {pets.map((pet) => (
                <Card
                  key={pet.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.petId === pet.id
                      ? "border-primary ring-2 ring-primary ring-opacity-50"
                      : "hover:border-primary/50",
                  )}
                  onClick={() => setFormData({ ...formData, petId: pet.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pet.type} • {pet.breed}
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border">
                        {formData.petId === pet.id && <Check className="h-4 w-4 text-primary" />}
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
            <h2 className="text-xl font-semibold mb-4">Selecciona el servicio</h2>
            <div className="grid gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.serviceId === service.id
                      ? "border-primary ring-2 ring-primary ring-opacity-50"
                      : "hover:border-primary/50",
                  )}
                  onClick={() => setFormData({ ...formData, serviceId: service.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">Duración: {service.duration}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{service.price}</span>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border">
                          {formData.serviceId === service.id && <Check className="h-4 w-4 text-primary" />}
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
            <h2 className="text-xl font-semibold mb-4">Selecciona fecha y hora</h2>

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
                      variant={formData.timeSlot === time ? "default" : "outline"}
                      className={cn("justify-start", formData.timeSlot === time && "text-primary-foreground")}
                      onClick={() => setFormData({ ...formData, timeSlot: time })}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Motivo de la consulta</h3>
              <Textarea
                placeholder="Describe brevemente el motivo de tu visita..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                      <img
                        src={selectedPet.image || "/placeholder.svg"}
                        alt={selectedPet.name}
                        className="object-cover"
                      />
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
                    <span className="font-medium">{formData.date && format(formData.date, "PPP", { locale: es })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora:</span>
                    <span className="font-medium">{formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{selectedService?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-medium">{selectedService?.price}</span>
                  </div>
                </div>

                {formData.reason && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-1">Motivo de la consulta:</h4>
                    <p className="text-sm">{formData.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Notas adicionales (opcional)</h3>
                <Textarea
                  placeholder="¿Algo más que debamos saber?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Preferencia de recordatorio</h3>
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
                <input type="checkbox" id="terms" className="rounded border-gray-300" />
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
  )
}

