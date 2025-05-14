import type { Route } from "./+types/home";
import HomePage from "./HomePage";
import DashboardPage from "./DashboardVet";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lety Marketplace" },
    { name: "description", content: "XD" },
  ];
}

export default function Home() {
  return <HomePage />;
}

