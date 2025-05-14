import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { useEffect, useState } from "react"
import { useAuthStore } from "~/stores/useAuthStore";


export default function UserProfile() {

   const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "/placeholder.svg?height=100&width=100",
  });
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = useAuthStore((state) => state.token);
    

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`, // o cookies si lo manejas así
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al obtener el perfil");

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  };

  fetchUser();
}, []);

  return (
    <div className="container mx-auto py-6 px-6">
      <h1 className="text-3xl font-bold mb-2">Perfil del usuario</h1>
      <p className="text-muted-foreground mb-6">Visualiza y actualiza tu información personal</p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Gestiona tu información básica de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Cambiar foto
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" defaultValue={user.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" defaultValue={user.phone} />
            </div>

            <Button className="mt-4">Guardar cambios</Button>
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
}
