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
  Loader2,
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
import { PetEditDialog } from "./pet-edit-info";

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
  const loadPetsFromCache = useCallback(() => {
    try {
      if (id_usuario) {
        const storedPets = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${id_usuario}`);
        if (storedPets) {
          return JSON.parse(storedPets);
        }
      }
    } catch (error) {
      console.error("Error loading pets from localStorage:", error);
    }
    return [];
  }, [id_usuario]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // State for the edit dialog
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);

  // --- New State for Action Processing ---
  const [isProcessingAction, setIsProcessingAction] = useState(false);

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

  // Modified fetchPets to accept a silent option
  const fetchPets = useCallback(async (triggeredByAction = false) => {
    if (!id_usuario) {
        setLoading(false);
        return;
    }

    // Read current pets length directly inside
    const currentPetsLength = pets.length;
    const showMainLoader = currentPetsLength === 0 && !triggeredByAction;

    if (showMainLoader) {
        setLoading(true);
    }

    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${API_URL}/pets/get?id_usuario=${id_usuario}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedPets = data.mascotas || [];
        setPets(fetchedPets);
        savePetsToLocalStorage(fetchedPets);
        preloadImages(fetchedPets);
        setLastFetchTime(Date.now());
      } else {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        toast.error("Error al cargar mascotas", {
            description: errorData.message || "No se pudieron cargar las mascotas"
        });
      }
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      toast.error("Error al cargar mascotas", {
        description: error instanceof Error ? error.message : "Ocurrió un error al intentar cargar tus mascotas"
      });
    } finally {
      if (showMainLoader) {
        setLoading(false);
      }
    }
  }, [id_usuario, API_URL, savePetsToLocalStorage]);

  // useEffect for initial load and background refresh
  useEffect(() => {
    if (id_usuario) {
      console.log("OwnerPets: Initial load effect - id_usuario available.");
      const cachedPets = loadPetsFromCache();
      if (cachedPets.length > 0) {
        console.log("OwnerPets: Initial load from cache.");
        setPets(cachedPets);
        setLoading(false);
        // Use setTimeout to fetch in background after initial render with cache
        const timerId = setTimeout(() => fetchPets(true), 0);
        return () => clearTimeout(timerId); // Cleanup timeout
      } else {
        console.log("OwnerPets: No cache, fetching from API for initial load.");
        fetchPets(false);
      }
    } else {
        // Handle case where user logs out or id_usuario becomes undefined
        setPets([]);
        setLoading(false); // Not loading if no user
    }
  }, [id_usuario, fetchPets, loadPetsFromCache]);

  // Filtrar mascotas según la búsqueda
  const filteredPets = pets.filter(
    (pet) =>
      pet.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.especie.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.raza.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to open the edit dialog
  const handleOpenEditDialog = (pet: Pet) => {
    setPetToEdit(pet);
    setIsEditPetDialogOpen(true);
  };

  // Function to handle successful pet update (will eventually call API)
  const handlePetUpdated = () => {
    console.log("Pet update success callback triggered. Setting processing state.");
    setIsProcessingAction(true);

    // Use setTimeout to allow state update to render before fetching
    const timerId = setTimeout(() => {
        console.log("OwnerPets: Fetching after update...");
        fetchPets(true) // Indicate triggered by action
            .catch(err => console.error("Error refetching after update:", err))
            .finally(() => {
                console.log("OwnerPets: Finished refetching after update.");
                setIsProcessingAction(false);
            });
    }, 0); // Delay of 0 pushes to next event loop tick

    // Optional: Cleanup timeout if component unmounts during the delay
    // This might be overly cautious but good practice in some scenarios.
    // useEffect(() => {
    //     return () => clearTimeout(timerId);
    // }, [timerId]); // Need timerId in state or ref if using this cleanup pattern
  };

  // Función para actualizar la lista de mascotas después de agregar una
  const handlePetAdded = () => {
    console.log("Pet added success callback triggered. Setting processing state.");
    setIsProcessingAction(true);

    // Use setTimeout
    const timerId = setTimeout(() => {
        console.log("OwnerPets: Fetching after add...");
        fetchPets(true) // Indicate triggered by action
            .then(() => {
                toast.success("Mascota registrada exitosamente", {
                    description: "Se ha actualizado tu lista de mascotas"
                });
            })
            .catch(err => console.error("Error refetching after add:", err))
            .finally(() => {
                 console.log("OwnerPets: Finished refetching after add.");
                setIsProcessingAction(false);
            });
    }, 0);
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
    setIsProcessingAction(true); // Set loading state immediately
    let deleteSuccess = false;
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${API_URL}/pets/delete?id_usuario=${id_usuario}&id_mascota=${petId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        deleteSuccess = true;
        console.log(`Pet ${petId} deleted successfully. Refetching...`);
        // Use await here because we want the success toast *after* refetch completes
        await fetchPets(true);
        toast.success("Mascota eliminada", {
          description: "La mascota ha sido eliminada correctamente"
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: "Error al eliminar" }));
        throw new Error(errorData.message || "Error al eliminar la mascota");
      }
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "No se pudo eliminar la mascota"
      });
    } finally {
      // Ensure processing state is turned off regardless of outcome
      console.log("OwnerPets: Finished processing delete action.");
      setIsProcessingAction(false);
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
            <DropdownMenuItem onSelect={() => handleOpenEditDialog(pet)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
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
        <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(pet)}>
            <Edit className="mr-2 h-3 w-3" />
            Editar
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
        <Button onClick={() => setIsAddPetDialogOpen(true)} disabled={isProcessingAction || loading}>
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
            disabled={isProcessingAction || loading}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-2">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2" disabled={isProcessingAction || loading}>
            <PawPrint className="h-4 w-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="dogs" className="flex items-center gap-2" disabled={isProcessingAction || loading}>
            <span>Perros</span>
          </TabsTrigger>
          <TabsTrigger value="cats" className="flex items-center gap-2" disabled={isProcessingAction || loading}>
            <span>Gatos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="relative min-h-[200px]">
           {isProcessingAction && ( <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
           <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px] ${isProcessingAction ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <PetCardSkeleton key={`skeleton-${index}`} />
                    ))
                ) : filteredPets.length > 0 ? (
                    <>
                        {filteredPets.map((pet) => renderPetCard(pet))}
                        <Card
                            className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full hover:border-primary transition-colors"
                            onClick={() => setIsAddPetDialogOpen(true)}
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <Plus className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 text-xl font-medium">Agregar Mascota</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Registra una nueva mascota
                            </p>
                            <Button className="mt-4">Agregar</Button>
                        </Card>
                    </>
                ) : pets.length === 0 ? (
                   <NoPetsMessage />
                ) : (
                     <div className="col-span-full text-center p-8">No se encontraron mascotas con ese criterio.</div>
                )}
            </div>
        </TabsContent>

        <TabsContent value="dogs" className="relative min-h-[200px]">
             {isProcessingAction && ( <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
             <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px] ${isProcessingAction ? 'opacity-50 pointer-events-none' : ''}`}>
                {!loading && filteredPets.filter((pet) => pet.especie === "Canino").length > 0 ? (
                   <>
                        {filteredPets.filter((pet) => pet.especie === "Canino").map((pet) => renderPetCard(pet))}
                        <Card className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full hover:border-primary transition-colors" onClick={() => setIsAddPetDialogOpen(true)}>
                           <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"><Plus className="h-10 w-10 text-primary" /></div>
                           <h3 className="mt-4 text-xl font-medium">Agregar Perro</h3>
                           <p className="mt-2 text-center text-sm text-muted-foreground">Registra un nuevo perro</p>
                           <Button className="mt-4">Agregar</Button>
                         </Card>
                   </>
                ) : !loading && (
                   <NoPetsMessage />
                )}
             </div>
        </TabsContent>

        <TabsContent value="cats" className="relative min-h-[200px]">
             {isProcessingAction && ( <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
             <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-14 lg:auto-rows-[640px] ${isProcessingAction ? 'opacity-50 pointer-events-none' : ''}`}>
                 {!loading && filteredPets.filter((pet) => pet.especie === "Felino").length > 0 ? (
                    <>
                         {filteredPets.filter((pet) => pet.especie === "Felino").map((pet) => renderPetCard(pet))}
                         <Card className="flex aspect-square flex-col items-center justify-center cursor-pointer h-full w-full hover:border-primary transition-colors" onClick={() => setIsAddPetDialogOpen(true)}>
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"><Plus className="h-10 w-10 text-primary" /></div>
                            <h3 className="mt-4 text-xl font-medium">Agregar Gato</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">Registra un nuevo gato</p>
                            <Button className="mt-4">Agregar</Button>
                          </Card>
                    </>
                 ) : !loading && (
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

      {/* Render the Edit Pet Dialog */}
      {petToEdit && (
        <PetEditDialog
            open={isEditPetDialogOpen}
            onOpenChange={setIsEditPetDialogOpen}
            petToEdit={petToEdit}
            onSuccess={handlePetUpdated}
        />
      )}
    </div>
  );
}