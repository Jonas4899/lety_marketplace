import { useAuthStore } from "~/stores/useAuthStore";
import Cookies from "js-cookie";
import type { Owner, Pet as PetType} from "~/types/usersTypes"; 

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Link } from "react-router";
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
import { toast } from "sonner"

interface Pet extends PetType{
  id_mascota: number;
  nombre: string;
  edad: number;
  raza: string;
  especie: string;
  genero: String;
  peso: number,
  foto_url?: string;
}

export default function PetsPage() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  //Data del usuario
   const user = useAuthStore((state) => state.user);
   const userType = useAuthStore((state) => state.userType);
  
  const id_usuario = userType === 'owner' && user ? (user as Owner).id_usuario : undefined;
  const userPets = userType === 'owner' && user ? (user as Owner).mascotas  : undefined;
  console.log(userPets);

  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState(userPets || []);


  const filteredPets = pets.filter(
    (pet) =>
      pet.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.especie.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.raza.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeletePet = (petId: number) => {
    setPets(pets.filter((pet) => pet.id_mascota !== petId))
    // Replace useToast with sonner toast
    toast.success("Mascota eliminada", {
      description: "La mascota ha sido eliminada correctamente"
    })
  }


  const renderPetCard = (pet: Pet) => (
    <Card key={pet.id_mascota} className="overflow-hidden flex flex-col lg:h-3/5 w-4/5 py-0">
      <div className="relative h-3/5">
        {pet.foto_url ? (
          <img 
            src={pet.foto_url} 
            alt={`Foto de ${pet.nombre}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <PawPrint className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

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
              <Link to={`/pet-dashboard/pets/${pet.id_mascota}`}>Ver detalles</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/pet-dashboard/pets/${pet.id_mascota}/edit`}>
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
                    Esta acción no se puede deshacer. Se eliminará permanentemente a {pet.nombre} de tus mascotas
                    registradas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeletePet(pet.id_mascota)}
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

        <CardTitle>{pet.nombre}</CardTitle>
        <CardDescription>
          {pet.especie} • {pet.raza} • {pet.edad} años
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Género:</span>
          <span>{pet.genero}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Peso:</span>
          <span>{pet.peso}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/pet-dashboard/pets/${pet.id_mascota}/edit`}>
            <Edit className="mr-2 h-3 w-3" />
            Editar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/pet-dashboard/pets/${pet.id_mascota}`}>
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
            {filteredPets.filter((pet) => pet.especie === "Perro").map((pet) => renderPetCard(pet))}
          </div>
        </TabsContent>

        <TabsContent value="cats" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.filter((pet) => pet.especie === "Gato").map((pet) => renderPetCard(pet))}
          </div>
        </TabsContent>

        <TabsContent value="others" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.filter((pet) => pet.especie !== "Perro" && pet.especie !== "Gato").length === 0 ? (
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
              filteredPets.filter((pet) => pet.especie !== "Perro" && pet.especie !== "Gato").map((pet) => renderPetCard(pet))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
