import { useAuthStore } from "~/stores/useAuthStore";
import type { Owner, Pet as PetType} from "~/types/usersTypes"; 
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Calendar,
  Clock,
  CheckCircle,
  PawPrint,
  Heart,
  MessageSquare,
  Search,
  Plus,
  ArrowRight,
  BookOpen,
  MapPin,
  Loader2,
} from "lucide-react"
import { Link } from "react-router";
import ProtectedRoutes  from "../../utils/ProtectedRoutes";
import { toast } from "sonner"

interface Pet extends PetType {
  id_mascota: number;
  nombre: string;
  edad: number;
  raza: string;
  especie: string;
  genero: String;
  peso: number,
  foto_url?: string;
}

// Interface for fetched appointment data from the API
interface ApiAppointment {
  id: number;
  petName: string;
  petImage: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  time: string;
  reason: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
  motivo_reprogramacion?: string;
  motivo_cancelacion?: string;
}

// Interface for appointments processed for display
interface DisplayAppointment {
  id: number;
  petName: string;
  clinicName: string;
  date: string; 
  time: string; 
  status: "confirmed" | "pending" | "completed" | "cancelled" | string; // Will hold English values for JSX
}

// Helper function to format date
const formatDisplayDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function PetDashboardPage() {
  const [isNewLogin, setIsNewLogin] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const LOCAL_STORAGE_KEY = "user_pets";

  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const token = useAuthStore((state) => state.token);
  
  const id_usuario = userType === 'owner' && user ? (user as Owner).id_usuario : undefined;
  
  // Pets State
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true); 
  const [petsError, setPetsError] = useState<string | null>(null); 
  const [lastFetchTimePets, setLastFetchTimePets] = useState<number | null>(null); 

  // Appointments State
  const [upcomingAppointments, setUpcomingAppointments] = useState<DisplayAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  // --- PETS DATA HANDLING --- START ---
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

  const savePetsToLocalStorage = useCallback((petsData?: Pet[]) => {
    try {
      if (id_usuario && petsData) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${id_usuario}`, JSON.stringify(petsData));
      }
    } catch (error) {
      console.error("Error al guardar mascotas en localStorage:", error);
    }
  }, [id_usuario]);

  const preloadImages = useCallback((mascotas: Pet[]) => {
    mascotas.forEach(mascota => {
      if (mascota.foto_url) {
        const img = new Image();
        img.src = mascota.foto_url;
      }
    });
  }, []);

  const fetchPets = useCallback(async (triggeredByAction = false) => {
    if (!id_usuario || !token) {
        setLoadingPets(false);
        setPets([]);
        return;
    }
    const currentPetsLength = pets.length;
    const showMainLoader = currentPetsLength === 0 && !triggeredByAction;
    if (showMainLoader) setLoadingPets(true);
    setPetsError(null); 
    try {
      const response = await fetch(`${API_URL}/pets/get?id_usuario=${id_usuario}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedPets: Pet[] = data.mascotas || [];
        setPets(fetchedPets);
        savePetsToLocalStorage(fetchedPets);
        preloadImages(fetchedPets);
        setLastFetchTimePets(Date.now());
      } else {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        const errorMessage = errorData.message || "No se pudieron cargar las mascotas";
        setPetsError(errorMessage);
        toast.error("Error al cargar mascotas", { description: errorMessage });
        setPets([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error al intentar cargar tus mascotas";
      setPetsError(errorMessage);
      toast.error("Error al cargar mascotas", { description: errorMessage });
      setPets([]);
    } finally {
      if (showMainLoader) setLoadingPets(false);
    }
  }, [id_usuario, token, API_URL, savePetsToLocalStorage, preloadImages, pets.length]);
  
  useEffect(() => {
    if (id_usuario && token) {
      const cachedPets = loadPetsFromCache();
      if (cachedPets.length > 0 && !lastFetchTimePets) { 
        setPets(cachedPets);
        setLoadingPets(false);
        const timerId = setTimeout(() => fetchPets(true), 500); 
        return () => clearTimeout(timerId);
      } else {
        fetchPets(false); 
      }
    } else {
        setPets([]);
        setLoadingPets(false);
    }
  }, [id_usuario, token, fetchPets, loadPetsFromCache, lastFetchTimePets]);
  // --- PETS DATA HANDLING --- END ---

  // --- APPOINTMENTS DATA HANDLING --- REVISED --- START ---
  const fetchAppointments = useCallback(async () => {
    if (!id_usuario || !token) {
      setLoadingAppointments(false);
      setUpcomingAppointments([]);
      return;
    }
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const response = await fetch(`${API_URL}/appointments/user?id_usuario=${id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || "Error al obtener las citas");
      }
      const data: { citas: ApiAppointment[] } = await response.json();
      console.log("[Appointments] Raw API data:", JSON.stringify(data.citas, null, 2)); 

      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      console.log("[Appointments] 'today' for filtering (currently bypassed in filter):", today.toISOString());

      // Step 1: Filter raw data directly
      const filteredRawAppointments = (data.citas || [])
        .filter(apiAppt => {
          return (apiAppt.status === "confirmed" || apiAppt.status === "pending");
        });
      console.log("[Appointments] Filtered raw appointments (TEMPORARILY BYPASSING DATE FILTER - checking status only):", JSON.stringify(filteredRawAppointments, null, 2));

      // Step 2: Sort the filtered raw appointments
      const sortedAppointments = filteredRawAppointments.sort((a, b) => {
        // Attempt to parse dates for sorting - subject to the same reliability issues as above.
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const dateComparison = dateA - dateB;
        if (dateComparison !== 0) return dateComparison;
        // Time sorting might also need robust parsing if not in 24hr format or if PM/AM varies.
        return (a.time || "").localeCompare(b.time || ""); 
      });
      console.log("[Appointments] Sorted appointments:", JSON.stringify(sortedAppointments, null, 2));
      
      // Step 3: Map sorted appointments to DisplayAppointment structure
      const upcomingFilteredAppointments = sortedAppointments.map((apiAppt): DisplayAppointment => {
        let displayStatus: DisplayAppointment['status'] = apiAppt.status; 
        if (apiAppt.status === "confirmed") {
          displayStatus = "confirmed";
        } else if (apiAppt.status === "pending") {
          displayStatus = "pending";
        }
        // Add other status mappings here if necessary for display consistency

        return {
          id: apiAppt.id, // Use apiAppt.id
          petName: apiAppt.petName || "Mascota N/A",         // Use apiAppt.petName
          clinicName: apiAppt.clinicName || "Clínica N/A", // Use apiAppt.clinicName
          date: apiAppt.date,     // Use pre-formatted apiAppt.date directly
          time: apiAppt.time,     // Use pre-formatted apiAppt.time directly
          status: displayStatus, 
        };
      });
      
      console.log("[Appointments] Final upcoming filtered appointments for display:", JSON.stringify(upcomingFilteredAppointments, null, 2));
      setUpcomingAppointments(upcomingFilteredAppointments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error al cargar las citas";
      setAppointmentsError(errorMessage);
      toast.error("Error al cargar citas", { description: errorMessage });
      setUpcomingAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [id_usuario, token, API_URL]);

  useEffect(() => {
    if (id_usuario && token) {
      fetchAppointments();
    }
  }, [id_usuario, token, fetchAppointments]);
  // --- APPOINTMENTS DATA HANDLING --- REVISED --- END ---

  return (
    <ProtectedRoutes allowedUserTypes={["owner"]}>
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        {isNewLogin && (
          <div className="mb-4 rounded-lg bg-primary/10 p-4 text-primary animate-in fade-in duration-500">
            <h2 className="mb-2 text-xl font-semibold">¡Bienvenido a Lety Marketplace!</h2>
            <p>
              Has iniciado sesión correctamente. Desde aquí podrás gestionar la información de tus mascotas, agendar citas
              y más.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Mi Panel</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Pets Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Mascotas</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingPets ? (
                <div className="text-2xl font-bold"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : petsError ? (
                <div className="text-sm text-destructive">Error</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{pets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pets.length > 0 
                      ? pets.slice(0, 3).map(p => p.nombre).join(', ') + (pets.length > 3 ? '...' : '')
                      : "No tienes mascotas registradas"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointments Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="text-2xl font-bold"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : appointmentsError ? (
                <div className="text-sm text-destructive">Error</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {upcomingAppointments.length > 0 ? "Citas programadas próximamente" : "No hay citas próximas"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Detailed Pets List Card */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Mis Mascotas</CardTitle>
              <CardDescription>Información rápida sobre tus mascotas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPets ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : petsError ? (
                <div className="text-center text-destructive py-4">
                  <p>Error al cargar tus mascotas: {petsError}</p>
                  <Button onClick={() => fetchPets()} variant="outline" className="mt-2">Reintentar</Button>
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-4">
                  <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No tienes mascotas registradas</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Agrega tu primera mascota para verla aquí.</p>
                  <Button asChild className="mt-4">
                    <Link to="/dashboard-client/pets">Agregar Mascota</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pets.slice(0, 3).map((pet) => (
                    <div key={pet.id_mascota} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                        {pet.foto_url ? (
                          <img src={pet.foto_url} alt={pet.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <PawPrint className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{pet.nombre || "Nombre N/A"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pet.especie || "Especie N/A"} • {pet.raza || "Raza N/A"} • {pet.edad !== null && pet.edad !== undefined ? `${pet.edad} años` : "Edad N/A"}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dashboard-client/pets/${pet.id_mascota}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard-client/pets">Ver todas mis mascotas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Appointments List Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Citas programadas para tus mascotas</CardDescription>
            </CardHeader>
            <CardContent>
            {loadingAppointments ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : appointmentsError ? (
                <div className="text-center text-destructive py-4">
                  <p>Error al cargar tus citas: {appointmentsError}</p>
                  <Button onClick={fetchAppointments} variant="outline" className="mt-2">Reintentar</Button>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No tienes citas próximas</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Agenda una cita para verla aquí.</p>
                  <Button asChild className="mt-4">
                    <Link to="/dashboard-client/appointments/schedule">Agendar Cita</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-1 ${ 
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600" 
                        }`}
                      >
                        {appointment.status === "confirmed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : appointment.status === "pending" ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4" /> 
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {appointment.petName} - {appointment.clinicName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.date} • {appointment.time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard-client/appointments/${appointment.id}`}>Detalles</Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard-client/appointments">Ver todas las citas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommended Clinics Section - remains unchanged for now */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Clínicas Recomendadas</CardTitle>
              <CardDescription>Basado en tu ubicación y necesidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    name: "Centro Veterinario Salud Animal",
                    distance: "1.2 km",
                    rating: 4.8,
                    specialty: "Medicina General, Cirugía",
                  },
                  {
                    id: 2,
                    name: "Clínica Veterinaria PetCare",
                    distance: "2.5 km",
                    rating: 4.6,
                    specialty: "Dermatología, Odontología",
                  },
                  {
                    id: 3,
                    name: "Hospital Veterinario Central",
                    distance: "3.8 km",
                    rating: 4.9,
                    specialty: "Emergencias 24/7, Especialidades",
                  },
                ].map((clinic) => (
                  <div key={clinic.id} className="flex items-start gap-4">
                    <div className="mt-1 rounded-full p-1 bg-muted text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{clinic.name}</p>
                        <p className="text-xs font-medium">★ {clinic.rating}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {clinic.distance} • {clinic.specialty}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard-client/vet-search">Buscar clínicas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoutes>
  )
}

