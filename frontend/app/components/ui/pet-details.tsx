import { Button } from "~/components/ui/button"
import { useParams } from "react-router";
import Cookies from "js-cookie";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import {
  Calendar,
  ChevronRight,
  Edit,
  Trash2,
  ArrowLeft,
  Syringe,
  Weight,
  Cake,
  Clipboard,
  AlertTriangle,
  PawPrint,
  Loader2,
} from "lucide-react"
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
import { Link, useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { useAuthStore } from "~/stores/useAuthStore"
import { PetEditDialog } from "../pet-edit-info";
import type { Pet as PetType} from "~/types/usersTypes";

interface PetDetailsType {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: string;
  weight: string;
  image?: string;
  historial_medico?: string;
  lastCheckup?: string;
  notes?: string;
  appointments?: any[];
}

export default function PetDetails() {

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState(false);
  const [originalPetData, setOriginalPetData] = useState<PetType | null>(null);

  const loadPetData = useCallback(async (triggeredByAction = false) => {
    const showInitialLoader = !pet && !triggeredByAction;
    if (showInitialLoader) {
      setLoading(true);
    }

    const shouldFetchFromApi = triggeredByAction || showInitialLoader;

    let foundInCache = false;
    if (showInitialLoader) {
        try {
            const user = useAuthStore.getState().user;
            const userType = useAuthStore.getState().userType;
             if (user && userType === 'owner' && 'id_usuario' in user) {
                const storedPets = localStorage.getItem(`user_pets_${user.id_usuario}`);
                if (storedPets) {
                    const pets: PetType[] = JSON.parse(storedPets);
                    const foundPet = pets.find((p) => p.id_mascota === Number(id));
                    if (foundPet) {
                        const mappedPet: PetDetailsType = {
                            id: foundPet.id_mascota, name: foundPet.nombre, type: foundPet.especie,
                            breed: foundPet.raza, age: foundPet.edad, gender: foundPet.genero.toString(),
                            weight: `${foundPet.peso} kg`, image: foundPet.foto_url,
                            historial_medico: foundPet.historial_medico, lastCheckup: "No registrado",
                            notes: "No hay notas registradas", appointments: []
                        };
                        setPet(mappedPet);
                        setOriginalPetData(foundPet);
                        foundInCache = true;
                        console.log("Pet details loaded from cache initially.");
                    }
                }
            }
        } catch (e) {
            console.error("Error reading cache", e)
        }
    }

    if (shouldFetchFromApi || !foundInCache) {
         console.log(`Fetching pet details from API. Triggered by action: ${triggeredByAction}`);
         try {
             const token = Cookies.get('auth_token');
             const response = await fetch(`${API_URL}/pets/get-a-pet?id_mascota=${id}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             });

             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: `Error ${response.status}`}));
                 throw new Error(errorData.message || "Error al cargar la mascota");
             }

             const data = await response.json();
             if (data.mascota) {
                 const fetchedPet: PetType = data.mascota;
                 const mappedPet: PetDetailsType = {
                    id: fetchedPet.id_mascota, name: fetchedPet.nombre, type: fetchedPet.especie,
                    breed: fetchedPet.raza, age: fetchedPet.edad, gender: fetchedPet.genero.toString(),
                    weight: `${fetchedPet.peso} kg`, image: fetchedPet.foto_url,
                    historial_medico: fetchedPet.historial_medico, lastCheckup: "No registrado",
                    notes: "No hay notas registradas", appointments: []
                 };
                 setPet(mappedPet);
                 setOriginalPetData(fetchedPet);
                 console.log("Pet details fetched/updated from API.");
             } else {
                 throw new Error("Mascota no encontrada en la API.");
             }
         } catch (error) {
             console.error("Error al cargar la mascota desde API:", error);
             toast.error("Error al cargar", {
                 description: error instanceof Error ? error.message : "No se pudo cargar la información de la mascota"
             });
             navigate("/dashboard-client/pets");
             return;
         }
    }

     if (showInitialLoader) {
         setLoading(false);
     }
  }, [id, navigate, API_URL, pet]);

  useEffect(() => {
    if (id) {
      console.log("Pet ID changed or component mounted. Loading data...");
      loadPetData(false);
    }
  }, [id]);

  const handleOpenEditDialog = () => {
    if (!originalPetData) {
        toast.error("Error", { description: "No se pueden cargar los datos para editar." });
        return;
    }
    setIsEditPetDialogOpen(true);
  };

  const handlePetUpdated = () => {
    console.log("Pet update success. Refetching details...");
    setIsProcessingAction(true);
    loadPetData(true)
        .catch((err) => console.error("Error refetching after update:", err))
        .finally(() => {
            setIsProcessingAction(false);
        });
  };

  const handleDelete = async () => {
    if (!pet) return;
    setIsProcessingAction(true);
    try {
      const token = Cookies.get('auth_token');
      const user = useAuthStore.getState().user;
      const id_usuario = user && 'id_usuario' in user ? user.id_usuario : undefined;
      if (!id_usuario) throw new Error("No se pudo identificar al usuario.");

      const response = await fetch(`${API_URL}/pets/delete?id_usuario=${id_usuario}&id_mascota=${pet.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        try {
            const storedPets = localStorage.getItem(`user_pets_${id_usuario}`);
            if (storedPets) {
                let pets: PetType[] = JSON.parse(storedPets);
                pets = pets.filter(p => p.id_mascota !== pet.id);
                localStorage.setItem(`user_pets_${id_usuario}`, JSON.stringify(pets));
            }
        } catch (e) { console.error("Error updating localStorage after delete:", e); }

        toast.success("Mascota eliminada", { description: `${pet.name} ha sido eliminado.` });
        navigate("/dashboard-client/pets");
      } else {
        const errorData = await response.json().catch(() => ({ message: "Error al eliminar"}));
        throw new Error(errorData.message || "Error al eliminar la mascota");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "Ocurrió un error al eliminar la mascota",
      });
      setIsProcessingAction(false);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  if (loading) {
      return <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Cargando detalles...</span>
             </div>;
  }

  if (!pet || !originalPetData) {
    return <div className="container mx-auto p-4 md:p-8">No se encontró la mascota o hubo un error al cargarla.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 relative">

        {isProcessingAction && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )}

        <div className={`transition-opacity ${isProcessingAction ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="mb-6 flex items-center justify-between">
                <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard-client/pets">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Mis Mascotas
                </Link>
                </Button>
                <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleOpenEditDialog} disabled={isProcessingAction}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isProcessingAction}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente a {pet.name}.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                 <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="relative h-64 w-64 overflow-hidden rounded-lg border">
                         {pet.image ? (<img src={pet.image} alt={pet.name} className="h-full w-full object-cover"/>) : (<div className="flex h-full w-full items-center justify-center bg-muted"><PawPrint className="h-12 w-12 text-muted-foreground" /></div>)}
                        </div>
                        <div className="flex-1">
                             <h1 className="text-3xl font-bold">{pet.name}</h1>
                             <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-sm">{pet.type}</Badge>
                                <Badge variant="outline" className="text-sm">{pet.breed}</Badge>
                                <Badge variant="outline" className="text-sm">{pet.gender}</Badge>
                              </div>
                              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2"><Cake className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Edad</p><p>{pet.age} años</p></div></div>
                                <div className="flex items-center gap-2"><Weight className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Peso</p><p>{pet.weight}</p></div></div>
                                {pet.historial_medico && (<div className="flex items-center gap-2"><Clipboard className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Historial Médico</p>{pet.historial_medico.startsWith('http') ? (<a href={pet.historial_medico} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"><Clipboard className="h-4 w-4" /> Ver/Descargar</a>) : (<p className="text-sm text-muted-foreground">{pet.historial_medico.split('/').pop() || 'Adjunto'}</p>)}</div></div>)}
                                <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Último chequeo</p><p>{pet.lastCheckup || "No registrado"}</p></div></div>
                                {pet.notes && (<div className="mt-4 col-span-full"><p className="text-sm font-medium">Notas</p><p className="text-muted-foreground">{pet.notes}</p></div>)}
                              </div>
                        </div>
                    </div>
                 </CardContent>
                </Card>

                <Tabs defaultValue="medical" className="w-full">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="medical" className="flex items-center gap-2"><Clipboard className="h-4 w-4" /><span>Historial Médico</span></TabsTrigger>
                     <TabsTrigger value="appointments" className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Citas</span></TabsTrigger>
                   </TabsList>
                   <TabsContent value="medical" className="mt-4">
                     <Card>
                       <CardHeader>
                         <CardTitle>Historial Médico</CardTitle>
                         <CardDescription>Información médica relevante de {pet.name}</CardDescription>
                       </CardHeader>
                       <CardContent>
                         {pet.historial_medico ? (
                           <div className="rounded-md border p-4">
                              <p className="font-medium mb-2">Archivo de Historial Médico:</p>
                               {pet.historial_medico.startsWith('http') ? (
                                    <a href={pet.historial_medico} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                                        <Clipboard className="h-4 w-4" /> Ver/Descargar Historial
                                    </a>
                                 ) : (
                                    <p className="text-sm text-muted-foreground"> {pet.historial_medico.split('/').pop() || 'Archivo adjunto disponible'}</p>
                                 )}
                           </div>
                         ) : (
                            <div className="rounded-md border p-4 text-center text-muted-foreground">
                              No hay historial médico adjunto.
                            </div>
                         )}
                       </CardContent>
                     </Card>
                   </TabsContent>

                   <TabsContent value="appointments" className="mt-4">
                     <Card>
                       <CardHeader>
                         <CardTitle>Historial de Citas</CardTitle>
                         <CardDescription>Citas veterinarias pasadas y programadas para {pet.name}</CardDescription>
                       </CardHeader>
                       <CardContent>
                         {pet.appointments && pet.appointments.length > 0 ? (
                           <div className="space-y-4">
                             {pet.appointments.map((appointment: any) => (
                               <div key={appointment.id} className="rounded-md border p-4">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                     <p className="font-medium">{appointment.date}</p>
                                     <p className="text-muted-foreground">{appointment.clinic}</p>
                                   </div>
                                   <div className="mt-2 sm:mt-0">
                                     <Badge variant="outline">{appointment.reason}</Badge>
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="rounded-md border p-4">
                             <p className="text-center text-muted-foreground">No hay citas registradas.</p>
                           </div>
                         )}
                       </CardContent>
                       <CardFooter className="flex justify-end">
                         <Button asChild>
                           <Link to="/dashboard-client/schedule-appointment">
                              Agendar cita
                           </Link>
                         </Button>
                       </CardFooter>
                     </Card>
                   </TabsContent>
                 </Tabs>
            </div>
        </div>

        <PetEditDialog
            open={isEditPetDialogOpen}
            onOpenChange={setIsEditPetDialogOpen}
            petToEdit={originalPetData}
            onSuccess={handlePetUpdated}
        />
    </div>
  )
}