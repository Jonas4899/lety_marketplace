import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Search, MapPin, Star, Filter, Clock, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Clinic {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  specialties: string[];
  availability: string;
  services: string[];
  openNow: boolean;
  price: "$" | "$$" | "$$$";
  petTypes: string[];
  featured?: boolean;
  favorite?: boolean;
}

export default function ClinicsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [distance, setDistance] = useState([5]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("any");

  const clinics: Clinic[] = [
    {
      id: 1,
      name: "Centro Veterinario Salud Animal",
      image: "/placeholder.svg?height=200&width=400&text=Centro Veterinario",
      rating: 4.9,
      reviews: 124,
      distance: "0.8 km",
      address: "Av. Principal 123, Colonia Centro",
      specialties: ["Emergencias", "Cirugía", "Dental"],
      availability: "Abierto ahora • Cierra a las 20:00",
      services: [
        "Consulta general",
        "Vacunación",
        "Cirugía",
        "Laboratorio",
        "Rayos X",
      ],
      openNow: true,
      price: "$$",
      petTypes: ["Perros", "Gatos", "Aves"],
      featured: true,
      favorite: true,
    },
    {
      id: 2,
      name: "Clínica Veterinaria PetCare",
      image: "/placeholder.svg?height=200&width=400&text=PetCare",
      rating: 4.7,
      reviews: 98,
      distance: "1.2 km",
      address: "Calle Secundaria 456, Colonia Norte",
      specialties: ["Preventiva", "Dermatología", "Nutrición"],
      availability: "Abierto ahora • Cierra a las 19:00",
      services: [
        "Consulta general",
        "Vacunación",
        "Dermatología",
        "Nutrición",
        "Peluquería",
      ],
      openNow: true,
      price: "$",
      petTypes: ["Perros", "Gatos"],
      featured: true,
    },
    {
      id: 3,
      name: "Hospital Veterinario Central",
      image: "/placeholder.svg?height=200&width=400&text=Hospital Veterinario",
      rating: 4.8,
      reviews: 112,
      distance: "1.5 km",
      address: "Blvd. Principal 789, Colonia Sur",
      specialties: ["Exóticos", "Ortopedia", "Cardiología"],
      availability: "Abierto ahora • Cierra a las 18:00",
      services: [
        "Consulta general",
        "Cirugía",
        "Hospitalización",
        "Especialidades",
        "Emergencias 24/7",
      ],
      openNow: true,
      price: "$$$",
      petTypes: ["Perros", "Gatos", "Exóticos", "Reptiles"],
      featured: true,
    },
    {
      id: 4,
      name: "Veterinaria El Buen Amigo",
      image: "/placeholder.svg?height=200&width=400&text=El Buen Amigo",
      rating: 4.5,
      reviews: 87,
      distance: "2.3 km",
      address: "Av. Secundaria 234, Colonia Este",
      specialties: ["Preventiva", "Vacunación", "Peluquería"],
      availability: "Cerrado • Abre mañana a las 9:00",
      services: [
        "Consulta general",
        "Vacunación",
        "Peluquería",
        "Desparasitación",
      ],
      openNow: false,
      price: "$",
      petTypes: ["Perros", "Gatos"],
    },
    {
      id: 5,
      name: "Centro Médico Veterinario Especializado",
      image: "/placeholder.svg?height=200&width=400&text=Centro Especializado",
      rating: 4.9,
      reviews: 156,
      distance: "3.1 km",
      address: "Calle Principal 567, Colonia Oeste",
      specialties: ["Oncología", "Neurología", "Cardiología"],
      availability: "Abierto ahora • Cierra a las 17:00",
      services: [
        "Consulta especializada",
        "Cirugía avanzada",
        "Diagnóstico por imagen",
        "Tratamientos oncológicos",
      ],
      openNow: true,
      price: "$$$",
      petTypes: ["Perros", "Gatos", "Exóticos"],
      favorite: true,
    },
    {
      id: 6,
      name: "Clínica Veterinaria Patitas Felices",
      image: "/placeholder.svg?height=200&width=400&text=Patitas Felices",
      rating: 4.6,
      reviews: 92,
      distance: "3.5 km",
      address: "Av. Terciaria 890, Colonia Norte",
      specialties: ["Preventiva", "Comportamiento", "Nutrición"],
      availability: "Cerrado • Abre mañana a las 10:00",
      services: [
        "Consulta general",
        "Vacunación",
        "Asesoría en comportamiento",
        "Planes nutricionales",
      ],
      openNow: false,
      price: "$$",
      petTypes: ["Perros", "Gatos", "Pequeños mamíferos"],
    },
  ];

  // Filtrar clínicas según los criterios seleccionados
  const filteredClinics = clinics.filter((clinic) => {
    // Filtro por búsqueda
    const matchesSearch =
      searchQuery === "" ||
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Filtro por distancia
    const matchesDistance = Number.parseFloat(clinic.distance) <= distance[0];

    // Filtro por especialidades
    const matchesSpecialties =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.some((s) => clinic.specialties.includes(s));

    // Filtro por tipos de mascotas
    const matchesPetTypes =
      selectedPetTypes.length === 0 ||
      selectedPetTypes.some((p) => clinic.petTypes.includes(p));

    // Filtro por disponibilidad
    const matchesAvailability =
      selectedAvailability.length === 0 ||
      (selectedAvailability.includes("openNow") && clinic.openNow);

    // Filtro por rango de precios
    const matchesPrice =
      selectedPriceRange === "any" ||
      (selectedPriceRange === "$" && clinic.price === "$") ||
      (selectedPriceRange === "$$" && clinic.price === "$$") ||
      (selectedPriceRange === "$$$" && clinic.price === "$$$");

    return (
      matchesSearch &&
      matchesDistance &&
      matchesSpecialties &&
      matchesPetTypes &&
      matchesAvailability &&
      matchesPrice
    );
  });

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    } else {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
    }
  };

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    if (checked) {
      setSelectedPetTypes([...selectedPetTypes, petType]);
    } else {
      setSelectedPetTypes(selectedPetTypes.filter((p) => p !== petType));
    }
  };

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailability([...selectedAvailability, availability]);
    } else {
      setSelectedAvailability(
        selectedAvailability.filter((a) => a !== availability)
      );
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDistance([5]);
    setSelectedSpecialties([]);
    setSelectedPetTypes([]);
    setSelectedAvailability([]);
    setSelectedPriceRange("any");
  };

  const toggleFavorite = (id: number) => {
    // En una aplicación real, esto enviaría una solicitud al servidor
    console.log(`Toggling favorite for clinic ${id}`);
  };

  // Función para iniciar el proceso de programación de citas
  const handleScheduleAppointment = (clinicId: number) => {
    navigate(`/pet-dashboard/appointments/schedule?clinic=${clinicId}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Buscar Veterinarias
        </h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            Mapa
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, dirección o especialidad..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedPriceRange}
            onValueChange={setSelectedPriceRange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquier precio</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="$$">$$</SelectItem>
              <SelectItem value="$$$">$$$</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title="Limpiar filtros"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Panel de filtros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Distancia máxima</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm">Distancia</span>
                      <span className="text-sm font-medium">
                        {distance[0]} km
                      </span>
                    </div>
                    <Slider
                      value={distance}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={setDistance}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Especialidades</h3>
                <div className="space-y-2">
                  {[
                    "Emergencias",
                    "Cirugía",
                    "Dental",
                    "Preventiva",
                    "Dermatología",
                    "Nutrición",
                    "Ortopedia",
                    "Cardiología",
                    "Exóticos",
                  ].map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={(checked) =>
                          handleSpecialtyChange(specialty, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`specialty-${specialty}`}
                        className="text-sm"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tipo de mascotas</h3>
                <div className="space-y-2">
                  {[
                    "Perros",
                    "Gatos",
                    "Aves",
                    "Exóticos",
                    "Reptiles",
                    "Pequeños mamíferos",
                  ].map((petType) => (
                    <div key={petType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pet-${petType}`}
                        checked={selectedPetTypes.includes(petType)}
                        onCheckedChange={(checked) =>
                          handlePetTypeChange(petType, checked as boolean)
                        }
                      />
                      <Label htmlFor={`pet-${petType}`} className="text-sm">
                        {petType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Disponibilidad</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="open-now"
                      checked={selectedAvailability.includes("openNow")}
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange("openNow", checked as boolean)
                      }
                    />
                    <Label htmlFor="open-now" className="text-sm">
                      Abierto ahora
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredClinics.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    No se encontraron resultados
                  </h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros o buscar con otros términos
                  </p>
                  <Button className="mt-4" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredClinics.length}{" "}
                      {filteredClinics.length === 1
                        ? "resultado"
                        : "resultados"}{" "}
                      encontrados
                    </p>
                    <Select defaultValue="distance">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">
                          Distancia: más cercanos
                        </SelectItem>
                        <SelectItem value="rating">
                          Calificación: más alta
                        </SelectItem>
                        <SelectItem value="reviews">
                          Reseñas: más numerosas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredClinics.map((clinic) => (
                    <Card key={clinic.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-1/3">
                            <div className="aspect-video w-full md:h-full">
                              <img
                                src={clinic.image || "/placeholder.svg"}
                                alt={clinic.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                              onClick={() => toggleFavorite(clinic.id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  clinic.favorite
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                }`}
                              />
                            </Button>
                            {clinic.featured && (
                              <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
                                Destacado
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                {clinic.name}
                              </h3>
                              <div className="flex items-center">
                                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {clinic.rating}
                                </span>
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({clinic.reviews})
                                </span>
                              </div>
                            </div>

                            <div className="mb-2 flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>
                                {clinic.distance} • {clinic.address}
                              </span>
                            </div>

                            <div className="mb-2 flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{clinic.availability}</span>
                            </div>

                            <div className="mb-3 flex flex-wrap gap-1">
                              {clinic.specialties.map((specialty) => (
                                <Badge
                                  key={specialty}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>

                            <div className="mb-3 flex flex-wrap gap-1">
                              {clinic.petTypes.map((petType) => (
                                <Badge
                                  key={petType}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {petType}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {clinic.price === "$"
                                    ? "Económico"
                                    : clinic.price === "$$"
                                    ? "Moderado"
                                    : "Premium"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {clinic.price}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    to={`/pet-dashboard/clinics/${clinic.id}`}
                                  >
                                    Ver perfil
                                  </Link>
                                </Button>
                                <Button className="w-full sm:w-auto" asChild>
                                  <Link
                                    to={`/pet-dashboard/appointments/schedule?clinic=${clinic.id}`}
                                  >
                                    Agendar cita
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">
                    Mapa de veterinarias cercanas
                  </p>
                  {/* Aquí iría un componente de mapa real */}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 md:w-1/3">
                  {filteredClinics.slice(0, 3).map((clinic) => (
                    <Card
                      key={clinic.id}
                      className="bg-background/95 backdrop-blur-sm"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                            <div className="relative h-full w-full">
                              <img
                                src={clinic.image || "/placeholder.svg"}
                                alt={clinic.name}
                                className="object-cover h-full w-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {clinic.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {clinic.distance} • {clinic.rating} ★
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-8"
                            >
                              <Link to={`/pet-dashboard/clinics/${clinic.id}`}>
                                Ver
                              </Link>
                            </Button>
                            <Button size="sm" className="h-8" asChild>
                              <Link
                                to={`/pet-dashboard/appointments/schedule?clinic=${clinic.id}`}
                              >
                                Agendar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
