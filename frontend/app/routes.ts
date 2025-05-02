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
    route("dashboard-client", "routes/DashboardClient/index.tsx"), // Agregamos la nueva ruta
    route("dashboard-client/appointments", "routes/DashboardClient/Citas/appointments.tsx"),
    route("dashboard-client/appointments/schedule", "routes/DashboardClient/Citas/Agendar/client-schedule.tsx"),
    route("dashboard-client/appointments/:id", "routes/DashboardClient/Citas/ID_citas/id-schedule.tsx"),
    route("dashboard-client/pets", "routes/DashboardClient/pets.tsx"),
    route("dashboard-client/pets/:id", "components/ui/pet-details.tsx"),
  ]),
  route("login", "routes/LoginPage/index.tsx"),
  route("unauthorized", "routes/Unauthorized/index.tsx"),
] satisfies RouteConfig;
