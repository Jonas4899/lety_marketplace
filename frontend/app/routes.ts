import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  
  layout("layouts/AuthLayout/index.tsx", [
    route("registrar-clinica", "routes/RegisterVeterinary/BasicVetInfo.tsx"),
    route("registrar-dueño-mascota", "routes/RegisterOwner/index.tsx"),
    route(
      "registro-servicios",
      "routes/RegisterVeterinary/VetServicesForm.tsx"
    ),
    route(
      "registrar-horarios-pagos",
      "routes/RegisterVeterinary/VetSchedulePaymentForm.tsx"
    ),

  ]),
  layout("layouts/DashboardLayoutVet/index.tsx",[
    route("dashboard-vet", "routes/DashboardVet/index.tsx"), // Agregamos la nueva ruta
  ]),
  layout("layouts/DashboardLayoutClient/index.tsx",[
    route("dashboard-client", "routes/DashboardClient/index.tsx"), // Agregamos la nueva ruta
  ]),
] satisfies RouteConfig;
