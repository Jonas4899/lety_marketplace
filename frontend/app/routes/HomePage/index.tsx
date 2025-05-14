import { Button } from "~/components/ui/button"
import {
  Search,
  Calendar,
  User,
  Star,
  CheckCircle,
  ArrowRight,
  PawPrint,
  Stethoscope,
  Clock,
  MapPin,
} from "lucide-react"
import { Link } from "react-router";
import { useState } from "react";
import { UserTypeModal } from "~/components/user-type-modal";
import { PetOwnerSignup } from "~/components/pet-owner-signup";
import { VetClinicSignup } from "~/components/vet-clinic-signup";

export default function LandingPage() {

  const vets = [
    {
      id: 1,
      image: "https://wziqpbbbqodoinsgbgwr.supabase.co/storage/v1/object/public/veterinary-photos//1746453807725-Gemini_Generated_Image_xmi858xmi858xmi8.jpg",
      name: "VetPlanet",
      location: "Cl. 12c #71b-40 Bogotá",
      availability: "24 horas"
    },
    {      
      id: 2,
      image: "https://wziqpbbbqodoinsgbgwr.supabase.co/storage/v1/object/public/veterinary-photos//1746461119226-Gemini_Generated_Image_hxb4o8hxb4o8hxb4.jpg",
      name: "Huellitas",
      location: "Cl. 14b #45.08 Bogotá",
      availability: "24 horas"
    },
    {
      id: 2,
      image: "https://wziqpbbbqodoinsgbgwr.supabase.co/storage/v1/object/public/veterinary-photos//1746820280416-Gemini_Generated_Image_qd2qfzqd2qfzqd2q.jpg",
      name: "Angelo's vet",
      location: "Cl. 12c #71b-40 Bogotá",
      availability: "24 horas"
    }
  ];

  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [isPetOwnerSignupOpen, setIsPetOwnerSignupOpen] = useState(false);
  const [isVetClinicSignupOpen, setIsVetClinicSignupOpen] = useState(false);

  const handleUserTypeSelect = (
    userType: "pet-owner" | "vet-clinic" | null
  ) => {
    setIsUserTypeModalOpen(false);

    if (userType === "pet-owner") {
      setIsPetOwnerSignupOpen(true);
    } else if (userType === "vet-clinic") {
      setIsVetClinicSignupOpen(true);
    }
  };

  const handleBackToUserType = () => {
    setIsPetOwnerSignupOpen(false);
    setIsVetClinicSignupOpen(false);
    setIsUserTypeModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col w-full justify-center items-center">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">LETY MARKETPLACE</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link to="#features" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Caracteristicas
            </Link>
            <Link to="#how-it-works" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              ¿Como funciona?
            </Link>
            <Link to="#vets" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Veterinarias
            </Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium hover:text-emerald-600 transition-colors"
            >
              Iniciar sesion
            </Link>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsUserTypeModalOpen(true)}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-emerald-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Conectando dueños de mascotas con servicios de calidad
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Encuentra la Veterinaria Ideal para tu Mascota
                </h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl">
                  En Lety Marketplace te ayudamos a descubrir y contactar con veterinarios verificados en tu zona. Reserva fácilmente y asegúrate de que tu mascota reciba la atención que merece.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/login">
                      Buscar Veterinarias
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setIsUserTypeModalOpen(true)}>
                    Soy Veterinario, Quiero Unirme
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Caracteristicas
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Todo lo que necesitas en un solo lugar</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl">
                  Centralizamos la información de distintas veterinarias para que encuentres fácilmente la opción ideal para tu mascota.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3">
              <div className="flex h-full flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Search className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Búsqueda Fácil</h3>
                <p className="text-center text-gray-500">
                  Encuentra veterinarios por ubicación, especialidad, valoraciones y disponibilidad, con nuestros filtros de búsqueda.
                </p>
              </div>
              <div className="flex h-full flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Reservas en Línea</h3>
                <p className="text-center text-gray-500">
                  Agenda citas al instante con disponibilidad en tiempo real y recordatorios automáticos.
                </p>
              </div>
              <div className="flex h-full flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Perfiles personalizados</h3>
                <p className="text-center text-gray-500">
                  Crea perfiles detallados para tus mascotas con su historial médico, preferencias y necesidades especiales. Todo en un solo lugar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Como funciona
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Proceso Sencillo, Cuidado Excepcional </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl">
                  Encontrar atención veterinaria de calidad para tu mascota nunca fue tan fácil. 
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  1
                </div>
                <h3 className="text-xl font-bold">Busca</h3>
                <p className="text-gray-500">Encuentra veterinarias según ubicación, especialidad y opiniones de otros usuarios.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  2
                </div>
                <h3 className="text-xl font-bold">Compara</h3>
                <p className="text-gray-500">Revisa perfiles, compara servicios, precios y las experiencias de otros dueños de mascotas.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  3
                </div>
                <h3 className="text-xl font-bold">Agenda</h3>
                <p className="text-gray-500">Agenda fácilmente una cita con la veterinaria que elijas.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  4
                </div>
                <h3 className="text-xl font-bold">Conecta</h3>
                <p className="text-gray-500">Recibe la atención que tu mascota necesita y mantente en contacto a través de nuestra plataforma.</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Pet Owners & Vets Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-xl bg-emerald-50 p-6">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700 w-fit">
                  Para Dueños de Mascotas
                </div>
                <h2 className="text-3xl font-bold tracking-tighter">Encuentra la Veterinaria Ideal para Tu Mascota</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Acceso a veterinarias con servicios de calidad.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Consulta reseñas reales de nuestra comunidad de dueños.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Agenda tu cita en línea de forma rápida y sencilla.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Gestiona el historial de salud de tu mascota en un solo lugar.</span>
                  </li>
                </ul>

                <Button
                  className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setIsUserTypeModalOpen(true)}
                >
                  Encuenta veterinarias <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-xl bg-blue-50 p-6">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 w-fit">
                  Para veterinarias
                </div>
                <h2 className="text-3xl font-bold tracking-tighter">Impulsa Tu Clínica Veterinaria</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Amplía tu visibilidad ante dueños de mascotas cercanos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Simplifica tu calendario de citas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Gestiona todas tus citas de manera sencilla.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Construye tu reputación online con opiniones verificadas.</span>
                  </li>
                </ul>

                <Button
                  className="w-fit bg-blue-700 hover:bg-blue-900 text-white"
                  onClick={() => setIsUserTypeModalOpen(true)}
                >
                  Únete como Veterinaria <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </div>
            </div>
          </div>
        </section>

        {/*
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl">
                  Hear from pet owners and veterinarians who have experienced the benefits of our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col justify-between space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex text-yellow-400">
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                  </div>
                  <p className="text-gray-500">
                    "Finding a vet for my anxious cat used to be so stressful. With VetConnect, I found a specialist who
                    understands her needs. The booking process was seamless!"
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-1">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Pet Owner</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex text-yellow-400">
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                  </div>
                  <p className="text-gray-500">
                    "As a veterinarian with a new practice, VetConnect has been instrumental in helping me build my
                    client base. The platform is intuitive and professional."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-1">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dr. Michael Chen</p>
                    <p className="text-xs text-gray-500">Veterinarian</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex text-yellow-400">
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                    <Star className="fill-yellow-400 h-5 w-5" />
                  </div>
                  <p className="text-gray-500">
                    "When my dog needed emergency care while we were traveling, VetConnect helped us find a reputable
                    vet in minutes. I'm so grateful for this service!"
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-1">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">James Rodriguez</p>
                    <p className="text-xs text-gray-500">Pet Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        */}
        {/* Featured Vets Section */}
        <section className="w-full py-12 md:py-24 lg:py-32" id="vets">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Featured Veterinarians
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Our Top Rated Vets</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl">
                  These highly-rated professionals are ready to provide exceptional care for your pets.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {vets.map((vet) => (
                <div key={vet.id} className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm">
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <img
                      src={`${vet.image}`}
                      alt={`Veterinaria`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{vet.name}</h3>
                      <div className="flex text-yellow-400">
                        <Star className="fill-yellow-400 h-4 w-4" />
                        <span className="ml-1 text-sm font-medium text-gray-900">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{vet.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{vet.availability}</span>
                    </div>
                  </div>
                  { /*
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Profile</Button>
                  */}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              {/*
              <Button variant="outline" className="mt-4">
                View All Veterinarians <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              */}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="mx-auto max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                Preparado para Encontrar al Veterinario Ideal?
              </h2>
              <p className="text-white/90 md:text-xl">
                Únete a nuesta comunidad de dueños de mascotas que han encontrado la atención veterinaria perfecta a través de nuestra plataform
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100"
                  onClick={() => setIsUserTypeModalOpen(true)}>
                  Comienza Ahora!
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background">
        <div className="container mx-auto flex flex-col gap-6 py-12 px-4 md:px-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-6 md:w-1/3">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold">Lety Marketplace</span>
            </div>
            <p className="text-sm text-gray-500">
              Conectando dueños de mascotas con veterinarios de confianza para una mejor salud animal.
            </p>
            <div className="flex gap-4">
              <Link to="#" className="text-gray-500 hover:text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-gray-500 hover:text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-gray-500 hover:text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Dueños de mascotas</h3>
              <nav className="flex flex-col gap-2">
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Encuentra una veterianra
                </Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Como funciona?
                </Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  FAQs
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Para veterinarias</h3>
              <nav className="flex flex-col gap-2">
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Únete como veterinaria
                </Link>

              </nav>
            </div>
            {/*
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Company</h3>
              <nav className="flex flex-col gap-2">
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  About Us
                </Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Careers
                </Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Blog
                </Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Press
                </Link>
              </nav>
            </div>
            */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link to="#" className="text-sm text-gray-500 hover:text-emerald-600">
                  Terminos y condiciones
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 md:px-6 md:flex-row md:justify-between">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Lety Marketplace. All rights reserved.</p>
            <p className="text-xs text-gray-500">Hecho con ❤️ para mascotas y sus dueños</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserTypeModal
        open={isUserTypeModalOpen}
        onOpenChange={setIsUserTypeModalOpen}
        onSelectUserType={handleUserTypeSelect}
      />

      <PetOwnerSignup
        open={isPetOwnerSignupOpen}
        onOpenChange={setIsPetOwnerSignupOpen}
        onBack={handleBackToUserType}
      />

      <VetClinicSignup
        open={isVetClinicSignupOpen}
        onOpenChange={setIsVetClinicSignupOpen}
        onBack={handleBackToUserType}
      />
    </div>
  )
}

