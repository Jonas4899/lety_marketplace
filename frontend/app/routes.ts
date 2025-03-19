import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  /*
  layout("layouts/AuthLayout/index.tsx", [
    route("registrar-clinica", "routes/RegisterVeterinary/BasicVetInfo.tsx"),
    route("registrar-dueño-mascota", "routes/RegisterOwner/BasicOwnerInfo.tsx"),
    route(
      "registro-servicios",
      "routes/RegisterVeterinary/VetServicesForm.tsx"
    ),
    route(
      "registrar-horarios-pagos",
      "routes/RegisterVeterinary/VetSchedulePaymentForm.tsx"
    ),
  ]),*/
] satisfies RouteConfig;
