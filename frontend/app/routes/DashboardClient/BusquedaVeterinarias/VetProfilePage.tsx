import { useState, useEffect } from "react"
import { MapPin, Phone, Clock, Star, MessageSquare, Heart, Share2, ChevronLeft, Check } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { Link, useNavigate, useParams } from "react-router";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ClinicPhoto {
  id_foto: number;
  titulo: string;
  url: string;
  tipo: string;
}

interface ClinicService {
  id_servicio: number;
  nombre: string;
  descripcion: string;
  precio: number | null;
  disponible: boolean;
}

interface ClinicProfileData {
  id_clinica: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  descripcion: string | null;
  sitio_web: string | null;
  latitud: number | null;
  longitud: number | null;
  photos: ClinicPhoto[];
  services: ClinicService[];
  openingHours: { [key: string]: { is24Hours?: boolean; closed?: boolean; open?: string; close?: string } }; // Define a proper type
  reviews: any[];
}


export default function VetProdilePage() {
  const params = useParams();
  const clinicId = params.id;
  const [clinicProfile, setClinicProfile] = useState<ClinicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicProfile = async () => {
      if (!clinicId) {
        setError("No clinic ID provided in the URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/veterinary/profile/${clinicId}`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log("Fetched Clinic Profile Data:", data);

        setClinicProfile(data);
        setError(null);

      } catch (err: any) {
        console.error("Error fetching clinic profile:", err);
        setError(err.message || "An unexpected error occurred while fetching data.");
        setClinicProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinicProfile();

  }, [clinicId]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-30 text-center text-lg">Cargando veterinaria...</div>;
  }

    if (!clinicProfile) {
    return <div className="container mx-auto px-4 py-30 text-center text-lg text-red-600">Lo lamentamos la clinica que estas buscando no ha sido encontrada :( </div>;
  }

  if (error && !clinicProfile) {
    return <div className="container mx-auto px-4 py-30 text-center text-red-600">Error cargando el pergil de la clinica {error}</div>;
  }



    // Get today's day name in lowercase English (e.g., 'monday')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  // Find today's schedule in the openingHours object
  const todaysSchedule = clinicProfile.openingHours[today] || null;

  // Format today's schedule for display
  let todayDisplayHours = 'Cerrado'; // Default to 'Cerrado'
  if (todaysSchedule) {
    if (todaysSchedule.is24Hours) {
      todayDisplayHours = 'Abierto 24 Horas';
    } else if (!todaysSchedule.closed && todaysSchedule.open && todaysSchedule.close) {
      todayDisplayHours = `${todaysSchedule.open} - ${todaysSchedule.close}`;
    }
  }

  console.log(clinicProfile.reviews);

  const reviewsCount = Object.keys(clinicProfile.reviews).length;
  const totalRating = clinicProfile.reviews.reduce((sum, review) => sum + review.calificacion, 0);
  const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 'No hay reseñas ';


  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">{clinicProfile?.nombre}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={isFavorite ? "text-red-500" : ""}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 size={20} />
                </Button>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <Star className="text-yellow-400 mr-1" size={16} />
              <span className="font-medium mr-1">{averageRating}</span>
              <span className="text-gray-500">({reviewsCount} reseñas)</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={16} className="mr-2" />
              <span>{clinicProfile?.direccion}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <Phone size={16} className="mr-2" />
              <span>{clinicProfile?.telefono}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-2" />
              <span>{todayDisplayHours} (Hoy)</span>
            </div>
          </div>

          {/* Render Clinic Photos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {clinicProfile?.photos && clinicProfile.photos.length > 0 ? (
              clinicProfile.photos.map((photo, index) => (
                <div key={photo.id_foto} className={index === 0 ? "col-span-2" : ""}>
                  <img
                    src={photo.url}
                    alt={photo.titulo || `${clinicProfile?.nombre} - Imagen ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ))
            ) : (
              // Optional: Show a placeholder if no photos are available
              <div className="col-span-2 text-center text-gray-500 my-40">
                No hay fotos disponibles para esta clínica :(
              </div>
            )}
          </div>

          <Tabs defaultValue="about" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">Acerca de</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Acerca de {clinicProfile?.nombre}</h3>
              <p className="text-gray-700 mb-4">{clinicProfile?.descripcion || "No hay descripción disponible."}</p>

              <h4 className="font-semibold mb-2">Horario de atención</h4>
              <div className="space-y-2 mb-4">
                {/* Map over the openingHours object from clinicProfile */}
                {Object.entries(clinicProfile.openingHours).map(([day, schedule]) => {
                  // Helper function to capitalize day names (e.g., 'monday' -> 'Lunes')
                  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                  // Map English day names to Spanish
                  const dayTranslations: { [key: string]: string } = {
                    monday: 'Lunes',
                    tuesday: 'Martes',
                    wednesday: 'Miércoles',
                    thursday: 'Jueves',
                    friday: 'Viernes',
                    saturday: 'Sábado',
                    sunday: 'Domingo',
                  };

                  let displayHours = 'Cerrado'; // Default to 'Cerrado'
                  if (schedule.is24Hours) {
                    displayHours = 'Abierto 24 Horas';
                  } else if (!schedule.closed && schedule.open && schedule.close) {
                    displayHours = `${schedule.open} - ${schedule.close}`;
                  }

                  return (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600">{dayTranslations[day] || capitalize(day)}</span>
                      <span>{displayHours}</span>
                    </div>
                  );
                })}
              </div>

              <h4 className="font-semibold mb-2">Información de contacto</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono</span>
                  <span>{clinicProfile?.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sitio web</span>
                  <a
                    href={clinicProfile?.sitio_web ? `https://${clinicProfile.sitio_web}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-600 ${!clinicProfile?.sitio_web ? 'pointer-events-none text-gray-400' : ''}`}
                  >
                    {clinicProfile?.sitio_web || 'No disponible'}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <a href={`mailto:${clinicProfile?.correo}`} className="text-blue-600">
                    {clinicProfile?.correo}
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Servicios ofrecidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clinicProfile?.services && clinicProfile.services.length > 0 ? (
                  clinicProfile.services.map((service) => (
                    <div key={service.id_servicio} className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      <span>{service.nombre} ({service.precio ? `$${service.precio}` : 'Precio no disponible'})</span>
                    </div>
                  ))
                ) : (
                  <p>No hay servicios registrados para esta clínica.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-lg font-semibold">Reseñas de clientes</h3>
                <Button variant="outline">Escribir reseña</Button>
              </div>

              <div className="space-y-4">
                {
                
                reviewsCount > 0 ? (
              
                clinicProfile.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="py-4 px-6">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold">{review.usuarios.nombre}</h4>
                            <span className="text-sm text-gray-500">{review.fecha.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.calificacion ? "text-yellow-400" : "text-gray-300"}
                                fill={i < review.calificacion ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comentario}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))) :
                
                (
                  <div className="container  text-center">
                    <p>No hay reseñas registradas para esta clinica :(</p>
                  </div>
                )
              
              
              }
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                <Button size="lg" className="w-full" asChild>
                  <Link to={`/pet-dashboard/appointments/schedule?clinic=${clinicId}`}>Agendar cita</Link>
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <MessageSquare size={16} />
                  <span>Enviar mensaje</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Servicios destacados</h3>
              <div className="space-y-3">
                {clinicProfile?.services && clinicProfile.services.length > 0 ? (
                  clinicProfile.services.slice(0, 5).map((service) => (
                    <div key={service.id_servicio} className="flex items-center justify-between">
                      <span>{service.nombre}</span>
                      <Badge variant={service.disponible ? "default" : "destructive"}>
                        {service.disponible ? "Disponible" : "No Disponible"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p>No hay servicios destacados.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
