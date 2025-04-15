import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/DashboardLayoutVet/index.tsx",[
    route("dashboard-vet", "routes/DashboardVet/index.tsx"), // Agregamos la nueva ruta
    route("dashboard/analytics", "routes/DashboardVet/analytics.tsx"), // Ruta para analytics
  ]),
  layout("layouts/DashboardLayoutClient/index.tsx", [
    route("dashboard-client", "routes/DashboardClient/index.tsx"), // Agregamos la nueva ruta
    route("dashboard-client/appointments", "routes/DashboardClient/Citas/appointments.tsx"),
    route("dashboard-client/appointments/schedule", "routes/DashboardClient/Citas/Agendar/client-schedule.tsx"),
  ]),
  route("login", "routes/LoginPage/index.tsx"),
  route("unauthorized", "routes/Unauthorized/index.tsx"),
] satisfies RouteConfig;
