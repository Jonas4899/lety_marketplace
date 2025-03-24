import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Calendar, DollarSign, Users, Star, TrendingUp, Clock, CheckCircle, AlertCircle, PawPrint } from "lucide-react"
//import { useAuth } from "~/context/auth-context"
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"

export default function DashboardPage() {
  const [isNewRegistration, setIsNewRegistration] = useState(false)
 
  // Datos de ejemplo para el dashboard
  const upcomingAppointments = [
    {
      id: 1,
      petName: "Max",
      petType: "Perro - Labrador",
      ownerName: "Carlos Rodríguez",
      date: "15 de Marzo, 2023",
      time: "10:00 AM",
      reason: "Chequeo general y vacunación",
      status: "confirmed",
    },
    {
      id: 2,
      petName: "Luna",
      petType: "Gato - Siamés",
      ownerName: "María González",
      date: "15 de Marzo, 2023",
      time: "11:30 AM",
      reason: "Revisión de alergia alimentaria",
      status: "pending",
    },
    {
      id: 3,
      petName: "Rocky",
      petType: "Perro - Bulldog",
      ownerName: "Juan Pérez",
      date: "15 de Marzo, 2023",
      time: "2:00 PM",
      reason: "Tratamiento de artritis",
      status: "confirmed",
    },
  ]

  const recentMessages = [
    {
      id: 1,
      sender: "Carlos Rodríguez",
      pet: "Max (Labrador)",
      message: "¿Podría confirmar si necesito llevar el carnet de vacunación para la cita de mañana?",
      time: "Hace 30 minutos",
      unread: true,
    },
    {
      id: 2,
      sender: "María González",
      pet: "Luna (Siamés)",
      message: "Gracias por los resultados de laboratorio. ¿Cuándo debería volver para el seguimiento?",
      time: "Hace 2 horas",
      unread: true,
    },
    {
      id: 3,
      sender: "Juan Pérez",
      pet: "Rocky (Bulldog)",
      message: "¿Tienen disponibilidad para una consulta de emergencia hoy?",
      time: "Hace 3 horas",
      unread: false,
    },
  ]

  const recentClients = [
    {
      id: 1,
      name: "Carlos Rodríguez",
      pets: ["Max (Labrador)"],
      lastVisit: "10 de Marzo, 2023",
      visits: 5,
      image: "/placeholder.svg?height=40&width=40&text=CR",
    },
    {
      id: 2,
      name: "María González",
      pets: ["Luna (Siamés)", "Coco (Poodle)"],
      lastVisit: "8 de Marzo, 2023",
      visits: 8,
      image: "/placeholder.svg?height=40&width=40&text=MG",
    },
    {
      id: 3,
      name: "Juan Pérez",
      pets: ["Rocky (Bulldog)"],
      lastVisit: "5 de Marzo, 2023",
      visits: 3,
      image: "/placeholder.svg?height=40&width=40&text=JP",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      {isNewRegistration && (
        <div className="mb-4 rounded-lg bg-primary/10 p-4 text-primary animate-in fade-in duration-500">
          {/*<h2 className="mb-2 text-xl font-semibold">¡Bienvenido a PetVet Marketplace, {user?.name}!</h2>*/}
          <h2 className="mb-2 text-xl font-semibold">¡Bienvenido a PetVet Marketplace!</h2>
          <p>Tu clínica ha sido registrada exitosamente. Usa este panel para gestionar tu perfil, servicios y citas.</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Descargar reporte
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground">+14% respecto al mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$15,234</div>
                <p className="text-xs text-muted-foreground">+8% respecto al mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+18% respecto al mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calificación</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">+0.2 respecto al mes pasado</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Resumen de Actividad</CardTitle>
                <CardDescription>Citas y servicios en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de actividad</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Citas de Hoy</CardTitle>
                <CardDescription>Tienes {upcomingAppointments.length} citas programadas para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-1 ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {appointment.status === "confirmed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {appointment.petName} - {appointment.petType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.time} • {appointment.ownerName}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/appointments/${appointment.id}`}>Ver</Link>
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/appointments">Ver todas las citas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
                <CardDescription>Mensajes de clientes que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-full p-1 ${
                          message.unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <PawPrint className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">{message.sender}</p>
                          <p className="text-xs text-muted-foreground">{message.time}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{message.pet}</p>
                        <p className="text-xs line-clamp-1">{message.message}</p>
                      </div>
                      {message.unread && <Badge className="ml-auto">Nuevo</Badge>}
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/messages">Ver todos los mensajes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clientes Recientes</CardTitle>
                <CardDescription>Clientes que han visitado tu clínica recientemente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={client.image} alt={client.name} />
                        <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.pets.join(", ")} • {client.visits} visitas
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/clients/${client.id}`}>Ver</Link>
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/clients">Ver todos los clientes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
                <CardDescription>Notificaciones importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { message: "Inventario bajo de vacunas", type: "warning" },
                    { message: "3 reseñas nuevas pendientes de respuesta", type: "info" },
                    { message: "Actualización de precios pendiente", type: "info" },
                    { message: "Mantenimiento programado para mañana", type: "warning" },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-1 ${
                          alert.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {alert.type === "warning" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento</CardTitle>
              <CardDescription>Métricas detalladas de tu clínica veterinaria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráficos de análisis detallados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
              <CardDescription>Genera y descarga reportes personalizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: "Reporte de Ingresos", description: "Ingresos detallados por servicio y período" },
                    { title: "Reporte de Clientes", description: "Análisis de clientes y retención" },
                    { title: "Reporte de Servicios", description: "Servicios más solicitados y rentables" },
                    { title: "Reporte de Citas", description: "Estadísticas de citas y ocupación" },
                    { title: "Reporte de Inventario", description: "Estado actual del inventario y alertas" },
                    { title: "Reporte de Personal", description: "Rendimiento y carga de trabajo del personal" },
                  ].map((report, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription className="text-xs">{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          Generar Reporte
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

