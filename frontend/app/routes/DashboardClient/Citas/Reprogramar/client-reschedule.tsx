import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router";
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, RefreshCw, AlertCircle } from "lucide-react"
import { useAuthStore } from "~/stores/useAuthStore";

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar as CalendarComponent } from "~/components/ui/calendar"

export default function RescheduleAppointmentPage() {
  const router = useNavigate();
  const {id: appoinmentID} = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [formattedDate, setFormattedDate] = useState("")
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [formData, setFormData] = useState({
    time: "",
    reason: "",
    notifyClinic: "yes",
  })

  const [appointmentDetails, setAppointmentDetails] = useState<{
    clinicName: string;
    originalDate: string;
    originalTime: string;
  } | null>(null);

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (date) {
      setFormattedDate(format(date, "d 'de' MMMM, yyyy", { locale: es }))
    }
  }, [date])

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const token = useAuthStore.getState().token;
        const response = await fetch(`${API_URL}/appointments/${appoinmentID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error("Error al obtener cita");
  
        const {appointment} = await response.json();
  
        setAppointmentDetails({
          clinicName: appointment.clinicName,
          originalDate: format(new Date(appointment.date), "d 'de' MMMM yyyy", { locale: es }),
          originalTime: appointment.time,
        });
      } catch (error) {
        console.error("No se pudo cargar la cita:", error);
      }
    };
  
    if (appoinmentID) fetchAppointmentDetails();
  }, [appoinmentID]);
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en el select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("enviando...")

        // Validar que se hayan completado los campos requeridos
        if (!date || !formData.time) {
            toast.error("Por favor, selecciona una fecha y hora para reprogramar la cita.")
            return
        }
        
        setIsSubmitting(true)
        
        try {
            const token = useAuthStore.getState().token;
            
            console.log("-> Ejecutando fetch PATCH a:", `${API_URL}/appointment/${appoinmentID}/reschedule`);

            if (!token || !appoinmentID) {
            throw new Error("Token o ID de cita no encontrado")
            }
            console.log("Token:", token);
            console.log("Appointment ID:", appoinmentID);
            console.log("Payload:", {
                date: date.toISOString().split("T")[0],
                time: formData.time,
                reason: formData.reason,
            });

            const response = await fetch(`${API_URL}/appointment/${appoinmentID}/reschedule`, {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
                body: JSON.stringify({
                date: date.toISOString().split("T")[0], // formato YYYY-MM-DD
                time: formData.time,
                reason: formData.reason,
             }),
        })

        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Response body:", result);
    
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Error al reprogramar la cita")
        }
    
        

        setTimeout(() => {
            toast.success("Tu cita ha sido reprogramada exitosamente.");
            router(`/dashboard-client/appointments/${appoinmentID}`),{
                state: { toast: "success" }
            }
        }, 1500)
        } catch (error: any) {
            toast.error( "Error al reprogramar la cita.");
                
        } finally {
            setIsSubmitting(false)
        }
    }

  // Opciones de horarios disponibles (en una app real, esto vendría del servidor)
  const availableTimes = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
  ]

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router(-1)}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Reprogramar Cita</h1>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription >
            {appointmentDetails ? (
                <span>
                    Estás reprogramando tu cita con <strong>{appointmentDetails.clinicName}</strong>, originalmente
                    programada para el <strong>{appointmentDetails.originalDate}</strong> a las{" "}
                    <strong>{appointmentDetails.originalTime}</strong>.
                </span>
            ) : (
                <span>Cargando detalles de la cita...</span>
            )}
          </AlertDescription>
        </Alert>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Detalles de la Reprogramación</CardTitle>
              <CardDescription>Selecciona una nueva fecha y hora para tu cita</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="required">
                  Nueva fecha
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formattedDate || <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date() || date < new Date(new Date().setDate(new Date().getDate() + 1))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Solo puedes reprogramar citas con al menos 24 horas de anticipación.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="required">
                  Nueva hora
                </Label>
                <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Seleccionar horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la reprogramación</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Indica el motivo por el que necesitas reprogramar esta cita..."
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notifyClinic">Notificar a la clínica</Label>
                <Select
                  value={formData.notifyClinic}
                  onValueChange={(value) => handleSelectChange("notifyClinic", value)}
                >
                  <SelectTrigger id="notifyClinic">
                    <SelectValue placeholder="Seleccionar opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sí, notificar a la clínica</SelectItem>
                    <SelectItem value="no">No notificar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recomendamos notificar a la clínica para confirmar la disponibilidad.
                </p>
              </div>

              <Alert variant="warning" className="bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Política de reprogramación</AlertTitle>
                <AlertDescription>
                  Las reprogramaciones con menos de 48 horas de anticipación pueden estar sujetas a cargos según la
                  política de la clínica. Tu reprogramación está sujeta a disponibilidad.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Reprogramando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprogramar Cita
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

