import { useState } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Search, Clock, CheckCircle, XCircle, Plus, Calendar } from "lucide-react"
import { Link} from "react-router";
import { Badge } from "~/components/ui/badge"

interface Appointment {
  id: number
  petName: string
  petImage: string
  clinicName: string
  clinicAddress: string
  date: string
  time: string
  reason: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  notes?: string
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const appointments: Appointment[] = [
    {
      id: 1,
      petName: "Max",
      petImage: "/placeholder.svg?height=100&width=100&text=Max",
      clinicName: "Centro Veterinario Salud Animal",
      clinicAddress: "Av. Principal 123, Colonia Centro",
      date: "15 de Marzo, 2023",
      time: "10:00 AM",
      reason: "Chequeo general y vacunación",
      status: "confirmed",
    },
    {
      id: 2,
      petName: "Luna",
      petImage: "/placeholder.svg?height=100&width=100&text=Luna",
      clinicName: "Clínica Veterinaria PetCare",
      clinicAddress: "Calle Secundaria 456, Colonia Norte",
      date: "18 de Marzo, 2023",
      time: "3:30 PM",
      reason: "Revisión de alergia alimentaria",
      status: "pending",
    },
    {
      id: 3,
      petName: "Rocky",
      petImage: "/placeholder.svg?height=100&width=100&text=Rocky",
      clinicName: "Hospital Veterinario Central",
      clinicAddress: "Blvd. Principal 789, Colonia Sur",
      date: "5 de Marzo, 2023",
      time: "2:00 PM",
      reason: "Tratamiento de artritis",
      status: "completed",
      notes: "Se recomienda continuar con medicación y ejercicio moderado.",
    },
    {
      id: 4,
      petName: "Max",
      petImage: "/placeholder.svg?height=100&width=100&text=Max",
      clinicName: "Centro Veterinario Salud Animal",
      clinicAddress: "Av. Principal 123, Colonia Centro",
      date: "10 de Febrero, 2023",
      time: "11:30 AM",
      reason: "Vacunación anual",
      status: "cancelled",
      notes: "Cancelado por enfermedad del veterinario. Reprogramar.",
    },
  ]

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmada</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completada</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelada</Badge>
    }
  }

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mis Citas</h1>
        <Button asChild>
          <Link to="/dashboard-client/appointments/schedule">
            <Plus className="mr-2 h-4 w-4" />
            Agendar Cita
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cita por mascota, clínica o motivo..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <span>Próximas</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <span>Completadas</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <span>Canceladas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No se encontraron citas</h3>
              <p className="mt-2 text-sm text-muted-foreground">No hay citas que coincidan con tu búsqueda</p>
              <Button className="mt-4" asChild>
                <Link to="/pet-dashboard/appointments/schedule">Agendar Cita</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center gap-4 border-b p-4 md:w-1/3 md:border-b-0 md:border-r">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                          <img
                            src={appointment.petImage || "/placeholder.svg"}
                            alt={appointment.petName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.petName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{appointment.clinicName}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.clinicAddress}</p>
                          <div className="mt-2 flex items-start gap-2">
                            <div className="mt-0.5">{getStatusIcon(appointment.status)}</div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Motivo:</span> {appointment.reason}
                              </p>
                              {appointment.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          {(appointment.status === "confirmed" || appointment.status === "pending") && (
                            <Button variant="outline" size="sm">
                              Reprogramar
                            </Button>
                          )}
                          {(appointment.status === "confirmed" || appointment.status === "pending") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              Cancelar
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <Link to={`/dashboard-client/appointments/${appointment.id}`}>Ver Detalles</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="space-y-4">
            {filteredAppointments
              .filter((appointment) => appointment.status === "confirmed" || appointment.status === "pending")
              .map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center gap-4 border-b p-4 md:w-1/3 md:border-b-0 md:border-r">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                          <img
                            src={appointment.petImage || "/placeholder.svg"}
                            alt={appointment.petName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.petName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{appointment.clinicName}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.clinicAddress}</p>
                          <div className="mt-2 flex items-start gap-2">
                            <div className="mt-0.5">{getStatusIcon(appointment.status)}</div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Motivo:</span> {appointment.reason}
                              </p>
                              {appointment.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Reprogramar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Cancelar
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/pet-dashboard/appointments/${appointment.id}`}>Ver Detalles</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {filteredAppointments
              .filter((appointment) => appointment.status === "completed")
              .map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center gap-4 border-b p-4 md:w-1/3 md:border-b-0 md:border-r">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                          <img
                            src={appointment.petImage || "/placeholder.svg"}
                            alt={appointment.petName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.petName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{appointment.clinicName}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.clinicAddress}</p>
                          <div className="mt-2 flex items-start gap-2">
                            <div className="mt-0.5">{getStatusIcon(appointment.status)}</div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Motivo:</span> {appointment.reason}
                              </p>
                              {appointment.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button size="sm" asChild>
                            <Link to={`/pet-dashboard/appointments/${appointment.id}`}>Ver Detalles</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <div className="space-y-4">
            {filteredAppointments
              .filter((appointment) => appointment.status === "cancelled")
              .map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center gap-4 border-b p-4 md:w-1/3 md:border-b-0 md:border-r">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                          <img
                            src={appointment.petImage || "/placeholder.svg"}
                            alt={appointment.petName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.petName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{appointment.clinicName}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.clinicAddress}</p>
                          <div className="mt-2 flex items-start gap-2">
                            <div className="mt-0.5">{getStatusIcon(appointment.status)}</div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Motivo:</span> {appointment.reason}
                              </p>
                              {appointment.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button size="sm" asChild>
                            <Link to="/pet-dashboard/appointments/schedule">Reagendar</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

