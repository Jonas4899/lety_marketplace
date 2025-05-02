import { useAuthStore } from "~/stores/useAuthStore";
import Cookies from "js-cookie";
import type { Owner, Pet as PetType} from "~/types/usersTypes"; 

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Link } from "react-router";
import {
  PawPrint,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
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
import { AddPetDialog } from "./AddPetDialog";
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
  const LOCAL_STORAGE_KEY = "user_pets"; // Clave para localStorage

  //Data del usuario
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  
  const id_usuario = userType === 'owner' && user ? (user as Owner).id_usuario : undefined;
  
  // Cargar mascotas iniciales desde localStorage o desde el estado del usuario
  const loadInitialPets = () => {
    try {
      if (id_usuario) {
        const storedPets = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${id_usuario}`);
        if (storedPets) {
          return JSON.parse(storedPets);
        }
      }
    } catch (error) {
      console.error("Error al cargar mascotas desde localStorage:", error);
    }
    
    // Si no hay en localStorage, usar las del usuario si existen
    const userPets = userType === 'owner' && user ? (user as Owner).mascotas : [];
    return userPets || [];
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>(loadInitialPets());
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Función para guardar mascotas en localStorage
  const savePetsToLocalStorage = useCallback((petsData: Pet[]) => {
    try {
      if (id_usuario) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${id_usuario}`, JSON.stringify(petsData));
      }
    } catch (error) {
      console.error("Error al guardar mascotas en localStorage:", error);
    }
  }, [id_usuario]);

  // Función para precargar imágenes
  const preloadImages = (mascotas: Pet[]) => {
    mascotas.forEach(mascota => {
      if (mascota.foto_url) {
        const img = new Image();
        img.src = mascota.foto_url;
      }
    });
  };

  // Efecto para cargar mascotas desde el servidor y actualizar localStorage
  useEffect(() => {
    const fetchPets = async () => {
      if (!id_usuario) return;
      
      try {
        setLoading(true);
        const token = Cookies.get('auth_token');
        
        const response = await fetch(`${API_URL}/pets/get?id_usuario=${id_usuario}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.mascotas) {
            // Actualizar el estado
            setPets(data.mascotas);
            
            // Guardar en localStorage
            savePetsToLocalStorage(data.mascotas);
            
            // Precargar imágenes
            preloadImages(data.mascotas);
            
            // Actualizar tiempo de última carga
            setLastFetchTime(Date.now());
          }
        } else {
          const errorData = await response.json();
          toast.error("Error al cargar mascotas", {
            description: errorData.message || "No se pudieron cargar las mascotas"
          });
        }
      } catch (error) {
        console.error("Error al cargar mascotas:", error);
        toast.error("Error al cargar mascotas", {
          description: "Ocurrió un error al intentar cargar tus mascotas"
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Si ya hay mascotas en caché y no han pasado más de 5 minutos desde la última carga,
    // no mostrar el indicador de carga
    const cachedPets = loadInitialPets();
    if (cachedPets.length > 0) {
      setPets(cachedPets);
      setLoading(false);
      
      // Verificar si necesitamos recargar silenciosamente
      const currentTime = Date.now();
      const CACHE_DURATION = 300000; // 5 minutos
      const shouldRefetchSilently = !lastFetchTime || (currentTime - lastFetchTime > CACHE_DURATION);
      
      if (shouldRefetchSilently) {
        // Actualizar en segundo plano sin mostrar loading
        fetchPets();
      }
    } else {
      // No hay caché, hacer la carga normal con indicador
      fetchPets();
    }
  }, [id_usuario, API_URL, savePetsToLocalStorage]);

  // Filtrar mascotas según la búsqueda
  const filteredPets = pets.filter(
    (pet) =>
      pet.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.especie.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.raza.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Función para actualizar la lista de mascotas después de agregar una
  const handlePetAdded = async () => {
    if (!id_usuario) {
      toast.error("No se pudo identificar al usuario", {
        description: "Por favor, inicia sesión nuevamente"
      });
      return;
    }
    
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      
      const response = await fetch(`${API_URL}/pets/get?id_usuario=${id_usuario}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.mascotas) {
          // Actualizar el estado con las mascotas obtenidas
          setPets(data.mascotas);
          
          // Guardar en localStorage
          savePetsToLocalStorage(data.mascotas);
          
          // Actualizar tiempo de última carga
          setLastFetchTime(Date.now());
          
          // Mostrar mensaje de éxito
          toast.success("Mascota registrada exitosamente", {
            description: "Se ha actualizado tu lista de mascotas"
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar lista de mascotas");
      }
    } catch (error) {
      console.error("Error al actualizar mascotas:", error);
      toast.error("Error al actualizar mascotas", {
        description: error instanceof Error ? error.message : "No se pudo actualizar la lista de mascotas"
      });
    } finally {
      setLoading(false);
    }
  };

  // Componente de esqueleto para la carga
  const PetCardSkeleton = () => (
    <Card className="overflow-hidden flex flex-col lg:h-3/5 w-4/5 py-0 animate-pulse">
      <div className="relative h-40 bg-gray-200"></div>
      <CardHeader>
        <div className="h-6 w-24 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-10 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-10 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </CardFooter>
    </Card>
  );

  const handleDeletePet = async (petId: number) => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${API_URL}/pets/delete?id_usuario=${id_usuario}&id_mascota=${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedPets = pets.filter((pet) => pet.id_mascota !== petId);
        setPets(updatedPets);

        // Actualizar localStorage
        savePetsToLocalStorage(updatedPets);

        // Mostrar mensaje de éxito
        toast.success("Mascota eliminada", {
          description: "La mascota ha sido eliminada correctamente"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la mascota");
      }
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "No se pudo eliminar la mascota"
      });
    }
  };

  const renderPetCard = (pet: Pet) => (
    <Card key={pet.id_mascota} className="overflow-hidden flex flex-col w-full py-0">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/dashboard-client/pets/${pet.id_mascota}`}>Ver detalles</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard-client/pets/${pet.id_mascota}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente a {pet.nombre} de tu lista de mascotas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => handleDeletePet(pet.id_mascota)}
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
          <Link to={`/dashboard-client/pets/${pet.id_mascota}/edit`}>
            <Edit className="mr-2 h-3 w-3" />
            Editar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard-client/pets/${pet.id_mascota}`}>
            Ver Detalles
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  const NoPetsMessage = () => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <PawPrint className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No hay mascotas registradas</h3>
      <p className="mt-2 text-sm text-muted-foreground">Agrega tu primera mascota para empezar</p>
      <Button 
        className="mt-4"
        onClick={() => setIsAddPetDialogOpen(true)}
      >
        Agregar Mascota
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mis Mascotas</h1>
        <Button onClick={() => setIsAddPetDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Mascota
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

      <Tabs defaultValue="all" className="space-y-2">
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
        </TabsList>

        <TabsContent value="all" className="space-y-1">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px]">
            {loading && pets.length === 0 ? (
              // Mostrar esqueletos solo si está cargando Y no hay datos en caché
              Array(3).fill(0).map((_, index) => (
                <PetCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : filteredPets.length > 0 ? (
              // Mostrar las mascotas cuando estén cargadas o desde caché
              <>
                {filteredPets.map((pet) => renderPetCard(pet))}
                <Card 
                  className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full" 
                  onClick={() => setIsAddPetDialogOpen(true)}
                > 
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">Agregar Mascota</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Registra una nueva mascota en tu familia
                  </p>
                  <Button className="mt-4">
                    Agregar
                  </Button>
                </Card>
              </>
            ) : (
              // Mensaje cuando no hay mascotas
              <NoPetsMessage />
            )}
          </div>
        </TabsContent>

        <TabsContent value="dogs" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px]">
            {filteredPets.filter((pet) => pet.especie === "Canino").length > 0 ? (
              <>
                {filteredPets.filter((pet) => pet.especie === "Canino").map((pet) => renderPetCard(pet))}
                <Card   
                  className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full" 
                  onClick={() => setIsAddPetDialogOpen(true)}
                > 
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">Agregar Perro</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Registra un nuevo perro en tu familia
                  </p>
                  <Button className="mt-4">
                    Agregar
                  </Button>
                </Card>
              </>
            ) : (
              <NoPetsMessage />
            )}
          </div>
        </TabsContent>

        <TabsContent value="cats" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px]">
            {filteredPets.filter((pet) => pet.especie === "Felino").length > 0 ? (
              <>
                {filteredPets.filter((pet) => pet.especie === "Felino").map((pet) => renderPetCard(pet))}
                <Card 
                  className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full" 
                  onClick={() => setIsAddPetDialogOpen(true)}
                > 
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">Agregar Gato</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Registra un nuevo gato en tu familia
                  </p>
                  <Button className="mt-4">
                    Agregar
                  </Button>
                </Card>
              </>
            ) : (
              <NoPetsMessage />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddPetDialog 
        open={isAddPetDialogOpen} 
        onOpenChange={setIsAddPetDialogOpen}
        onSuccess={handlePetAdded}
      />
    </div>
  );
}