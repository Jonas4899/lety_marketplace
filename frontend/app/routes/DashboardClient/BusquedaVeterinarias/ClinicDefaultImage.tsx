import { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";

interface ClinicDefaultImageProps {
  clinicName: string;
  className?: string;
}

export default function ClinicDefaultImage({
  clinicName,
  className = "",
}: ClinicDefaultImageProps) {
  const [bgColor, setBgColor] = useState("#7C3AED"); // Default color (purple)

  // Genera un color basado en el nombre de la clínica (para tener variedad visual)
  useEffect(() => {
    if (!clinicName) return;

    // Función simple para generar un color basado en el texto
    const generateColorFromText = (text: string) => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Seleccionar de una paleta de colores atractivos en lugar de colores aleatorios
      const colors = [
        "#7C3AED", // Violeta
        "#3B82F6", // Azul
        "#10B981", // Verde esmeralda
        "#F59E0B", // Ámbar
        "#EF4444", // Rojo
        "#EC4899", // Rosa
        "#6366F1", // Índigo
        "#8B5CF6", // Púrpura
      ];

      const index = Math.abs(hash) % colors.length;
      return colors[index];
    };

    setBgColor(generateColorFromText(clinicName));
  }, [clinicName]);

  // Abreviar el nombre si es muy largo
  const displayName =
    clinicName.length > 20 ? clinicName.substring(0, 18) + "..." : clinicName;

  // Determinar el tamaño de fuente basado en la longitud del nombre
  const fontSize = clinicName.length > 15 ? "text-xl" : "text-2xl";

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      style={{
        backgroundColor: bgColor,
        width: "100%",
        aspectRatio: "16/10",
        color: "white",
      }}
    >
      <PawPrint className="h-12 w-12 mb-3 opacity-90" />
      <div className={`font-semibold text-center px-4 ${fontSize}`}>
        {displayName}
      </div>
      <div className="text-sm mt-2 opacity-80">Veterinaria</div>
    </div>
  );
}
