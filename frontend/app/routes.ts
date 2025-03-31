import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/DashboardLayoutVet/index.tsx", [
    route("dashboard-vet", "routes/DashboardVet/index.tsx"), // Agregamos la nueva ruta
    route("dashboard/analytics", "routes/DashboardVet/analytics.tsx"), // Ruta para analytics
  ]),
  layout("layouts/DashboardLayoutClient/index.tsx", [
    route("dashboard-client", "routes/DashboardClient/index.tsx"), // Agregamos la nueva ruta
  ]),
] satisfies RouteConfig;
