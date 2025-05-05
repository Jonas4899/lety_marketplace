import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { PawPrint, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginFormSchema } from "~/zodSchemas/loginFormSchema";
import Cookies from "js-cookie";
//Stores
import { useAuthStore } from "~/stores/useAuthStore";

//Components
import PetOwnerLogin from "~/components/PetOwnerLogin";
import VetLogin from "~/components/VetLogin";
import { StatusDialog } from "~/components/StatusDialog";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

export default function LoginPage() {
  const [userType, setUserType] = useState<"pet-owner" | "vet-clinic">(
    "pet-owner"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const userType = useAuthStore.getState().userType;
      if (userType === "owner") {
        navigate("/dashboard-client");
      } else if (userType === "vet") {
        navigate("/dashboard-vet");
      }
    }
  }, [isAuthenticated, navigate]);

  type LoginFormData = z.infer<typeof loginFormSchema>;

  const ownerForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Configuración del formulario para clínica veterinaria
  const vetForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handlePetOwnerSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    // Función para realizar el intento de conexión
    const attemptConnection = async (retryCount = 0) => {
      try {
        const response = await fetch(`${API_URL}/owner/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Error de inicio de sesión");
        }

        console.log("Datos del usuario:", responseData.user);

        // La cookie httpOnly la envía el backend; no la seteamos manualmente

        //Actualizar el estado de global de autenticacion
        login({
          token: responseData.token,
          userType: "owner",
          user: responseData.user,
          pets: responseData.pets,
        });

        // Redirigir al usuario a la página de inicio
        navigate("/dashboard-client");
      } catch (error) {
        console.error("Error en loginOwner:", error);
        // Si es un error de conexión y no hemos superado los reintentos
        if (
          error instanceof TypeError &&
          error.message.includes("fetch") &&
          retryCount < 1
        ) {
          console.log("Reintentando conexión...");
          // Esperar un breve momento y reintentar
          await new Promise((resolve) => setTimeout(resolve, 500));
          return attemptConnection(retryCount + 1);
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
          setShowErrorDialog(true);
        } else {
          setErrorMessage("Ocurrió un error desconocido al iniciar sesión");
          setShowErrorDialog(true);
        }
      }
    };

    try {
      await attemptConnection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVetSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    // Función para realizar el intento de conexión
    const attemptConnection = async (retryCount = 0) => {
      try {
        const response = await fetch(`${API_URL}/vet/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Error de inicio de sesión");
        }

        console.log("Datos de la veterinaria:", responseData.clinica);

        // La cookie httpOnly la envía el backend; no la seteamos manualmente

        //Actualizar el estado de global de autenticacion
        login({
          token: responseData.token,
          userType: "vet",
          user: responseData.clinica,
          pets: null,
        });

        // Redirigir al usuario a la página de inicio
        navigate("/dashboard-vet");
      } catch (error) {
        console.error("Error en loginVet:", error);
        // Si es un error de conexión y no hemos superado los reintentos
        if (
          error instanceof TypeError &&
          error.message.includes("fetch") &&
          retryCount < 1
        ) {
          console.log("Reintentando conexión...");
          // Esperar un breve momento y reintentar
          await new Promise((resolve) => setTimeout(resolve, 500));
          return attemptConnection(retryCount + 1);
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
          setShowErrorDialog(true);
        } else {
          setErrorMessage("Ocurrió un error desconocido al iniciar sesión");
          setShowErrorDialog(true);
        }
      }
    };

    try {
      await attemptConnection();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[90vh] w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        <Tabs
          defaultValue="pet-owner"
          className="w-full"
          onValueChange={(value) =>
            setUserType(value as "pet-owner" | "vet-clinic")
          }
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
            <PetOwnerLogin
              form={ownerForm}
              onSubmit={handlePetOwnerSubmit}
              isLoading={isLoading}
              error={error && userType === "pet-owner" ? error : null}
            />
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

      {/* Error Dialog */}
      <StatusDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        type="error"
        title="Error de inicio de sesión"
        message={errorMessage}
      />
    </div>
  );
}
