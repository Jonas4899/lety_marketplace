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
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface ServiceData {
  name: string;
  value: number;
  revenue: number;
}

interface SatisfactionData {
  date: string;
  overallSatisfaction: number;
  staffRating: number;
  serviceRating: number;
  valueRating: number;
}

interface PeakHourData {
  hour: string;
  appointments: number;
}

interface AgeDistributionData {
  range: string;
  value: number;
}

export function ClinicAnalytics() {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Filter states
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [petTypeFilter, setPetTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);

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

  // Function to refresh data
  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Effect to refresh data when filters change
  useEffect(() => {
    refreshData();
  }, [dateRange, serviceFilter, petTypeFilter]);

  // Generate mock data for appointments over time
  const generateAppointmentsData = (): AppointmentData[] => {
    if (!dateRange?.from || !dateRange.to) return [];

    return eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).map(
      (date) => {
        const total = Math.floor(Math.random() * 20) + 5;
        const completed = Math.floor(total * 0.7);
        const cancelled = Math.floor(total * 0.1);
        const confirmed = total - completed - cancelled;

        return {
          date: format(date, "yyyy-MM-dd"),
          total,
          confirmed,
          cancelled,
          completed,
        };
      }
    );
  };

  // Services data
  const servicesData: ServiceData[] = [
    { name: "Consulta General", value: 120, revenue: 60000 },
    { name: "Vacunación", value: 85, revenue: 29750 },
    { name: "Control de Rutina", value: 65, revenue: 32500 },
    { name: "Limpieza Dental", value: 45, revenue: 36000 },
    { name: "Desparasitación", value: 40, revenue: 12000 },
    { name: "Cirugías", value: 25, revenue: 50000 },
    { name: "Exámenes de Laboratorio", value: 35, revenue: 17500 },
    { name: "Rayos X", value: 20, revenue: 16000 },
  ];

  // Satisfaction data
  const generateSatisfactionData = (): SatisfactionData[] => {
    if (!dateRange?.from || !dateRange.to) return [];

    const interval = Math.max(
      Math.floor(
        eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).length /
          7
      ),
      1
    );
    return eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
      .filter((_, i) => i % interval === 0)
      .map((date) => {
        return {
          date: format(date, "yyyy-MM-dd"),
          overallSatisfaction: 3.5 + Math.random() * 1.5,
          staffRating: 3.8 + Math.random() * 1.2,
          serviceRating: 3.6 + Math.random() * 1.4,
          valueRating: 3.4 + Math.random() * 1.3,
        };
      });
  };

  // Peak hours data
  const peakHoursData: PeakHourData[] = [
    { hour: "8:00", appointments: 3 },
    { hour: "9:00", appointments: 5 },
    { hour: "10:00", appointments: 8 },
    { hour: "11:00", appointments: 12 },
    { hour: "12:00", appointments: 7 },
    { hour: "13:00", appointments: 4 },
    { hour: "14:00", appointments: 3 },
    { hour: "15:00", appointments: 8 },
    { hour: "16:00", appointments: 10 },
    { hour: "17:00", appointments: 6 },
    { hour: "18:00", appointments: 4 },
  ];

  // Pet age distribution data
  const ageDistributionData: AgeDistributionData[] = [
    { range: "< 1 año", value: 15 },
    { range: "1-3 años", value: 30 },
    { range: "4-7 años", value: 25 },
    { range: "8-10 años", value: 20 },
    { range: "> 10 años", value: 10 },
  ];

  // KPI data
  const kpiData = {
    totalAppointments: 345,
    avgDuration: 35, // minutes
    completionRate: 92, // percentage
    satisfactionRate: 4.7, // out of 5
    repeatClients: 78, // percentage
    avgResponseTime: 4.3, // hours
  };

  return (
    <div className="space-y-6">
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

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos los servicios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              <SelectItem value="consultation">Consultas</SelectItem>
              <SelectItem value="vaccination">Vacunación</SelectItem>
              <SelectItem value="surgery">Cirugías</SelectItem>
              <SelectItem value="grooming">Peluquería</SelectItem>
            </SelectContent>
          </Select>

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

      {/* KPI summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-primary h-1 w-3/4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Duración Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgDuration} min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">↓3%</span> respecto al
              periodo anterior
            </p>
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-blue-500 h-1 w-2/3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfacción del Cliente
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.satisfactionRate}/5
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑0.2</span> respecto
              al periodo anterior
            </p>
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-yellow-500 h-1 w-[94%]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Finalización
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑4%</span> respecto
              al periodo anterior
            </p>
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-green-500 h-1 w-[92%]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Recurrentes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.repeatClients}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">↑8%</span> respecto
              al periodo anterior
            </p>
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-purple-500 h-1 w-[78%]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo de Respuesta
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">↑0.3h</span> respecto
              al periodo anterior
            </p>
            <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded">
              <div className="bg-orange-500 h-1 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analytics */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfacción</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
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
                      data={generateAppointmentsData()}
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
                          Math.floor(generateAppointmentsData().length / 10),
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
                        data={[
                          { name: "Completadas", value: 65 },
                          { name: "Programadas", value: 25 },
                          { name: "Canceladas", value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={1}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#8884d8" />
                        <Cell fill="#ff8042" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-center text-sm text-muted-foreground">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-[#82ca9d]" />
                      <span>Completadas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-[#8884d8]" />
                      <span>Programadas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-[#ff8042]" />
                      <span>Canceladas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horas Pico</CardTitle>
                <CardDescription>
                  Distribución de citas por hora del día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} citas`,
                          "Cantidad",
                        ]}
                      />
                      <Bar dataKey="appointments" fill="#8884d8" name="Citas">
                        {peakHoursData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`#${Math.floor(
                              Math.random() * 16777215
                            ).toString(16)}`}
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

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
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

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Evolución de Servicios</CardTitle>
                <CardDescription>
                  Tendencia de servicios prestados en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        {
                          month: "Ene",
                          "Consulta General": 35,
                          Vacunación: 28,
                          "Limpieza Dental": 18,
                          Desparasitación: 12,
                        },
                        {
                          month: "Feb",
                          "Consulta General": 32,
                          Vacunación: 24,
                          "Limpieza Dental": 16,
                          Desparasitación: 15,
                        },
                        {
                          month: "Mar",
                          "Consulta General": 30,
                          Vacunación: 26,
                          "Limpieza Dental": 20,
                          Desparasitación: 18,
                        },
                        {
                          month: "Abr",
                          "Consulta General": 40,
                          Vacunación: 32,
                          "Limpieza Dental": 22,
                          Desparasitación: 20,
                        },
                        {
                          month: "May",
                          "Consulta General": 38,
                          Vacunación: 30,
                          "Limpieza Dental": 24,
                          Desparasitación: 22,
                        },
                        {
                          month: "Jun",
                          "Consulta General": 42,
                          Vacunación: 34,
                          "Limpieza Dental": 25,
                          Desparasitación: 18,
                        },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Consulta General"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Vacunación"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Limpieza Dental"
                        stroke="#ffc658"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Desparasitación"
                        stroke="#ff8042"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Evolución de la Satisfacción del Cliente</CardTitle>
                <CardDescription>
                  Calificaciones promedio a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateSatisfactionData()}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return format(d, "dd/MM");
                        }}
                        interval={Math.max(
                          Math.floor(generateSatisfactionData().length / 6),
                          1
                        )}
                      />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                      <Tooltip
                        formatter={(value: number) => [value.toFixed(1), ""]}
                        labelFormatter={(label) =>
                          format(new Date(label), "PPP", { locale: es })
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="overallSatisfaction"
                        stroke="#8884d8"
                        name="Satisfacción General"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="staffRating"
                        stroke="#82ca9d"
                        name="Personal"
                      />
                      <Line
                        type="monotone"
                        dataKey="serviceRating"
                        stroke="#ffc658"
                        name="Servicio"
                      />
                      <Line
                        type="monotone"
                        dataKey="valueRating"
                        stroke="#ff8042"
                        name="Relación Precio-Calidad"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
                    <BarChart
                      data={[
                        { rating: "1 ★", count: 5 },
                        { rating: "2 ★", count: 12 },
                        { rating: "3 ★", count: 28 },
                        { rating: "4 ★", count: 85 },
                        { rating: "5 ★", count: 120 },
                      ]}
                    >
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

            <Card>
              <CardHeader>
                <CardTitle>Temas de Comentarios</CardTitle>
                <CardDescription>
                  Análisis de temas recurrentes en comentarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Atención del personal", value: 40 },
                          { name: "Calidad del servicio", value: 30 },
                          { name: "Tiempos de espera", value: 15 },
                          { name: "Instalaciones", value: 10 },
                          { name: "Precios", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${
                            name.length > 10
                              ? name.substring(0, 8) + "..."
                              : name
                          } ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4">
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
                        data={[
                          { name: "Perros", value: 65 },
                          { name: "Gatos", value: 25 },
                          { name: "Aves", value: 5 },
                          { name: "Exóticos", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ffc658" />
                        <Cell fill="#ff8042" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
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
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      <Bar dataKey="value" fill="#8884d8" name="Porcentaje">
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

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Distribución Geográfica de Clientes</CardTitle>
                <CardDescription>
                  Zonas de donde provienen los clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { zone: "Centro", clients: 120 },
                        { zone: "Norte", clients: 85 },
                        { zone: "Sur", clients: 65 },
                        { zone: "Este", clients: 45 },
                        { zone: "Oeste", clients: 40 },
                        { zone: "Otras áreas", clients: 25 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} clientes`, ""]}
                      />
                      <Bar dataKey="clients" fill="#8884d8" name="Clientes">
                        {[...Array(6)].map((_, index) => (
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
