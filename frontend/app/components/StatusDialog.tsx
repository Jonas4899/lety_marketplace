import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  type: "loading" | "error" | "success";
  title?: string;
  message: string;
}

export const StatusDialog = ({
  open,
  onOpenChange,
  onSuccess,
  type,
  title,
  message,
}: StatusDialogProps) => {
  // Determinar el título basado en el tipo si no se proporciona uno
  const dialogTitle = title || (
    type === "success" 
      ? "¡Operación exitosa!" 
      : type === "error"
        ? "Error"
        : "Procesando"
  );

  // Manejar el cierre del diálogo
  const handleClose = () => {
    onOpenChange(false);
    if (type === "success" && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center w-full">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              type === "success" 
                ? "bg-green-100" 
                : type === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
            }`}>
              {type === "success" ? (
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : type === "error" ? (
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <DialogTitle className="text-center text-xl mb-2">
              {dialogTitle}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-center mb-4">
          {message}
        </DialogDescription>
        
        <DialogFooter className="flex justify-center">
          {type === "loading" ? (
            <Button disabled>Procesando...</Button>
          ) : type === "error" ? (
            <Button onClick={handleClose}>  
              Entendido
            </Button>
          ) : (
            <Button onClick={handleClose}>
              Continuar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};