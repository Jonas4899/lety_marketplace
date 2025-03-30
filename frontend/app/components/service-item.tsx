import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export interface ServiceItemProps {
  id: string;
  name: string;
  price: string;
  category: string;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: string) => void;
}

export function ServiceItem({
  id,
  name,
  price,
  category,
  onRemove,
  onChange,
}: ServiceItemProps) {
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Validar nombre cuando cambia
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("El nombre es requerido");
      return false;
    }
    setNameError(null);
    return true;
  };

  // Validar precio cuando cambia
  const validatePrice = (value: string) => {
    if (!value.trim()) {
      setPriceError("El precio es requerido");
      return false;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setPriceError("Ingrese un precio válido mayor a 0");
      return false;
    }

    setPriceError(null);
    return true;
  };

  // Manejar cambio de nombre con validación
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(id, "name", newValue);
    if (newValue.trim()) {
      validateName(newValue);
    } else {
      setNameError(null); // No mostrar error mientras está vacío (hasta que intente avanzar)
    }
  };

  // Manejar cambio de precio con validación
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(id, "price", newValue);
    if (newValue.trim()) {
      validatePrice(newValue);
    } else {
      setPriceError(null); // No mostrar error mientras está vacío (hasta que intente avanzar)
    }
  };

  // Validar nombre y precio al iniciar el componente si ya tienen valores
  useEffect(() => {
    if (name.trim()) validateName(name);
    if (price.trim()) validatePrice(price);
  }, []);

  return (
    <div className="relative grid grid-cols-12 gap-2 rounded-md border p-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(id)}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="col-span-12 sm:col-span-5">
        <Label htmlFor={`service-name-${id}`} className="text-xs">
          Nombre del servicio
        </Label>
        <Input
          id={`service-name-${id}`}
          value={name}
          onChange={handleNameChange}
          placeholder="Ej: Consulta general"
          className={`mt-1 ${nameError ? "border-red-500" : ""}`}
        />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>

      <div className="col-span-6 sm:col-span-3">
        <Label htmlFor={`service-price-${id}`} className="text-xs">
          Precio (COP)
        </Label>
        <Input
          id={`service-price-${id}`}
          value={price}
          onChange={handlePriceChange}
          placeholder="Ej: 25000"
          className={`mt-1 ${priceError ? "border-red-500" : ""}`}
          type="number"
          min="0"
          step="10"
        />
        {priceError && (
          <p className="text-xs text-red-500 mt-1">{priceError}</p>
        )}
      </div>

      <div className="col-span-6 sm:col-span-4">
        <Label htmlFor={`service-category-${id}`} className="text-xs">
          Categoría
        </Label>
        <Select
          value={category}
          onValueChange={(value) => onChange(id, "category", value)}
        >
          <SelectTrigger id={`service-category-${id}`} className="mt-1">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Consulta General</SelectItem>
            <SelectItem value="emergency">Emergencia</SelectItem>
            <SelectItem value="vaccination">Vacunación</SelectItem>
            <SelectItem value="surgery">Cirugía</SelectItem>
            <SelectItem value="dental">Dental</SelectItem>
            <SelectItem value="grooming">Estética</SelectItem>
            <SelectItem value="laboratory">Laboratorio</SelectItem>
            <SelectItem value="imaging">Imagenología</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
