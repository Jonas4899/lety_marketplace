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
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuthStore } from "~/stores/useAuthStore"


export default function PetDetails() {

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const navigate = useNavigate();
  const { id } = useParams(); // Get the pet ID from the URL
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPetData = async () => {
      try {
        const user = useAuthStore.getState().user;
        const userType = useAuthStore.getState().userType;
        
        if (user && userType === 'owner' && 'id_usuario' in user) {
          const storedPets = localStorage.getItem(`user_pets_${user.id_usuario}`);
          
          if (storedPets) {
            const pets = JSON.parse(storedPets);
            const foundPet = pets.find((p: any) => p.id_mascota === Number(id));
            
            if (foundPet) {
              // Map the localStorage pet data to match the component's expected structure
              const mappedPet = {
                id: foundPet.id_mascota,
                name: foundPet.nombre,
                type: foundPet.especie,
                breed: foundPet.raza,
                age: foundPet.edad,
                gender: foundPet.genero,
                weight: `${foundPet.peso} kg`,
                image: foundPet.foto_url,
                lastCheckup: "No registrado",
                notes: "No hay notas registradas",
                appointments: []
              };
              
              setPet(mappedPet);
              setLoading(false);
              return;
            }
          }
        }

        // If not found in localStorage, fetch from API
        const token = Cookies.get('auth_token');
        const response = await fetch(`${API_URL}/pets/get-a-pet?id_mascota=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al cargar la mascota");
        }

        const data = await response.json();
        if (data.mascota) {
          setPet(data.mascota);
        } else {
          navigate("/dashboard-client/pets");
        }
      } catch (error) {
        console.error("Error al cargar la mascota:", error);
        toast.error("Error", {
          description: error instanceof Error ? error.message : "No se pudo cargar la información de la mascota"
        });
        navigate("/dashboard-client/pets");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPetData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      // Simulación de eliminación - en una aplicación real, esto sería una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Mascota eliminada", {
        description: `${pet.name} ha sido eliminado de tus mascotas`,
      })

      navigate("/pet-dashboard/pets")
    } catch (error) {
      toast.error("Error", {
        description: "Ocurrió un error al eliminar la mascota",
      })
    }
  }

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /*
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-64 w-64 rounded-lg" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
   */

  if (!pet) {
    return null // Esto no debería ocurrir debido a la redirección en useEffect
  }

  return (
    <div className="container mx-auto p-4 md:p-8">

      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard-client/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Mascotas
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/pet-dashboard/pets/${pet.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
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
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative h-64 w-64 overflow-hidden rounded-lg border">
                {pet.image ? (
                  <img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <PawPrint className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{pet.name}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm">
                    {pet.type}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {pet.breed}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {pet.gender}
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Edad</p>
                      <p>
                        {12}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Peso</p>
                      <p>{pet.weight}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Último chequeo</p>
                      <p>{pet.lastCheckup}</p>
                    </div>
                  </div>
                  {pet.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Notas</p>
                      <p className="text-muted-foreground">{pet.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="medical" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span>Historial Médico</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Citas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medical" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial Médico</CardTitle>
                <CardDescription>Registro médico completo de {pet.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4">
                  <p className="text-center text-muted-foreground">
                    No hay registros médicos disponibles. Las visitas al veterinario se mostrarán aquí.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pet-dashboard/medical-records">Ver historial médico completo</Link>
                </Button>
              </CardFooter>
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
                  <Link to="/pet-dashboard/appointments/schedule">Agendar cita</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}