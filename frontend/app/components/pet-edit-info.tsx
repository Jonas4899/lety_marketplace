import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { PawPrint as Paw } from 'lucide-react';
import type { Pet as PetType, Owner } from '~/types/usersTypes'; // Import Owner type
import { useAuthStore } from '~/stores/useAuthStore';

// Reuse breed lists (consider extracting these to a shared file)
const dogBreeds = [
    "Criollo (Sin raza)", "affenpinscher", "africano", "airedale terrier", "akita", "appenzeller", "kelpie australiano", "pastor australiano", "bakharwal indio", "basenji", "beagle", "bluetick", "borzoi", "bouvier", "boxer", "brabanzón", "briard", "buhund noruego", "bulldog de Boston", "bulldog inglés", "bulldog francés", "bullterrier de Staffordshire", "perro boyero australiano", "cavapoo", "chihuahua", "chippiparai indio", "chow chow", "clumber spaniel", "cockapoo", "collie border", "coonhound", "corgi galés de Cardigan", "coton de Tulear", "dachshund (teckel)", "dálmata", "gran danés", "perro danés-sueco", "lebrel escocés", "dhole", "dingo", "dóberman", "elkhound noruego", "entlebucher", "perro esquimal americano", "perro lapphund finlandés", "bichón frisé", "gaddi indio", "pastor alemán", "galgo indio", "galgo italiano", "groenendael", "habanero", "lebrel afgano", "basset hound", "bloodhound", "fresh puddle", "foxhound inglés", "podenco ibicenco", "plott hound", "coonhound de Walker", "husky siberiano", "keeshond", "kelpie", "kombai", "komondor", "kuvasz", "labradoodle", "labrador", "labrador retriever", "leonberger", "lhasa apso", "malamute de Alaska", "pastor belga malinois", "maltés", "bullmastiff", "mastín inglés", "mastín indio", "mastín tibetano", "perro sin pelo mexicano", "mestizo", "boyero de Berna", "boyero suizo", "mudhol indio", "terranova", "otterhound", "caucásico ovcharka", "papillón", "perro paria indio", "pequinés", "pembroke corgi galés", "pinscher miniatura", "pitbull", "braco alemán", "braco alemán de pelo largo", "pomerania", "caniche mediano", "caniche miniatura", "caniche estándar", "caniche toy", "pug", "puggle", "montaña de los Pirineos", "rajapalayam indio", "redbone coonhound", "retriever de Chesapeake", "retriever de pelo rizado", "retriever de pelo liso", "golden retriever", "perro crestado rodesiano", "rottweiler", "saluki", "samoyedo", "schipperke", "schnauzer gigante", "schnauzer miniatura", "segugio italiano", "setter inglés", "setter Gordon", "setter irlandés", "shar pei", "perro ovejero inglés", "perro ovejero indio", "shetland sheepdog", "shiba inu", "shih tzu", "spaniel Blenheim", "spaniel bretón", "cocker spaniel", "spaniel irlandés", "spaniel japonés", "spaniel de Sussex", "spaniel galés", "spitz indio", "spitz japonés", "springer spaniel inglés", "san Bernardo", "terrier americano", "terrier australiano", "terrier bedlington", "terrier border", "terrier cairn", "terrier dandie dinmont", "fox terrier", "terrier irlandés", "terrier azul de Kerry", "terrier lakeland", "terrier norfolk", "terrier norwich", "terrier patterdale", "terrier russell", "terrier escocés", "terrier sealyham", "terrier sedoso", "terrier tibetano", "terrier toy", "terrier galés", "terrier west highland", "terrier wheaten", "terrier yorkshire", "pastor belga tervuren", "vizsla", "perro de agua español", "weimaraner", "whippet", "lobero irlandés"
];
const catBreeds = [
    "Criollo (Sin raza)", "abisinio", "americano de pelo corto", "americano de pelo rizado", "american bobtail", "american curl", "angora turco", "asiático", "balinés", "bengalí", "birmano", "bombay", "bosque de noruega", "británico de pelo corto", "británico de pelo largo", "burmilla", "californiano brillante", "cartujo", "ceilanés", "chantilly-tiffany", "colorpoint de pelo corto", "cornish rex", "cymric", "devon rex", "don sphynx", "europeo de pelo corto", "fold escocés", "gato egipcio", "gato exótico", "gato hawaiano", "havana brown", "himalayo", "japonés bobtail", "javanés", "khao manee", "korat", "kurilian bobtail", "laPerm", "maine coon", "manx", "mau egipcio", "munchkin", "nebelung", "ocicat", "oriental de pelo corto", "oriental de pelo largo", "persa", "peterbald", "pixie-bob", "ragamuffin", "ragdoll", "ruso azul", "sagrado de birmania", "savannah", "selkirk rex", "serengeti", "siberiano", "siamés", "singapura", "snowshoe", "somalí", "sphynx", "thai", "tonkinés", "toyger", "turkish van", "york chocolate"
];


// Schema for pet editing
const petEditSchema = z.object({
  petName: z.string().min(1, "El nombre es requerido"),
  petAge: z.number().min(0, "La edad debe ser un número positivo").max(50, "Edad máxima 50 años"),
  petSpecies: z.string().min(1, "La especie es requerida"),
  petBreed: z.string().min(1, "La raza es requerida"),
  petGender: z.string().min(1, "El género es requerido"),
  petWeight: z.number().min(0.1, "El peso debe ser mayor a 0").max(150, "Peso máximo 150kg"),
  // Files are handled separately, not in schema for validation here
});

type PetEditFormData = z.infer<typeof petEditSchema>;

interface PetEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petToEdit: PetType | null;
  onSuccess: () => void; // Callback after successful update
}

export function PetEditDialog({
  open,
  onOpenChange,
  petToEdit,
  onSuccess,
}: PetEditDialogProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const id_usuario = userType === 'owner' && user ? (user as Owner).id_usuario : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [petFiles, setPetFiles] = useState({
    historial: null as File | null, // Changed to match backend field name
    foto: null as File | null,      // Changed to match backend field name
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<PetEditFormData>({
    resolver: zodResolver(petEditSchema),
    mode: 'onTouched',
  });

  const petSpeciesValue = watch('petSpecies');
  const petBreedValue = watch('petBreed');
  const petGenderValue = watch('petGender');

  // Populate form when petToEdit changes or dialog opens
  useEffect(() => {
    if (petToEdit && open) {
      reset({
        petName: petToEdit.nombre,
        petAge: petToEdit.edad,
        petSpecies: petToEdit.especie.toString().toLowerCase(), // Match select values
        petBreed: petToEdit.raza.toString(),
        petGender: petToEdit.genero.toString(),
        petWeight: petToEdit.peso,
      });
      // Reset file inputs
      setPetFiles({ historial: null, foto: null });
      // Clear file input elements visually
       const historyInput = document.getElementById('editPetHistory') as HTMLInputElement | null;
       if (historyInput) historyInput.value = '';
       const photoInput = document.getElementById('editPetPhoto') as HTMLInputElement | null;
       if (photoInput) photoInput.value = '';

    } else if (!open) {
        // Optionally reset form when dialog closes to prevent stale data flicker
        reset();
        setPetFiles({ historial: null, foto: null });
    }
  }, [petToEdit, open, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.name) return;
    const file = e.target.files[0];
    // Map input name to state key based on backend expected field names
    const name = e.target.name === 'editPetHistory' ? 'historial' : 'foto';
    setPetFiles(prev => ({ ...prev, [name]: file }));
  };

  const onSubmit = async (data: PetEditFormData) => {
    if (!petToEdit || !id_usuario) {
        toast.error("Error", { description: "No se puede identificar la mascota o el usuario." });
        return;
    }

    setIsLoading(true);
    const token = Cookies.get('auth_token');

    if (!token) {
        toast.error("Error de autenticación", { description: "Por favor, inicia sesión de nuevo." });
        setIsLoading(false);
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('petName', data.petName);
    formData.append('petAge', data.petAge.toString());
    formData.append('petSpecies', data.petSpecies);
    formData.append('petBreed', data.petBreed);
    formData.append('petGender', data.petGender);
    formData.append('petWeight', data.petWeight.toString());

    // Append files if they exist
    if (petFiles.foto) {
        formData.append('foto', petFiles.foto);
    }
    if (petFiles.historial) {
        formData.append('historial', petFiles.historial);
    }

     console.log("Sending update data:", Object.fromEntries(formData.entries())); // Log form data before sending


    try {
        const response = await fetch(`${API_URL}/pets/update?id_usuario=${id_usuario}&id_mascota=${petToEdit.id_mascota}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                // DO NOT set 'Content-Type': 'multipart/form-data',
                // Fetch API sets it automatically with the correct boundary when body is FormData
            },
            body: formData,
        });

        if (!response.ok) {
            let errorData;
            try {
                 errorData = await response.json();
            } catch (e) {
                 errorData = { message: `Error ${response.status}: ${response.statusText}` };
            }
            console.error("Update error response:", errorData);
            throw new Error(errorData.message || 'Error al actualizar la mascota.');
        }

        const result = await response.json();
        console.log("Update successful:", result);

        toast.success("Mascota actualizada", {
           description: `${result.mascota.nombre} ha sido actualizado correctamente.`
        });
        onSuccess(); // Call the success handler passed from parent
        onOpenChange(false); // Close the dialog

    } catch (error) {
        console.error("Error updating pet:", error);
        toast.error("Error al actualizar", {
            description: error instanceof Error ? error.message : "No se pudo actualizar la información de la mascota."
        });
    } finally {
        setIsLoading(false);
    }
  };

  // Close dialog function
  const handleClose = () => {
      if (!isLoading) { // Prevent closing while loading
        onOpenChange(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[525px]">
        <DialogHeader>
           <div className="flex flex-col items-center justify-center w-full">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Paw className="h-6 w-6 text-primary" />
              </div>
               <DialogTitle>Editar Información de {petToEdit?.nombre || 'Mascota'}</DialogTitle>
               <DialogDescription>
                Actualiza los detalles de tu mascota.
               </DialogDescription>
            </div>
        </DialogHeader>

        {petToEdit && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="editPetName">Nombre</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editPetName"
                    className="pl-9"
                    {...register('petName')}
                  />
                </div>
                {errors.petName && (<p className="text-sm text-red-500">{errors.petName.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetAge">Edad</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editPetAge"
                    className="pl-9"
                    type="number"
                    min={0}
                    max={50}
                    {...register('petAge', { valueAsNumber: true })}
                  />
                </div>
                {errors.petAge && (<p className="text-sm text-red-500">{errors.petAge.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetSpecies">Especie</Label>
                <Select
                    name="petSpecies"
                    value={petSpeciesValue}
                    onValueChange={(value) => setValue('petSpecies', value, { shouldValidate: true, shouldDirty: true })}
                >
                    <SelectTrigger id="editPetSpecies">
                    <SelectValue placeholder="Selecciona especie" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="canino">Canino</SelectItem>
                    <SelectItem value="felino">Felino</SelectItem>
                    </SelectContent>
                </Select>
                {errors.petSpecies && (<p className="text-sm text-red-500 mt-1.5">{errors.petSpecies.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetBreed">Raza</Label>
                <Select
                    name="petBreed"
                    value={petBreedValue}
                    onValueChange={(value) => setValue('petBreed', value, { shouldValidate: true, shouldDirty: true })}
                    disabled={!petSpeciesValue}
                 >
                    <SelectTrigger id="editPetBreed">
                    <SelectValue placeholder="Selecciona raza" />
                    </SelectTrigger>
                    <SelectContent>
                    {petSpeciesValue === "canino" && dogBreeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                    {petSpeciesValue === "felino" && catBreeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                     {!petSpeciesValue && <SelectItem value="" disabled>Selecciona una especie primero</SelectItem>}
                    </SelectContent>
                </Select>
                {errors.petBreed && (<p className="text-sm text-red-500 mt-1.5">{errors.petBreed.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetGender">Género</Label>
                <Select
                    name="petGender"
                    value={petGenderValue}
                    onValueChange={(value) => setValue('petGender', value, { shouldValidate: true, shouldDirty: true })}
                >
                    <SelectTrigger id="editPetGender">
                    <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                    </SelectContent>
                </Select>
                {errors.petGender && (<p className="text-sm text-red-500 mt-1.5">{errors.petGender.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetWeight">Peso (kg)</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editPetWeight"
                    className="pl-9"
                    type="number"
                    min={0.1}
                    max={150}
                    step={0.1}
                    {...register('petWeight', { valueAsNumber: true })}
                  />
                </div>
                {errors.petWeight && (<p className="text-sm text-red-500">{errors.petWeight.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetHistory">Historial médico (opcional)</Label>
                <p className="text-sm text-gray-600">Adjunta un nuevo historial médico si deseas reemplazar el actual (PDF).</p>
                <div className="relative">
                    {petFiles.historial ? (
                      <div className="flex items-center justify-between px-3 py-2 border rounded-md">
                        <div className="flex items-center">
                          <Paw className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium text-blue-500">{petFiles.historial.name}</span>
                        </div>
                        <Button
                          type="button" variant="ghost" size="sm"
                          onClick={() => {
                              setPetFiles({...petFiles, historial: null});
                              const input = document.getElementById('editPetHistory') as HTMLInputElement | null;
                              if (input) input.value = '';
                          }}
                          disabled={isLoading}
                        >
                          <span className="text-red-600">Quitar</span>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="editPetHistory"
                          name="editPetHistory"
                          className="pl-9"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf"
                          disabled={isLoading}
                        />
                      </>
                    )}
                 </div>
                 {petToEdit.historial_medico && !petFiles.historial && (
                    <p className="text-xs text-gray-500 mt-1">Archivo actual: {petToEdit.historial_medico.split('/').pop() || 'Archivo existente'}</p>
                 )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPetPhoto">Foto (Opcional)</Label>
                 <p className="text-sm text-gray-600">Sube una nueva foto si deseas reemplazar la actual (imagen).</p>
                <div className="relative">
                    {petFiles.foto ? (
                      <div className="flex items-center justify-between px-3 py-2 border rounded-md">
                         <div className="flex items-center">
                           <Paw className="h-4 w-4 text-primary mr-2" />
                           <span className="text-sm font-medium text-blue-500">{petFiles.foto.name}</span>
                           <div className="ml-2 h-8 w-8 overflow-hidden rounded-md">
                               <img src={URL.createObjectURL(petFiles.foto)} alt="Previa" className="h-full w-full object-cover"/>
                           </div>
                         </div>
                         <Button
                           type="button" variant="ghost" size="sm"
                           onClick={() => {
                               const objectUrl = URL.createObjectURL(petFiles.foto!);
                               setPetFiles({...petFiles, foto: null});
                               const input = document.getElementById('editPetPhoto') as HTMLInputElement | null;
                               if (input) input.value = '';
                               URL.revokeObjectURL(objectUrl);
                           }}
                           disabled={isLoading}
                         >
                           <span className="text-red-600">Quitar</span>
                         </Button>
                      </div>
                     ) : (
                       <>
                         <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input
                           id="editPetPhoto"
                           name="editPetPhoto"
                           className="pl-9"
                           type="file"
                           onChange={handleFileChange}
                           accept="image/*"
                           disabled={isLoading}
                         />
                       </>
                     )}
                 </div>
                  {petToEdit.foto_url && !petFiles.foto && (
                     <div className="mt-2">
                         <p className="text-xs text-gray-500 mb-1">Foto actual:</p>
                         <img src={petToEdit.foto_url} alt="Foto actual" className="h-16 w-16 object-cover rounded-md"/>
                     </div>
                 )}
              </div>
            </div>

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
