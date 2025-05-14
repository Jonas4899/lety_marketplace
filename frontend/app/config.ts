interface Config {
  GOOGLE_MAPS_API_KEY: string;
  API_BASE_URL: string;
}

// Las variables de entorno deben comenzar con VITE_ para ser accesibles en el cliente
const config: Config = {
  GOOGLE_MAPS_API_KEY:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
};

export default config;
