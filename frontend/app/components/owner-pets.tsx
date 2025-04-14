"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import {
  PawPrint,
  Plus,
  Search,
  Syringe,
  Edit,
  Heart,
  Trash2,
  MoreVertical,
  Calendar,
  ChevronRight,
} from "lucide-react"
//import Link from "next/link"
//import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Toaster } from "~/components/ui/sonner"
import { toast } from "sonner"

//import { useToast } from "~/hooks/use-toast"

interface Pet {
  id: number
  name: string
  type: string
  breed: string
  age: number
  gender: string
  weight: string
  image: string
  lastCheckup: string
  nextVaccination: string | null
  medicalConditions: string[]
}

export default function PetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  //const { toast } = useToast()
  const [pets, setPets] = useState<Pet[]>([
    {
      id: 1,
      name: "Max",
      type: "Perro",
      breed: "Labrador Retriever",
      age: 3,
      gender: "Macho",
      weight: "28 kg",
      image: "/placeholder.svg?height=200&width=200&text=Max",
      lastCheckup: "15 de Febrero, 2023",
      nextVaccination: "15 de Abril, 2023",
      medicalConditions: [],
    },
    {
      id: 2,
      name: "Luna",
      type: "Gato",
      breed: "Siamés",
      age: 2,
      gender: "Hembra",
      weight: "4.5 kg",
      image: "/placeholder.svg?height=200&width=200&text=Luna",
      lastCheckup: "10 de Enero, 2023",
      nextVaccination: "10 de Julio, 2023",
      medicalConditions: ["Alergia alimentaria"],
    },
    {
      id: 3,
      name: "Rocky",
      type: "Perro",
      breed: "Bulldog",
      age: 4,
      gender: "Macho",
      weight: "22 kg",
      image: "/placeholder.svg?height=200&width=200&text=Rocky",
      lastCheckup: "5 de Marzo, 2023",
      nextVaccination: null,
      medicalConditions: ["Artritis leve"],
    },
  ])

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeletePet = (petId: number) => {
    setPets(pets.filter((pet) => pet.id !== petId))
    // Replace useToast with sonner toast
    toast.success("Mascota eliminada", {
      description: "La mascota ha sido eliminada correctamente"
    })
  }

  /*
          <Image src={pet.image || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
  */

  const renderPetCard = (pet: Pet) => (
    <Card key={pet.id} className="overflow-hidden">
      <div className="relative aspect-square">

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-12 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/pet-dashboard/pets/${pet.id}`}>Ver detalles</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/pet-dashboard/pets/${pet.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pet-dashboard/appointments/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar cita
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente a {pet.name} de tus mascotas
                    registradas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeletePet(pet.id)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardHeader>
        <CardTitle>{pet.name}</CardTitle>
        <CardDescription>
          {pet.type} • {pet.breed} • {pet.age} años
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Género:</span>
          <span>{pet.gender}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Peso:</span>
          <span>{pet.weight}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Último chequeo:</span>
          <span>{pet.lastCheckup}</span>
        </div>
        {pet.nextVaccination && (
          <div className="flex items-center gap-1 rounded-md bg-primary/10 p-2 text-xs text-primary">
            <Syringe className="h-3 w-3" />
            <span>Próxima vacuna: {pet.nextVaccination}</span>
          </div>
        )}
        {pet.medicalConditions.length > 0 && (
          <div className="rounded-md bg-yellow-100 p-2 text-xs text-yellow-800">
            <span className="font-medium">Condiciones médicas: </span>
            {pet.medicalConditions.join(", ")}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/pet-dashboard/pets/${pet.id}/edit`}>
            <Edit className="mr-2 h-3 w-3" />
            Editar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/pet-dashboard/pets/${pet.id}`}>
            Ver Detalles
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mis Mascotas</h1>
        <Button asChild>
          <Link to="/pet-dashboard/pets/add">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Mascota
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar mascota por nombre, tipo o raza..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <PawPrint className="h-4 w-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="dogs" className="flex items-center gap-2">
            <span>Perros</span>
          </TabsTrigger>
          <TabsTrigger value="cats" className="flex items-center gap-2">
            <span>Gatos</span>
          </TabsTrigger>
          <TabsTrigger value="others" className="flex items-center gap-2">
            <span>Otros</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.map((pet) => renderPetCard(pet))}

            <Card className="flex aspect-square flex-col items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-medium">Agregar Mascota</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Registra una nueva mascota para gestionar su información
              </p>
              <Button className="mt-4" asChild>
                <Link to="/pet-dashboard/pets/add">Agregar</Link>
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dogs" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.filter((pet) => pet.type === "Perro").map((pet) => renderPetCard(pet))}
          </div>
        </TabsContent>

        <TabsContent value="cats" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.filter((pet) => pet.type === "Gato").map((pet) => renderPetCard(pet))}
          </div>
        </TabsContent>

        <TabsContent value="others" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.filter((pet) => pet.type !== "Perro" && pet.type !== "Gato").length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No hay otras mascotas registradas</h3>
                <p className="mt-2 text-sm text-muted-foreground">Agrega una nueva mascota que no sea perro o gato</p>
                <Button className="mt-4" asChild>
                  <Link to="/pet-dashboard/pets/add">Agregar Mascota</Link>
                </Button>
              </div>
            ) : (
              filteredPets.filter((pet) => pet.type !== "Perro" && pet.type !== "Gato").map((pet) => renderPetCard(pet))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
