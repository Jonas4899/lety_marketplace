import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { CheckCircle, XCircle, CalendarClock, RefreshCw } from "lucide-react";
import { useAuthStore } from "~/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Appointment {
  id: number;
  petName: string;
  petImage: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  notes: string;
}

type StatusAction = "confirmada" | "rechazada" | "reprogramacion_sugerida";

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAppointment, setUpdatingAppointment] =
    useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const token = useAuthStore((state) => state.token);

  // Cargar citas
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("No autenticado");

        const res = await fetch(`${API_URL}/appointments/clinic`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Error al obtener citas");

        const data = await res.json();
        setAppointments(data.citas || []);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  // Función para actualizar estado de cita
  const updateAppointmentStatus = async (
    appointmentId: number,
    status: StatusAction,
    message?: string
  ) => {
    if (!token) return;

    setUpdatingAppointment(true);
    try {
      const res = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar cita");
      }

      // Actualizar la lista de citas para reflejar el cambio
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status } : app))
      );

      const successMessage =
        status === "confirmada"
          ? "Cita confirmada exitosamente"
          : status === "rechazada"
          ? "Cita rechazada"
          : "Se ha sugerido reprogramación";

      toast.success(successMessage);
    } catch (err: any) {
      console.error("Error al actualizar cita:", err);
      let errorMessage = "Error al actualizar el estado de la cita";

      try {
        // Para errores de fetch, intentamos extraer los datos del error
        if (err.message && err.message.includes("Error al actualizar cita")) {
          errorMessage = err.message;
        } else {
          // Ver si podemos mostrar detalles adicionales del error que viene del backend
          const errorJson = err.error || err.details;
          if (errorJson) {
            errorMessage = `${errorMessage}: ${
              typeof errorJson === "string"
                ? errorJson
                : JSON.stringify(errorJson)
            }`;
          }
        }
      } catch (parseError) {
        console.error("Error parseando detalles del error:", parseError);
      }

      toast.error(errorMessage);
    } finally {
      setUpdatingAppointment(false);
      setDialogOpen(false);
      setMessage("");
      setSelectedAppointment(null);
      setStatusAction(null);
    }
  };

  // Manejador para iniciar acción (abre diálogo según la acción)
  const handleActionStart = (
    appointment: Appointment,
    action: StatusAction
  ) => {
    setSelectedAppointment(appointment);
    setStatusAction(action);

    // Confirmar directamente sin diálogo
    if (action === "confirmada") {
      updateAppointmentStatus(appointment.id, action);
      return;
    }

    // Para rechazar o reprogramar, abrir diálogo para agregar mensaje
    setDialogOpen(true);
  };

  // Manejador para confirmar acción en el diálogo
  const handleActionConfirm = () => {
    if (!selectedAppointment || !statusAction) return;
    updateAppointmentStatus(selectedAppointment.id, statusAction, message);
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Citas reservadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Cargando citas...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && appointments.length === 0 && (
            <div>No hay citas reservadas.</div>
          )}
          {!loading && !error && appointments.length > 0 && (
            <div className="flex flex-col gap-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 border"
                >
                  {/* Izquierda: Avatar + info del dueño */}
                  <div className="flex items-start gap-4 w-full md:w-[250px]">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={a.petImage} alt={a.petName} />
                      <AvatarFallback>{a.petName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">
                        {a.petName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {a.ownerName}
                      </span>
                      <div className="mt-1 flex gap-1 flex-wrap text-xs text-muted-foreground">
                        <span>{a.ownerEmail}</span>
                        <span>•</span>
                        <span>{a.ownerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Centro: Detalles de la cita */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm flex-1">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Fecha:
                      </span>
                      <br />
                      {a.date}
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Hora:
                      </span>
                      <br />
                      {a.time}
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Motivo:
                      </span>
                      <br />
                      {a.reason}
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Notas:
                      </span>
                      <br />
                      {a.notes || "-"}
                    </div>
                  </div>

                  {/* Derecha: Estado + acciones */}
                  <div className="flex flex-col items-end gap-2 w-full md:w-[200px]">
                    <Badge
                      variant={
                        a.status === "pendiente"
                          ? "secondary"
                          : a.status === "confirmada"
                          ? "default"
                          : a.status === "rechazada"
                          ? "destructive"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {a.status === "reprogramacion_sugerida"
                        ? "Reprogramación"
                        : a.status}
                    </Badge>

                    <div className="flex flex-wrap gap-2 mt-2 justify-end">
                      <Button
                        size="sm"
                        variant={
                          a.status === "confirmada" ? "outline" : "default"
                        }
                        disabled={
                          updatingAppointment || a.status === "confirmada"
                        }
                        onClick={() => handleActionStart(a, "confirmada")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {a.status === "confirmada" ? "Confirmada" : "Confirmar"}
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          a.status === "rechazada" ? "outline" : "destructive"
                        }
                        disabled={
                          updatingAppointment || a.status === "rechazada"
                        }
                        onClick={() => handleActionStart(a, "rechazada")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {a.status === "rechazada" ? "Rechazada" : "Rechazar"}
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          a.status === "reprogramacion_sugerida"
                            ? "outline"
                            : "secondary"
                        }
                        disabled={
                          updatingAppointment ||
                          a.status === "reprogramacion_sugerida"
                        }
                        onClick={() =>
                          handleActionStart(a, "reprogramacion_sugerida")
                        }
                      >
                        <CalendarClock className="h-4 w-4 mr-1" />
                        {a.status === "reprogramacion_sugerida"
                          ? "Reprogramada"
                          : "Reprogramar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para agregar mensaje */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusAction === "rechazada"
                ? "Rechazar cita"
                : "Sugerir reprogramación"}
            </DialogTitle>
            <DialogDescription>
              {statusAction === "rechazada"
                ? "Por favor, indique el motivo del rechazo."
                : "Sugiera una nueva fecha/hora o indique instrucciones para reprogramar."}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Escriba un mensaje para el cliente..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />

          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={updatingAppointment}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActionConfirm}
              disabled={updatingAppointment || !message.trim()}
              variant={statusAction === "rechazada" ? "destructive" : "default"}
            >
              {updatingAppointment && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              {statusAction === "rechazada" ? "Rechazar" : "Enviar sugerencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
