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
          onChange={(e) => onChange(id, "name", e.target.value)}
          placeholder="Ej: Consulta general"
          className="mt-1"
        />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <Label htmlFor={`service-price-${id}`} className="text-xs">
          Precio (COP)
        </Label>
        <Input
          id={`service-price-${id}`}
          value={price}
          onChange={(e) => onChange(id, "price", e.target.value)}
          placeholder="Ej: 25000"
          className="mt-1"
          type="number"
          min="0"
          step="10"
        />
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
