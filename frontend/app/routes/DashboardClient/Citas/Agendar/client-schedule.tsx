import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams} from "react-router";
import { ArrowLeft, Clock, MapPin, Search, Star } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AppointmentScheduler } from "~/components/appoinment-scheduler"

export default function ScheduleAppointmentPage() {
  const router = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();  
  const clinicId = searchParams.get("clinic")

  // Si ya tenemos un ID de clínica, vamos directamente al programador de citas
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(clinicId)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("nearby")

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; // <-- Añade esto arriba si no lo tienes

const [clinics, setClinics] = useState<any[]>([]); // 👈 ahora clinics viene del servidor
const [loadingClinics, setLoadingClinics] = useState(true); // para mostrar loading si quieres

useEffect(() => {
  const fetchClinics = async () => {
    try {
      const response = await fetch(`${API_URL}/clinics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener clínicas');
      }

      const data = await response.json();

      // 🔥 Mapeo para que coincida con el Frontend que espera image, address, etc
      const clinicsFormateadas = data.clinicas.map((clinica: any) => ({
        id: clinica.id_clinica,
        name: clinica.nombre,
        image: clinica.certificado_url || "/placeholder.svg?height=100&width=100&text=Clinic",
        rating: 4.5, // 🔥 Puedes poner un valor fijo temporal mientras no guardas ratings en Supabase
        reviews: Math.floor(Math.random() * 100) + 1, // 🔥 Simulas reviews random de momento
        distance: "1 km", // 🔥 Simulas distancia si aún no manejas ubicación
        address: clinica.direccion,
        availability: "Disponible hoy", // 🔥 Puedes ponerlo fijo
        featured: false, // 🔥 Puedes manejar featured manualmente después
      }));

      setClinics(clinicsFormateadas);
    } catch (error) {
      console.error('Error trayendo clínicas:', error);
    } finally {
      setLoadingClinics(false);
    }
  };

  fetchClinics();
}, []);

  // Filtrar clínicas según la búsqueda
  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Si ya hay una clínica seleccionada, mostrar el programador de citas
  if (selectedClinicId) {
    const selectedClinic = clinics.find((clinic) => clinic.id === selectedClinicId)

    return (
      <div className="container mx-auto p-4 md:p-6">
        <Button variant="ghost" className="mb-4" onClick={() => setSelectedClinicId(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la búsqueda
        </Button>

        {selectedClinic && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                <img
                  src={selectedClinic.image || "/placeholder.svg"}
                  alt={selectedClinic.name}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{selectedClinic.name}</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{selectedClinic.address}</span>
                </div>
              </div>
            </div>
            <Separator className="mb-6" />
          </div>
        )}

        <AppointmentScheduler clinicId={selectedClinicId} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Programar una Cita</h1>
        <p className="text-muted-foreground">
          Busca una clínica veterinaria cercana para programar una cita para tu mascota
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o dirección..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearby">Cercanas a mí</SelectItem>
              <SelectItem value="city">En mi ciudad</SelectItem>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="available-today">Disponibles Hoy</TabsTrigger>
            <TabsTrigger value="favorites">Favoritas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {filteredClinics.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">No se encontraron clínicas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Intenta con otros términos de búsqueda o ajusta los filtros
                    </p>
                    <Button onClick={() => setSearchQuery("")}>Limpiar búsqueda</Button>
                  </div>
                ) : (
                  filteredClinics.map((clinic) => (
                    <Card key={clinic.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-1/4">
                            <div className="aspect-video md:h-full w-full">
                              <img
                                src={clinic.image || "/placeholder.svg"}
                                alt={clinic.name}
                                className="object-cover"
                              />
                            </div>
                            {clinic.featured && <Badge className="absolute left-2 top-2 bg-primary">Destacada</Badge>}
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-semibold">{clinic.name}</h3>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{clinic.rating}</span>
                                <span className="text-xs text-muted-foreground ml-1">({clinic.reviews})</span>
                              </div>
                            </div>

                            <div className="mb-2 flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {clinic.distance} • {clinic.address}
                              </span>
                            </div>

                            <div className="mb-4 flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-green-600" />
                              <span className="text-green-600 font-medium">{clinic.availability}</span>
                            </div>

                            <div className="mt-auto flex justify-between items-center">
                              <Link
                                to={`/pet-dashboard/clinics/${clinic.id}`}
                                className="text-sm font-medium text-primary"
                              >
                                Ver perfil
                              </Link>
                              <Button onClick={() => setSelectedClinicId(clinic.id)}>Programar Cita</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available-today" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {filteredClinics
                  .filter((clinic) => clinic.availability.includes("hoy"))
                  .map((clinic) => (
                    <Card key={clinic.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-1/4">
                            <div className="aspect-video md:h-full w-full">
                              <img
                                src={clinic.image || "/placeholder.svg"}
                                alt={clinic.name}
                                className="object-cover"
                              />
                            </div>
                            {clinic.featured && <Badge className="absolute left-2 top-2 bg-primary">Destacada</Badge>}
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-semibold">{clinic.name}</h3>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{clinic.rating}</span>
                                <span className="text-xs text-muted-foreground ml-1">({clinic.reviews})</span>
                              </div>
                            </div>

                            <div className="mb-2 flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {clinic.distance} • {clinic.address}
                              </span>
                            </div>

                            <div className="mb-4 flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-green-600" />
                              <span className="text-green-600 font-medium">{clinic.availability}</span>
                            </div>

                            <div className="mt-auto flex justify-between items-center">
                              <Link
                                to={`/pet-dashboard/clinics/${clinic.id}`}
                                className="text-sm font-medium text-primary"
                              >
                                Ver perfil
                              </Link>
                              <Button onClick={() => setSelectedClinicId(clinic.id)}>Programar Cita</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <div className="text-center p-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No tienes clínicas favoritas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Guarda tus clínicas favoritas para acceder rápidamente a ellas
              </p>
              <Button variant="outline" asChild>
                <Link to="/pet-dashboard/clinics">Explorar clínicas</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

