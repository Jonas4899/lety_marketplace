import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/DashboardLayoutVet/index.tsx", [
    route("dashboard-vet", "routes/DashboardVet/index.tsx"),
    route("dashboard-vet/photos", "routes/DashboardVet/PhotosVet/index.tsx"),
    route(
      "dashboard-vet/analytics",
      "routes/DashboardVet/VetAnalytics/index.tsx"
    ), // Ruta para analytics
    route(
      "dashboard-vet/general-information",
      "routes/DashboardVet/GeneralInformation/index.tsx"
    ),
    route(
      "dashboard-vet/services",
      "routes/DashboardVet/ServicesVet/index.tsx"
    ), // Ruta para general information
  ]),
  layout("layouts/DashboardLayoutClient/index.tsx", [
    route("dashboard-client", "routes/DashboardClient/index.tsx"),
    route(
      "dashboard-client/vet-search",
      "routes/DashboardClient/BusquedaVeterinarias/index.tsx"
    ),
  ]),
  route("login", "routes/LoginPage/index.tsx"),
  route("unauthorized", "routes/Unauthorized/index.tsx"),
] satisfies RouteConfig;
