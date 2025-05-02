import { useState } from "react"
import { MapPin, Phone, Clock, Star, MessageSquare, Heart, Share2, ChevronLeft, Check } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Link, useNavigate } from "react-router";

// Datos de ejemplo para la clínica
const clinicData = {
  id: 1,
  name: "Centro Veterinario PetCare",
  address: "Av. Principal 123, Ciudad",
  phone: "+1 (555) 123-4567",
  website: "www.petcare.com",
  email: "info@petcare.com",
  hours: [
    { day: "Lunes - Viernes", hours: "8:00 AM - 8:00 PM" },
    { day: "Sábado", hours: "9:00 AM - 6:00 PM" },
    { day: "Domingo", hours: "Cerrado" },
  ],
  rating: 4.8,
  reviewCount: 124,
  description:
    "Centro Veterinario PetCare ofrece servicios médicos de alta calidad para mascotas. Nuestro equipo de veterinarios certificados está comprometido con la salud y el bienestar de su mascota.",
  services: [
    "Consultas generales",
    "Vacunación",
    "Cirugía",
    "Dermatología",
    "Odontología",
    "Análisis de laboratorio",
    "Radiografía",
    "Hospitalización",
  ],
  staff: [
    {
      name: "Dra. María Rodríguez",
      specialty: "Medicina General",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Dr. Carlos Sánchez",
      specialty: "Cirugía",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Dra. Ana López",
      specialty: "Dermatología",
      image: "/placeholder.svg?height=100&width=100",
    },
  ],
  images: [
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
  ],
  reviews: [
    {
      id: 1,
      user: "Juan Pérez",
      date: "15 de marzo, 2023",
      rating: 5,
      comment: "Excelente atención para mi perro Max. El Dr. Sánchez fue muy profesional y amable.",
      userImage: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 2,
      user: "Laura Gómez",
      date: "2 de febrero, 2023",
      rating: 4,
      comment: "Buena clínica, aunque tuve que esperar un poco más de lo esperado. El tratamiento fue efectivo.",
      userImage: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 3,
      user: "Miguel Torres",
      date: "10 de enero, 2023",
      rating: 5,
      comment:
        "Muy satisfecho con el servicio. La Dra. Rodríguez explicó todo detalladamente y mi gato se recuperó rápidamente.",
      userImage: "/placeholder.svg?height=50&width=50",
    },
  ],
}

export default function VetProdilePage() {
  //const params = useParams()
  //const clinicId = params.id
  const [isFavorite, setIsFavorite] = useState(false)

  // En una aplicación real, usaríamos el ID para obtener los datos de la clínica
  // const clinic = getClinicById(clinicId)
  const clinic = clinicData

  return (
    <div className="container mx-auto px-4 py-12">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">{clinic.name}</h1>
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
              <span className="font-medium mr-1">{clinic.rating}</span>
              <span className="text-gray-500">({clinic.reviewCount} reseñas)</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={16} className="mr-2" />
              <span>{clinic.address}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <Phone size={16} className="mr-2" />
              <span>{clinic.phone}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-2" />
              <span>{clinic.hours[0].hours} (Hoy)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {clinic.images.map((image, index) => (
              <div key={index} className={index === 0 ? "col-span-2" : ""}>
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${clinic.name} - Imagen ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>

          <Tabs defaultValue="about" className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">Acerca de</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="staff">Personal</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Acerca de {clinic.name}</h3>
              <p className="text-gray-700 mb-4">{clinic.description}</p>

              <h4 className="font-semibold mb-2">Horario de atención</h4>
              <div className="space-y-2 mb-4">
                {clinic.hours.map((schedule, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span>{schedule.hours}</span>
                  </div>
                ))}
              </div>

              <h4 className="font-semibold mb-2">Información de contacto</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono</span>
                  <span>{clinic.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sitio web</span>
                  <a
                    href={`https://${clinic.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {clinic.website}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <a href={`mailto:${clinic.email}`} className="text-blue-600">
                    {clinic.email}
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Servicios ofrecidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clinic.services.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Nuestro equipo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {clinic.staff.map((person, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={person.image || "/placeholder.svg"}
                          alt={person.name}
                          className="w-24 h-24 rounded-full mb-3"
                        />
                        <h4 className="font-semibold">{person.name}</h4>
                        <p className="text-gray-600">{person.specialty}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reseñas de clientes</h3>
                <Button variant="outline">Escribir reseña</Button>
              </div>

              <div className="space-y-4">
                {clinic.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <img
                          src={review.userImage || "/placeholder.svg"}
                          alt={review.user}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold">{review.user}</h4>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <Link to={`/pet-dashboard/appointments/schedule?clinic=${clinicData.id}`}>Agendar cita</Link>
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
                {clinic.services.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{service}</span>
                    <Badge variant="outline">Disponible</Badge>
                  </div>
                ))}
                <Separator />
                <Link to="/pet-dashboard/appointments/schedule">
                  <Button variant="link" className="p-0">
                    Ver todos los servicios y precios
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
