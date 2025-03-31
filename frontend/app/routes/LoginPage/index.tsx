import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import {  PawPrint, Building2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Label } from "~/components/ui/label"
import { Loader2 } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Link, useNavigate } from "react-router" 

//Components
import PetOwnerLogin from "~/components/PetOwnerLogin"
import VetLogin from "~/components/VetLogin"

export default function LoginPage() {
   const [userType, setUserType] = useState<"pet-owner" | "vet-clinic">("pet-owner")
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [showPassword, setShowPassword] = useState(false)
   const [isClient, setIsClient] = useState(false)

   const navigate = useNavigate();

   //const { login, isAuthenticated, user } = useAuth();

   // Verificar si el usuario ya está autenticado
   /*
   useEffect(() => {
      setIsClient(true)

      if (isAuthenticated && user) {
         // Redirigir según el tipo de usuario
         if (user.type === "pet-owner") {
         router.push("/pet-dashboard")
         } else if (user.type === "vet-clinic") {
         navigate("/dashboard")
         }
      }
   }, [isAuthenticated, user, router])
   */

  /*
  const handlePetOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPetOwnerFormData({
      ...petOwnerFormData,
      [name]: value,
    })
  }
    
  const handleVetClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVetClinicFormData({
      ...vetClinicFormData,
      [name]: value,
    })
  }


  const handlePetOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // En una aplicación real, harías una llamada a la API para autenticar
      // Para fines de demostración, simularemos un inicio de sesión exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar credenciales (solo demo)
      if (petOwnerFormData.email === "owner@example.com" && petOwnerFormData.password === "password") {
        // Crear datos de usuario
        const userData = {
          id: "owner-" + Date.now(),
          name: "Carlos Rodríguez",
          email: petOwnerFormData.email,
          type: "pet-owner" as const,
          isAuthenticated: true,
        }

        // Iniciar sesión del usuario
        //login(userData)

        // Redirigir al dashboard de dueño de mascota
        navigate("/dashboard-client")
      } else {
        setError("Credenciales inválidas. Para la demo, usa owner@example.com / password")
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }
   
  const handleVetClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // En una aplicación real, harías una llamada a la API para autenticar
      // Para fines de demostración, simularemos un inicio de sesión exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar credenciales (solo demo)
      if (vetClinicFormData.email === "clinic@example.com" && vetClinicFormData.password === "password") {
        // Crear datos de la clínica
        const clinicData = {
          id: "clinic-" + Date.now(),
          name: "Centro Veterinario Salud Animal",
          email: vetClinicFormData.email,
          type: "vet-clinic" as const,
          isAuthenticated: true,
          nit: "900-123456-7", // Incluir NIT para la clínica
        }

        // Iniciar sesión de la clínica
        //login(clinicData)

        // Redirigir al dashboard de la clínica veterinaria
        navigate("/dashboard-vet")
      } else {
        setError("Credenciales inválidas. Para la demo, usa clinic@example.com / password")
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }
    

  /*
  // Si estamos en el servidor o el usuario ya está autenticado, no renderizar nada
  if (!isClient) {
    return null
  }

  
  if (isClient && isAuthenticated && user) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Redirigiendo...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">
              Ya has iniciado sesión. Redirigiendo al dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
*/
     return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        <Tabs
          defaultValue="pet-owner"
          className="w-full"
          onValueChange={(value) => setUserType(value as "pet-owner" | "vet-clinic")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pet-owner" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              <span>Dueño de Mascota</span>
            </TabsTrigger>
            <TabsTrigger value="vet-clinic" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Clínica Veterinaria</span>
            </TabsTrigger>
          </TabsList>

         <TabsContent value="pet-owner">
          <PetOwnerLogin />
         </TabsContent>

          <TabsContent value="vet-clinic">
            <VetLogin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}