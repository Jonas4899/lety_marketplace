import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Loader2 } from "lucide-react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Form, Link, useNavigate } from "react-router" 
import { z } from "zod"
import { loginFormSchema } from "~/zodSchemas/loginFormSchema"
import type { UseFormReturn } from "react-hook-form"

type LoginFormData = z.infer<typeof loginFormSchema>;

interface PetOwnerLoginProps {
   form: UseFormReturn<LoginFormData>;
   onSubmit: (data: LoginFormData) => void;
   isLoading: boolean;
   error: string | null;
}

export default function VetLogin({form, onSubmit, isLoading, error}: PetOwnerLoginProps) {

   const [userType, setUserType] = useState<"pet-owner" | "vet-clinic">("pet-owner")
   const [showPassword, setShowPassword] = useState(false)

   return (
      <Card>
         <form /*onAbort={handleVetClinicSubmit}*/>
            <CardHeader className="py-4">
            <CardTitle>Clínica Veterinaria</CardTitle>
            <CardDescription>Ingresa tus datos para acceder al panel de administración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
               <Label htmlFor="vet-clinic-email">Correo Electrónico</Label>
               <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                  id="email"
                  type="email"
                  placeholder="clinica@email.com"
                  className="pl-9"
                  {...form.register("email")}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <Label htmlFor="vet-clinic-password">Contraseña</Label>
                  <Link to="/" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                  </Link>
               </div>
               <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  {...form.register("password")}
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

            {error && userType === "vet-clinic" && (
               <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}
            </CardContent>
            <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full m-4" disabled={isLoading}>
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