import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Pencil,
  Trash2,
  PawPrint,
  CreditCard,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useAuthStore } from "~/stores/useAuthStore";
import { toast} from "sonner"


// Tipos de datos
interface Appointment {
  id: string;
  petName: string;
  petType: string;
  petBreed: string;
  petAge: number;
  petWeight: string;
  petImage: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicImage: string;
  vetName: string;
  vetSpecialty: string;
  vetImage: string;
  date: Date;
  time: string;
  duration: number;
  service: string;
  price: number;
  status: "confirmada" | "pending" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  createdAt: Date;
  paymentStatus: "pending" | "paid" | "partial";
  paymentMethod?: string;
  paymentType?: "full" | "deposit" | "none";
  depositAmount?: number;
  remainingAmount?: number;
  paymentDate?: Date;
  paymentId?: string;
}

interface AppointmentLog {
  id: number;
  timestamp: Date;
  action: string;
  user: string;
  details?: string;
}

export default function AppointmentDetailPage() {
  const router = useNavigate();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = useAuthStore((state) => state.token);
  const location = useLocation()

  useEffect(() => {
    if (location.state?.toast === "success") {
    toast.success("Tu cita ha sido reprogramada con éxito")
  }
}, [])
  

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        if (!id) return;

        if (!token) {
          console.error("Token no encontrado");
          return;
        }

        const response = await fetch(`${API_URL}/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener detalles de la cita");
        }

        const data = await response.json();
        setAppointment(data.appointment);
      } catch (error) {
        console.error("Error trayendo detalles de la cita:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Cargando detalles de la cita...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">No se encontró la cita.</p>
      </div>
    );
  }

  // Historial de la cita
  const appointmentLogs: AppointmentLog[] = [
    {
      id: 1,
      timestamp: new Date(2023, 5, 10, 14, 30),
      action: "Cita creada",
      user: "Tú",
      details: "Cita agendada a través de la aplicación móvil",
    },
    {
      id: 2,
      timestamp: new Date(2023, 5, 10, 15, 30),
      action: "Pago de depósito",
      user: "Tú",
      details: `Depósito de $${appointment.depositAmount} pagado con tarjeta de crédito`,
    },
    {
      id: 3,
      timestamp: new Date(2023, 5, 11, 9, 15),
      action: "Cita confirmada",
      user: "Clínica Veterinaria PetCare",
      details: "Confirmación enviada por email y SMS",
    },
  ];

  // Función para formatear fechas
  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  // Función para formatear fechas con hora
  const formatDateTime = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmada":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Confirmada
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Pendiente
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Completada
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelada
          </Badge>
        );
      case "rescheduled":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Reprogramada
          </Badge>
        );
    }
  };

  // Función para obtener el icono de estado
  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "rescheduled":
        return <RefreshCw className="h-5 w-5 text-purple-600" />;
    }
  };

  // Función para obtener el badge de pago
  const getPaymentBadge = (status: "pending" | "paid" | "partial") => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Pagado
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Pago parcial
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pendiente de pago
          </Badge>
        );
    }
  };

  // Función para manejar la cancelación de cita
  const handleCancelAppointment = () => {
    if (!cancelReason.trim()) {
      toast.error("Por favor, proporciona un motivo para la cancelación.");
      return;
    }

    // En una aplicación real, esto enviaría una solicitud al servidor
    console.log(`Cancelando cita ${appointment.id}. Motivo: ${cancelReason}`);

    // Mostrar notificación de éxito
    toast.success("Cita cancelada");

    setIsCancelDialogOpen(false);
    setCancelReason("");

    // Redirigir a la lista de citas
    setTimeout(() => {
      router("/dashboard-client/appointments");
    }, 1500);
  };

  // Función para agregar una nota
  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Por favor, escribe una nota para agregar.");
      return;
    }

    // En una aplicación real, esto enviaría una solicitud al servidor
    console.log(`Agregando nota a la cita ${appointment.id}: ${noteText}`);

    // Mostrar notificación de éxito
    toast.success("Nota agregada");

    setIsAddNoteDialogOpen(false);
    setNoteText("");
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router(`/dashboard-client/appointments`)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Detalles de la Cita
            </h1>
            {getStatusBadge(appointment.status)}
          </div>
          <div className="flex flex-wrap gap-2">
          {["confirmada", "cancelada"].includes(appointment.status) && (
              <>
                <Button variant="outline"  className="justify-start" asChild>
                  <Link to={`/dashboard-client/appointment/${appointment.id}/reschedule`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprogramar
                  </Link>
                </Button>

                {appointment.status === "confirmada" && (
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setIsAddNoteDialogOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Agregar Nota
            </Button>
          </div>
        </div>

        {/* Alerta para citas próximas */}
        {appointment.status === "confirmada" &&
          new Date(appointment.date).getTime() - new Date().getTime() <
            86400000 * 2 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cita próxima</AlertTitle>
              <AlertDescription>
                Tu cita está programada para dentro de menos de 48 horas. Si
                necesitas cancelar o reprogramar, hazlo lo antes posible para
                evitar cargos.
              </AlertDescription>
            </Alert>
          )}

        <div className="grid gap-6 md:grid-cols-7">
          {/* Información principal */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Información de la Cita</CardTitle>
              <CardDescription>Detalles completos de tu cita</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen de la cita */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  {getStatusIcon(appointment.status)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {appointment.service}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(appointment.date)} • {appointment.time} (
                    {appointment.duration} min)
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    {getPaymentBadge(appointment.paymentStatus)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detalles de la mascota */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Mascota</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={appointment.petImage}
                      alt={appointment.petName}
                    />
                    <AvatarFallback>
                      <PawPrint className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-medium">
                      {appointment.petName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.petType} • {appointment.petBreed}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.petAge} años • {appointment.petWeight}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detalles de la clínica y veterinario */}
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  Clínica y Veterinario
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={appointment.clinicImage}
                      alt={appointment.clinicName}
                    />
                    <AvatarFallback>
                      {appointment?.clinicName?.substring(0, 2) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-medium">
                      {appointment.clinicName}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{appointment.clinicAddress}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{appointment.clinicPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={appointment.vetImage}
                      alt={appointment.vetName}
                    />
                    <AvatarFallback>
                      {appointment?.vetName?.substring(0, 2) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{appointment.vetName}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.vetSpecialty}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detalles del servicio y pago */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Servicio y Pago</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Servicio:</dt>
                    <dd className="font-medium">{appointment.service}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Duración:</dt>
                    <dd className="font-medium">
                      {appointment.duration} minutos
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Precio total:</dt>
                    <dd className="font-medium">${appointment.price}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Estado de pago:</dt>
                    <dd className="font-medium">
                      {getPaymentBadge(appointment.paymentStatus)}
                    </dd>
                  </div>
                </dl>

                {/* Información detallada de pago */}
                {appointment.paymentType && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">
                        Información de pago
                      </h4>
                    </div>
                    <dl className="grid gap-2 text-sm">
                      {appointment.paymentType === "full" ? (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            Pago completo:
                          </dt>
                          <dd className="font-medium text-green-600">
                            ${appointment.price}
                          </dd>
                        </div>
                      ) : appointment.paymentType === "deposit" ? (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                              Depósito pagado:
                            </dt>
                            <dd className="font-medium text-green-600">
                              ${appointment.depositAmount}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                              Pendiente en clínica:
                            </dt>
                            <dd className="font-medium">
                              ${appointment.remainingAmount}
                            </dd>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            Pago en clínica:
                          </dt>
                          <dd className="font-medium">${appointment.price}</dd>
                        </div>
                      )}

                      {appointment.paymentMethod && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            Método de pago:
                          </dt>
                          <dd className="font-medium">
                            {appointment.paymentMethod}
                          </dd>
                        </div>
                      )}

                      {appointment.paymentDate && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            Fecha de pago:
                          </dt>
                          <dd className="font-medium">
                            {formatDateTime(appointment.paymentDate)}
                          </dd>
                        </div>
                      )}

                      {appointment.paymentId && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            ID de transacción:
                          </dt>
                          <dd className="font-medium">
                            {appointment.paymentId}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>

              <Separator />

              {/* Notas */}
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  Notas e Instrucciones
                </h3>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {appointment.notes ||
                    "No hay notas disponibles para esta cita."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="md:col-span-3">
            <Tabs defaultValue="timeline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Información Adicional</CardTitle>
                  <TabsList>
                    <TabsTrigger value="timeline">Historial</TabsTrigger>
                    <TabsTrigger value="actions">Acciones</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  Historial y acciones disponibles para tu cita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="timeline" className="mt-0">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {appointmentLogs.map((log) => (
                        <div key={log.id} className="flex gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {log.action.includes("creada") ? (
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            ) : log.action.includes("confirmada") ? (
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            ) : log.action.includes("cancelada") ? (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            ) : log.action.includes("pago") ? (
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {log.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(log.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Por: {log.user}
                            </p>
                            {log.details && (
                              <p className="text-sm">{log.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="actions" className="mt-0">
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">Gestionar Cita</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Opciones disponibles para gestionar tu cita actual
                      </p>
                      <div className="mt-4 flex flex-col gap-2">
                        {appointment.status === "confirmada" && (
                          <>
                            <Button
                              variant="outline"
                              className="justify-start"
                              asChild
                            >
                              <Link
                                to={`/pet-dashboard/appointments/schedule?reschedule=true&appointment=${appointment.id}`}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reprogramar Cita
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start text-destructive"
                              onClick={() => setIsCancelDialogOpen(true)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar Cita
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() => setIsAddNoteDialogOpen(true)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Agregar Nota
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start"
                          asChild
                        >
                          <Link
                            to={`/pet-dashboard/messages?clinic=${encodeURIComponent(
                              appointment.clinicName
                            )}`}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contactar a la Clínica
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">
                        Preparación para la Cita
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Recomendaciones para antes de tu visita
                      </p>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            Lleva la cartilla de vacunación de{" "}
                            {appointment.petName}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                          <span>Llega 10 minutos antes para el registro</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            Trae a tu mascota con correa o transportadora
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            Anota cualquier síntoma o cambio reciente en tu
                            mascota
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">Ubicación</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.clinicAddress}
                      </p>
                      <div className="mt-2 aspect-video w-full rounded-md bg-muted flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Mapa no disponible
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-2 w-full justify-center"
                        asChild
                      >
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            appointment.clinicAddress
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Ver en Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Diálogo de cancelación */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="required">
                Motivo de cancelación
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Indica el motivo de la cancelación..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Las cancelaciones con menos de 24 horas de anticipación pueden
                estar sujetas a cargos según la política de la clínica.
                {appointment.paymentType !== "none" &&
                  " Los depósitos realizados podrían no ser reembolsables."}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancelar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para agregar nota */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nota</DialogTitle>
            <DialogDescription>
              Agrega una nota o instrucción especial para esta cita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-text" className="required">
                Nota
              </Label>
              <Textarea
                id="note-text"
                placeholder="Escribe tu nota aquí..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddNoteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddNote}>Guardar Nota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
}
