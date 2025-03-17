import { useState } from "react";
import { PawPrintIcon as Paw, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type UserType = "pet-owner" | "vet-clinic" | null;

interface UserTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUserType: (userType: UserType) => void;
}

export function UserTypeModal({
  open,
  onOpenChange,
  onSelectUserType,
}: UserTypeModalProps) {
  const [hoveredType, setHoveredType] = useState<UserType>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            ¿Cómo deseas registrarte?
          </DialogTitle>
          <DialogDescription className="text-center">
            Selecciona el tipo de cuenta que deseas crear
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <button
            className={`flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all hover:border-primary hover:bg-muted/50 ${
              hoveredType === "pet-owner" ? "border-primary bg-muted/50" : ""
            }`}
            onClick={() => onSelectUserType("pet-owner")}
            onMouseEnter={() => setHoveredType("pet-owner")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div className="mb-3 rounded-full bg-primary/10 p-3">
              <Paw className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-1 font-medium">Dueño de mascota</h3>
            <p className="text-sm text-muted-foreground">
              Busca y agenda citas con veterinarios para tu mascota
            </p>
          </button>

          <button
            className={`flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all hover:border-primary hover:bg-muted/50 ${
              hoveredType === "vet-clinic" ? "border-primary bg-muted/50" : ""
            }`}
            onClick={() => onSelectUserType("vet-clinic")}
            onMouseEnter={() => setHoveredType("vet-clinic")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div className="mb-3 rounded-full bg-primary/10 p-3">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-1 font-medium">Clínica veterinaria</h3>
            <p className="text-sm text-muted-foreground">
              Ofrece tus servicios y conecta con dueños de mascotas
            </p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
