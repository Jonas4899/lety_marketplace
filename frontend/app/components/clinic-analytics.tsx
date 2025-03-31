import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar,
  Clock,
  Star,
  Users,
  Layers,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarComponent } from "~/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

// Charts color palette
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

// Chart data types
interface AppointmentData {
  date: string;
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
}

interface ServiceData {
  name: string;
  value: number;
  revenue: number;
}

interface PetData {
  type: string;
  count: number;
}

interface AgeData {
  range: string;
  count: number;
}

interface RatingData {
  rating: string;
  count: number;
}

// API response types
interface SummaryResponse {
  totalAppointments: number;
  avgRating: number;
  totalRevenue: number;
  totalPets: number;
}

interface AppointmentsResponse {
  totalAppointments: number;
  statusDistribution: Array<{ name: string; value: number }>;
  appointmentsByDate: AppointmentData[];
}

interface ServicesResponse {
  topServices: Array<{ name: string; value: number }>;
  servicesRevenue: ServiceData[];
}

interface DemographicsResponse {
  petTypeDistribution: PetData[];
  ageDistribution: AgeData[];
}

interface RatingsResponse {
  averageRating: number;
  ratingDistribution: RatingData[];
}

// Constants
const CLINIC_ID = 1; // Hardcoded clinic ID as mentioned

// Mock data generation functions (for fallback)
const generateMockAppointmentsData = (
  from: Date,
  to: Date
): AppointmentData[] => {
  return eachDayOfInterval({ start: from, end: to }).map((date) => {
    const total = Math.floor(Math.random() * 20) + 5;
    const completed = Math.floor(total * 0.7);
    const scheduled = Math.floor(total * 0.2);
    const cancelled = total - completed - scheduled;

    return {
      date: format(date, "yyyy-MM-dd"),
      total,
      completed,
      scheduled,
      cancelled,
    };
  });
};

const generateMockStatusDistribution = () => [
  { name: "Completadas", value: 65 },
  { name: "Programadas", value: 25 },
  { name: "Canceladas", value: 10 },
];

const generateMockServicesData = (): ServiceData[] => [
  { name: "Consulta General", value: 120, revenue: 60000 },
  { name: "Vacunación", value: 85, revenue: 29750 },
  { name: "Control de Rutina", value: 65, revenue: 32500 },
  { name: "Limpieza Dental", value: 45, revenue: 36000 },
  { name: "Desparasitación", value: 40, revenue: 12000 },
];

const generateMockPetTypeData = (): PetData[] => [
  { type: "Perros", count: 65 },
  { type: "Gatos", count: 25 },
  { type: "Aves", count: 5 },
  { type: "Exóticos", count: 5 },
];

const generateMockAgeDistributionData = (): AgeData[] => [
  { range: "< 1 año", count: 15 },
  { range: "1-3 años", count: 30 },
  { range: "4-7 años", count: 25 },
  { range: "8-10 años", count: 20 },
  { range: "> 10 años", count: 10 },
];

const generateMockRatingData = (): RatingData[] => [
  { rating: "1 ★", count: 5 },
  { rating: "2 ★", count: 12 },
  { rating: "3 ★", count: 28 },
  { rating: "4 ★", count: 85 },
  { rating: "5 ★", count: 120 },
];

const generateMockKpiData = () => ({
  totalAppointments: 345,
  avgRating: 4.2,
  totalRevenue: 225250,
  totalPets: 250,
});

export function ClinicAnalytics() {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Filter states
  const [petTypeFilter, setPetTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  // Data states
  const [kpiData, setKpiData] = useState({
    totalAppointments: 0,
    avgRating: 0,
    totalRevenue: 0,
    totalPets: 0,
  });
  const [appointmentsData, setAppointmentsData] = useState<AppointmentData[]>(
    []
  );
  const [statusDistribution, setStatusDistribution] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [petTypeData, setPetTypeData] = useState<PetData[]>([]);
  const [ageDistributionData, setAgeDistributionData] = useState<AgeData[]>([]);
  const [ratingData, setRatingData] = useState<RatingData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) return "Seleccionar rango";
    if (!dateRange.to)
      return `Desde ${format(dateRange.from, "PPP", { locale: es })}`;
    return `${format(dateRange.from, "PPP", { locale: es })} - ${format(
      dateRange.to,
      "PPP",
      { locale: es }
    )}`;
  };

  // Function to format date for API
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Fecha de rango inválida");
      }

      const fromDate = formatDateForApi(dateRange.from);
      const toDate = formatDateForApi(dateRange.to);
      // Use the full backend URL instead of relative paths
      const baseUrl = "http://localhost:3001";

      try {
        // Fetch all data in parallel
        const [
          summaryRes,
          appointmentsRes,
          servicesRes,
          demographicsRes,
          ratingsRes,
        ] = await Promise.all([
          fetch(
            `${baseUrl}/api/analytics/summary/${CLINIC_ID}?from_date=${fromDate}&to_date=${toDate}`
          ),
          fetch(
            `${baseUrl}/api/analytics/appointments/${CLINIC_ID}?from_date=${fromDate}&to_date=${toDate}`
          ),
          fetch(
            `${baseUrl}/api/analytics/services/${CLINIC_ID}?from_date=${fromDate}&to_date=${toDate}`
          ),
          fetch(
            `${baseUrl}/api/analytics/demographics/${CLINIC_ID}?from_date=${fromDate}&to_date=${toDate}`
          ),
          fetch(
            `${baseUrl}/api/analytics/ratings/${CLINIC_ID}?from_date=${fromDate}&to_date=${toDate}`
          ),
        ]);

        // Process summary data
        if (summaryRes.ok) {
          const summaryData: SummaryResponse = await summaryRes.json();
          setKpiData(summaryData);
        } else {
          console.error(
            "Error fetching summary data:",
            await summaryRes.text()
          );
          // Fallback to mock data
          setKpiData(generateMockKpiData());
          setUsingMockData(true);
        }

        // Process appointments data
        if (appointmentsRes.ok) {
          const appointmentsData: AppointmentsResponse =
            await appointmentsRes.json();
          setAppointmentsData(appointmentsData.appointmentsByDate);
          setStatusDistribution(appointmentsData.statusDistribution);
        } else {
          console.error(
            "Error fetching appointments data:",
            await appointmentsRes.text()
          );
          // Fallback to mock data
          setAppointmentsData(
            generateMockAppointmentsData(dateRange.from, dateRange.to)
          );
          setStatusDistribution(generateMockStatusDistribution());
          setUsingMockData(true);
        }

        // Process services data
        if (servicesRes.ok) {
          const servicesData: ServicesResponse = await servicesRes.json();
          setServicesData(servicesData.servicesRevenue);
        } else {
          console.error(
            "Error fetching services data:",
            await servicesRes.text()
          );
          // Fallback to mock data
          setServicesData(generateMockServicesData());
          setUsingMockData(true);
        }

        // Process demographics data
        if (demographicsRes.ok) {
          const demographicsData: DemographicsResponse =
            await demographicsRes.json();
          setPetTypeData(demographicsData.petTypeDistribution);
          setAgeDistributionData(demographicsData.ageDistribution);
        } else {
          console.error(
            "Error fetching demographics data:",
            await demographicsRes.text()
          );
          // Fallback to mock data
          setPetTypeData(generateMockPetTypeData());
          setAgeDistributionData(generateMockAgeDistributionData());
          setUsingMockData(true);
        }

        // Process ratings data
        if (ratingsRes.ok) {
          const ratingsData: RatingsResponse = await ratingsRes.json();
          setRatingData(ratingsData.ratingDistribution);
        } else {
          console.error(
            "Error fetching ratings data:",
            await ratingsRes.text()
          );
          // Fallback to mock data
          setRatingData(generateMockRatingData());
          setUsingMockData(true);
        }
      } catch (apiError) {
        console.error("API connection error:", apiError);
        // Fall back to all mock data
        setKpiData(generateMockKpiData());
        setAppointmentsData(
          generateMockAppointmentsData(dateRange.from, dateRange.to)
        );
        setStatusDistribution(generateMockStatusDistribution());
        setServicesData(generateMockServicesData());
        setPetTypeData(generateMockPetTypeData());
        setAgeDistributionData(generateMockAgeDistributionData());
        setRatingData(generateMockRatingData());
        setError(
          "Error de conexión con el servidor. Mostrando datos de ejemplo."
        );
        setUsingMockData(true);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al obtener datos"
      );
    } finally {
      setLoading(false);
    }
  };

  // Effect to refresh data when filters change
  useEffect(() => {
    fetchData();
  }, [dateRange, petTypeFilter]);

  // Function to refresh data
  const refreshData = () => {
    fetchData();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Análisis y Estadísticas</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formatDateRange()}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <Select value={petTypeFilter} onValueChange={setPetTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las mascotas</SelectItem>
              <SelectItem value="dog">Perros</SelectItem>
              <SelectItem value="cat">Gatos</SelectItem>
              <SelectItem value="bird">Aves</SelectItem>
              <SelectItem value="exotic">Exóticos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="icon"
            variant="outline"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Mock data alert */}
      {usingMockData && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">
            Mostrando datos de ejemplo. La conexión con el servidor no está
            disponible.
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* KPI summary cards */}
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.totalAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑12%</span> respecto
              al periodo anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Calificación Promedio
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgRating}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑0.2</span> respecto
              al periodo anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpiData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑8%</span> respecto
              al periodo anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Mascotas Atendidas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalPets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑5%</span> respecto
              al periodo anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analytics */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
          <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent
          value="appointments"
          className={`space-y-4 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Tendencia de Citas</CardTitle>
                <CardDescription>
                  Volumen de citas a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={appointmentsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorCompleted"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#82ca9d"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#82ca9d"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return format(d, "dd/MM");
                        }}
                        interval={Math.max(
                          Math.floor(appointmentsData.length / 10),
                          1
                        )}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value: number) => [value, ""]}
                        labelFormatter={(label) =>
                          format(new Date(label), "PPP", { locale: es })
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        name="Total de Citas"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                        name="Citas Completadas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
                <CardDescription>Estado actual de las citas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={1}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#8884d8" />
                        <Cell fill="#ff8042" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent
          value="services"
          className={`space-y-4 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Más Solicitados</CardTitle>
                <CardDescription>
                  Distribución de citas por tipo de servicio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          name.length > 12
                            ? `${name.slice(0, 10)}... ${(
                                percent * 100
                              ).toFixed(0)}%`
                            : `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine
                      >
                        {servicesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} citas`,
                          props.payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Servicio</CardTitle>
                <CardDescription>
                  Contribución de cada servicio a los ingresos totales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={servicesData
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)}
                      margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Ingresos"]}
                      />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Ingresos">
                        {servicesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent
          value="demographics"
          className={`space-y-4 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Mascota</CardTitle>
                <CardDescription>Tipos de mascotas atendidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={petTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="type"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {petTypeData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} mascotas`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad de Mascota</CardTitle>
                <CardDescription>
                  Rango de edades de las mascotas atendidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} mascotas`, ""]}
                      />
                      <Bar dataKey="count" fill="#8884d8" name="Cantidad">
                        {ageDistributionData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent
          value="ratings"
          className={`space-y-4 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones</CardTitle>
                <CardDescription>
                  Frecuencia de cada calificación recibida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} reseñas`, ""]}
                      />
                      <Bar dataKey="count" name="Cantidad">
                        <Cell fill="#f44336" />
                        <Cell fill="#ff9800" />
                        <Cell fill="#ffc107" />
                        <Cell fill="#8bc34a" />
                        <Cell fill="#4caf50" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export options */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
