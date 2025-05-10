import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Calendar,
  Clock,
  CheckCircle,
  PawPrint,
  Heart,
  MessageSquare,
  Search,
  Plus,
  ArrowRight,
  BookOpen,
  MapPin,
} from "lucide-react"
//import { useAuth } from "@/context/auth-context"
import {Link} from "react-router"
//import Image from "next/image"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import ProtectedRoutes  from "../../utils/ProtectedRoutes";

export default function PetDashboardPage() {
  const [isNewLogin, setIsNewLogin] = useState(false);
  
  return (
    <ProtectedRoutes allowedUserTypes={["owner"]}>
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        {isNewLogin && (
          <div className="mb-4 rounded-lg bg-primary/10 p-4 text-primary animate-in fade-in duration-500">
            {/*<h2 className="mb-2 text-xl font-semibold">¡Bienvenido a PetVet Marketplace, {user?.name}!</h2>*/}
            <h2 className="mb-2 text-xl font-semibold">¡Bienvenido a PetVet Marketplace!</h2>
            <p>
              Has iniciado sesión correctamente. Desde aquí podrás gestionar la información de tus mascotas, agendar citas
              y más.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Mi Panel</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/pet-dashboard/pets/add">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Mascota
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Mascotas</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Max, Luna y Rocky</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">En los próximos 7 días</p>
            </CardContent>
          </Card>

        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Encuentra Veterinarias Cercanas</CardTitle>
            <CardDescription>Busca clínicas veterinarias por ubicación, especialidad o servicios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar veterinarias por nombre, especialidad o ubicación..."
                  className="pl-8"
                />
              </div>
              <Button asChild>
                <Link to="/pet-dashboard/clinics">Buscar</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer">
                Emergencias
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Vacunación
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Dental
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Cirugía
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Exóticos
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link to="/pet-dashboard/clinics?view=map">
                <MapPin className="mr-2 h-4 w-4" />
                Ver en mapa
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pet-dashboard/clinics?filter=favorites">
                <Heart className="mr-2 h-4 w-4" />
                Mis favoritas
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Mis Mascotas</CardTitle>
              <CardDescription>Información rápida sobre tus mascotas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    name: "Max",
                    type: "Perro",
                    breed: "Labrador Retriever",
                    age: 3,
                    image: "/placeholder.svg?height=100&width=100&text=Max",
                  },
                  {
                    id: 2,
                    name: "Luna",
                    type: "Gato",
                    breed: "Siamés",
                    age: 2,
                    image: "/placeholder.svg?height=100&width=100&text=Luna",
                  },
                  {
                    id: 3,
                    name: "Rocky",
                    type: "Perro",
                    breed: "Bulldog",
                    age: 4,
                    image: "/placeholder.svg?height=100&width=100&text=Rocky",
                  },
                ].map((pet) => (
                  <div key={pet.id} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.type} • {pet.breed} • {pet.age} años
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/pet-dashboard/pets/${pet.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard-client/pets">Ver todas mis mascotas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Citas programadas para tus mascotas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    petName: "Max",
                    clinicName: "Centro Veterinario Salud Animal",
                    date: "15 de Marzo, 2023",
                    time: "10:00 AM",
                    status: "confirmed",
                  },
                  {
                    id: 2,
                    petName: "Luna",
                    clinicName: "Clínica Veterinaria PetCare",
                    date: "18 de Marzo, 2023",
                    time: "3:30 PM",
                    status: "pending",
                  },
                ].map((appointment) => (
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
                        {appointment.petName} - {appointment.clinicName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.date} • {appointment.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Detalles
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/pet-dashboard/appointments">Ver todas las citas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">

          <Card>
            <CardHeader>
              <CardTitle>Clínicas Recomendadas</CardTitle>
              <CardDescription>Basado en tu ubicación y necesidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    name: "Centro Veterinario Salud Animal",
                    distance: "1.2 km",
                    rating: 4.8,
                    specialty: "Medicina General, Cirugía",
                  },
                  {
                    id: 2,
                    name: "Clínica Veterinaria PetCare",
                    distance: "2.5 km",
                    rating: 4.6,
                    specialty: "Dermatología, Odontología",
                  },
                  {
                    id: 3,
                    name: "Hospital Veterinario Central",
                    distance: "3.8 km",
                    rating: 4.9,
                    specialty: "Emergencias 24/7, Especialidades",
                  },
                ].map((clinic) => (
                  <div key={clinic.id} className="flex items-start gap-4">
                    <div className="mt-1 rounded-full p-1 bg-muted text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{clinic.name}</p>
                        <p className="text-xs font-medium">★ {clinic.rating}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {clinic.distance} • {clinic.specialty}
                      </p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/pet-dashboard/clinics">Buscar clínicas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </ProtectedRoutes>
  )
}
