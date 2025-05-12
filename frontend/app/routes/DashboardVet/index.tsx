import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Calendar, DollarSign, Users, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "~/stores/useAuthStore";
import type { Vet } from "~/types/usersTypes";

import ProtectedRoutes from "../../utils/ProtectedRoutes";

// Add types for API data

type Appointment = {
  id: number;
  petName: string;
  time: string;
  ownerName: string;
  date: string;
  status: string;
};

type Stats = {
  totalAppointments: number;
  statusDistribution: { name: string; value: number }[];
  appointmentsByDate: {
    date: string;
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
  }[];
};

type ServicesData = {
  topServices: { name: string; value: number }[];
  servicesRevenue: { name: string; value: number; revenue: number }[];
};

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const clinicaId = (user as Vet)?.id_clinica;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    statusDistribution: [],
    appointmentsByDate: [],
  });
  const [servicesData, setServicesData] = useState<ServicesData>({
    topServices: [],
    servicesRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, aRes, sRes] = await Promise.all([
          fetch("/appointments/clinic", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`/api/analytics/appointments/${clinicaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`/api/analytics/services/${clinicaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);
        setAppointments(cRes.citas);
        setStats(aRes);
        setServicesData(sRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token && clinicaId) fetchData();
  }, [token, clinicaId]);

  const today = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayAppointments = loading
    ? []
    : appointments.filter((a) => a.date === today);

  return (
    <ProtectedRoutes allowedUserTypes={["vet"]}>
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          {/*
            <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
          </TabsList>
             */}

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Citas Totales
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats.totalAppointments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 días
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading
                      ? "..."
                      : `$${servicesData.servicesRevenue
                          .reduce((sum, s) => sum + (s.revenue || 0), 0)
                          .toFixed(2)}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 días
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes Únicos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading
                      ? "..."
                      : new Set(appointments.map((a) => a.ownerName)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 días
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-${todayAppointments.length > 0 ? 2 : 3}">
                <CardHeader>
                  <CardTitle>Citas de Hoy</CardTitle>
                  <CardDescription>
                    Tienes {loading ? "..." : todayAppointments.length} hoy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4"
                      >
                        <div
                          className={`rounded-full p-1 ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {appointment.status === "confirmed" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {appointment.petName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.time} • {appointment.ownerName}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={`/dashboard-vet/appointments/${appointment.id}`}
                          >
                            Ver
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard-vet/appointments">
                        Ver todas las citas
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoutes>
  );
}
