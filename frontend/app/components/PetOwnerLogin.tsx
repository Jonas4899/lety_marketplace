import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Loader2 } from "lucide-react"
import {  PawPrint, Building2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router" 


export default function PetOwnerLogin() {

   const [userType, setUserType] = useState<"pet-owner" | "vet-clinic">("pet-owner")
   const [error, setError] = useState<string | null>(null)
   const [showPassword, setShowPassword] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [petOwnerFormData, setPetOwnerFormData] = useState({
      email: "",
      password: "",
   })

   const handlePetOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPetOwnerFormData({
      ...petOwnerFormData,
      [name]: value,
    })
  }

   return (
      <Card>
         <form>
            <CardHeader className="py-4">
            <CardTitle>Dueño de Mascota</CardTitle>
            <CardDescription>Ingresa tus datos para acceder a la información de tus mascotas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
               <Label htmlFor="pet-owner-email">Correo Electrónico</Label>
               <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                  id="pet-owner-email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9"
                  value={petOwnerFormData.email}
                  onChange={handlePetOwnerChange}
                  required
                  />
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <Label htmlFor="pet-owner-password">Contraseña</Label>
                  <Link to="/" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                  </Link>
               </div>
               <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                  id="pet-owner-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={petOwnerFormData.password}
                  onChange={handlePetOwnerChange}
                  required
                  />
                  <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowPassword(!showPassword)}
                  >
                  {showPassword ? (
                     <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                     <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                  </Button>
               </div>
            </div>

            {error && userType === "pet-owner" && (
               <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
               {isLoading ? (
                  <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                  </>
               ) : (
                  "Iniciar Sesión"
               )}
            </Button>
            <div className="text-center text-sm">
               ¿No tienes una cuenta?{" "}
               <Link to="/" className="text-primary hover:underline">
                  Regístrate
               </Link>
            </div>
            </CardFooter>
         </form>
      </Card>
   );
}