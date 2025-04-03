import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {  PawPrint, Building2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router" 
import { useForm } from "react-hook-form"
import { z } from "zod"
import { loginFormSchema } from "~/zodSchemas/loginFormSchema"

//Components
import PetOwnerLogin from "~/components/PetOwnerLogin"
import VetLogin from "~/components/VetLogin"
import { zodResolver } from "@hookform/resolvers/zod"

export default function LoginPage() {
   const [userType, setUserType] = useState<"pet-owner" | "vet-clinic">("pet-owner")
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [showPassword, setShowPassword] = useState(false)
   const [isClient, setIsClient] = useState(false)

   const navigate = useNavigate();

   type LoginFormData = z.infer<typeof loginFormSchema>
   const ownerForm = useForm<LoginFormData>({
     resolver: zodResolver(loginFormSchema),
     mode: "onTouched",
     defaultValues: {
       email: "",
       password: "",
     }
   });

   // Configuración del formulario para clínica veterinaria
   const vetForm = useForm<LoginFormData>({
     resolver: zodResolver(loginFormSchema),
     mode: "onTouched",
     defaultValues: {
       email: "",
       password: "",
     }
   });

   const handlePetOwnerSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsLoading(true)
    try {
      console.log("Enviando datos de inicio de sesión del dueño de mascota:", data)
      // Simulación de llamada a la API
      //...
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false);
    }
   }

   const handleVetSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsLoading(true)
    try {
      console.log("Enviando datos de inicio de sesión de la clínica veterinaria:", data)
      // Simulación de llamada a la API
      //...
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false);
    }
   }

    return (
    <div className="flex h-[90vh] w-screen flex-col items-center justify-center">
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
          <PetOwnerLogin form={ownerForm} onSubmit={handlePetOwnerSubmit} isLoading={isLoading} error={error && userType === "pet-owner" ? error : null} />
         </TabsContent>

          <TabsContent value="vet-clinic">
            <VetLogin 
              form={vetForm} 
              onSubmit={handleVetSubmit} 
              isLoading={isLoading} 
              error={error && userType === "vet-clinic" ? error : null} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}