import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { Link, useNavigate, useParams } from "react-router";
import { MapPin, Phone, Clock, Star, MessageSquare, Heart, Share2, ChevronLeft, Check, ArrowLeft, ArrowRight, X } from "lucide-react" // Added ArrowLeft, ArrowRight, X
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog" // Added Dialog components



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

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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


  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const photos = clinicProfile?.photos || [];
  const photosToDisplay = photos.slice(0, 3);
  const remainingPhotosCount = photos.length - photosToDisplay.length;


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

          {/* Render Clinic Photos - Max 3 initially */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {photos.length > 0 ? (
              photosToDisplay.map((photo, index) => (
                <div
                  key={photo.id_foto}
                  className={`relative cursor-pointer ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`} // Adjust grid span for first image
                  onClick={() => openImageModal(index)} // Open modal showing this image
                >
                  <img
                    src={photo.url}
                    alt={photo.titulo || `${clinicProfile?.nombre} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg aspect-square sm:aspect-auto" // Ensure consistent aspect ratio
                  />
                  {/* Overlay button on the last visible image if there are more */}
                  {index === photosToDisplay.length - 1 && remainingPhotosCount > 0 && (
                    <div
                      className="absolute inset-0 bg-gray-700/50 flex items-center justify-center rounded-lg"
                      onClick={(e) => { e.stopPropagation(); openImageModal(index); }} // Prevent nested click, open modal
                    >
                      <span className="text-white text-lg font-semibold">+{remainingPhotosCount} más</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-3 text-center text-gray-500 py-10 border rounded-lg">
                No hay fotos disponibles para esta clínica :(
              </div>
            )}
          </div>

          {/* Image Modal Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-5xl p-0">
              {photos.length > 0 && (
                <div className="relative">
                  {/* Close Button */}
                   <DialogClose asChild>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-75 hover:text-white"
                       aria-label="Cerrar"
                     >
                       <X size={20} />
                     </Button>
                   </DialogClose>

                  {/* Image Display */}
                  <img
                    src={photos[currentImageIndex].url}
                    alt={photos[currentImageIndex].titulo || `${clinicProfile?.nombre} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-auto max-h-[80vh] object-contain p-1" // Adjust styling as needed
                  />

                  {/* Navigation Buttons */}
                  {photos.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75 hover:text-white disabled:opacity-30"
                        onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentImageIndex === 0}
                        aria-label="Anterior"
                      >
                        <ArrowLeft size={32} />
                      </Button>

                      {/* Next Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75 hover:text-white disabled:opacity-30"
                        onClick={() => setCurrentImageIndex((prev) => Math.min(photos.length - 1, prev + 1))}
                        disabled={currentImageIndex === photos.length - 1}
                        aria-label="Siguiente"
                      >
                        <ArrowRight size={32} />
                      </Button>
                    </>
                  )}

                   {/* Image Counter */}
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                     {currentImageIndex + 1} / {photos.length}
                   </div>
                </div>
              )}
            </DialogContent>
          </Dialog>


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
                {
                /*
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <MessageSquare size={16} />
                  <span>Enviar mensaje</span>
                </Button>*/
                }
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
