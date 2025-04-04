import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/stores/useAuthStore";
import { Link, Navigate, useNavigate } from "react-router";
import { Cookie } from "lucide-react";
import Cookies from "js-cookie";

export default function Unauthorized() {
  const userType = useAuthStore(state => state.userType);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("access_token");
    logout();
    navigate("/");
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-3xl font-bold tracking-tighter">Acceso Denegado</h1>
        <p className="text-muted-foreground">
          No tienes permiso para acceder a esta página. Esta área está restringida a usuarios con permisos específicos.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link to={userType === "owner" ? "/dashboard-client" : "/dashboard-vet"}>
              Ir a mi Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesion
          </Button>
        </div>
      </div>
    </div>
  );
}