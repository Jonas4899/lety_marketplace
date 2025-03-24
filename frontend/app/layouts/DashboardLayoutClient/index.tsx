import type React from "react"

import { useState, useEffect } from "react"
import {Link} from "react-router"
import { usePathname, useRouter } from "next/navigation"
import { Outlet , useNavigate} from "react-router"
import {
  PawPrint,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Calendar,
  MessageSquare,
  BookOpen,
  Search,
  Bell,
  Heart,
  Clipboard,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
//import { useAuth } from "@/context/auth-context"

interface SidebarNavProps {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export default function PetDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useNavigate()
  //const { user, logout, isAuthenticated } = useAuth()
/*
  useEffect(() => {
    setIsClient(true)

    // Check if the user is authenticated and is a pet owner
    if (isClient && (!isAuthenticated || user?.type !== "pet-owner")) {
      router.push("/login")
    }
  }, [router, isAuthenticated, user, isClient])

  // Don't render anything on the server or if not authenticated yet
  if (!isClient || !isAuthenticated || user?.type !== "pet-owner") {
    return null
  }*/

  const navItems = [
    {
      title: "Inicio",
      href: "/dashboard-client",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Mis Mascotas",
      href: "/pet-dashboard/pets",
      icon: <PawPrint className="h-4 w-4" />,
    },
    {
      title: "Citas",
      href: "/pet-dashboard/appointments",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Mensajes",
      href: "/pet-dashboard/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "Historial Médico",
      href: "/pet-dashboard/medical-records",
      icon: <Clipboard className="h-4 w-4" />,
    },
    {
      title: "Veterinarias",
      href: "/pet-dashboard/clinics",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Recursos",
      href: "/pet-dashboard/resources",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Favoritos",
      href: "/pet-dashboard/favorites",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      title: "Configuración",
      href: "/pet-dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-2">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <PawPrint className="h-6 w-6" />
                  <span>PETVET MARKETPLACE</span>
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileNavOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close navigation menu</span>
                </Button>
              </div>
              <div className="flex-1 overflow-auto py-4">
                <SidebarNav items={navItems} />
              </div>
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    //logout()
                    router("/")
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex items-center gap-2 font-semibold md:hidden">
          <PawPrint className="h-6 w-6" />
          <span>PETVET</span>
        </Link>
        <Link to="/" className="hidden items-center gap-2 font-semibold md:flex">
          <PawPrint className="h-6 w-6" />
          <span>PETVET MARKETPLACE</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>
          <div className="flex items-center gap-2">
            {/*<Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>*/}
            <div className="hidden md:block">
              {/*<p className="text-sm font-medium">{user?.name}</p>*/}
              <p className="text-xs text-muted-foreground">Dueño de Mascota</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <div className="sticky top-16 overflow-auto p-4 h-[calc(100vh-4rem)]">
            <SidebarNav items={navItems} />
            <div className="mt-6 border-t pt-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  //logout()
                  router("/")
                }}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}
            <Outlet />
        </main>
      </div>
    </div>
  )
}

