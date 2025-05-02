import { useState } from "react";
import { PawPrint as Paw, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Owner } from "~/types/usersTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { StatusDialog } from "./StatusDialog";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuthStore } from "~/stores/useAuthStore";
import Cookies from "js-cookie";

// Schema para el formulario de mascota
const petFormSchema = z.object({
  petName: z.string().min(1, "El nombre es requerido"),
  petAge: z.number().min(0, "La edad debe ser un número positivo"),
  petSpecies: z.string().min(1, "La especie es requerida"),
  petBreed: z.string().min(1, "La raza es requerida"),
  petGender: z.string().min(1, "El género es requerido"),
  petWeight: z.number().min(0.1, "El peso debe ser mayor a 0"),
});

type PetFormData = z.infer<typeof petFormSchema>;

const dogBreeds = [
"Criollo (Sin raza)",
"affenpinscher",
"africano",
"airedale terrier",
"akita",
"appenzeller",
"kelpie australiano",
"pastor australiano",
"bakharwal indio",
"basenji",
"beagle",
"bluetick",
"borzoi",
"bouvier",
"boxer",
"brabanzón",
"briard",
"buhund noruego",
"bulldog de Boston",
"bulldog inglés",
"bulldog francés",
"bullterrier de Staffordshire",
"Boyero australiano",
"cavapoo",
"chihuahua",
"chippiparai indio",
"chow chow",
"clumber spaniel",
"cockapoo",
"collie border",
"coonhound",
"corgi galés de Cardigan",
"coton de Tulear",
"dachshund (teckel)",
"dálmata",
"gran danés",
"perro danés-sueco",
"lebrel escocés",
"dhole",
"dingo",
"dóberman",
"elkhound noruego",
"entlebucher",
"Esquimal americano",
"Lapphund finlandés",
"bichón frisé",
"gaddi indio",
"pastor alemán",
"galgo indio",
"galgo italiano",
"groenendael",
"habanero",
"lebrel afgano",
"basset hound",
"bloodhound",
"fresh puddle",
"foxhound inglés",
"podenco ibicenco",
"plott hound",
"coonhound de Walker",
"husky siberiano",
"keeshond",
"kelpie",
"kombai",
"komondor",
"kuvasz",
"labradoodle",
"labrador",
"labrador retriever",
"leonberger",
"lhasa apso",
"malamute de Alaska",
"pastor belga malinois",
"maltés",
"bullmastiff",
"mastín inglés",
"mastín indio",
"mastín tibetano",
"perro sin pelo mexicano",
"mestizo",
"boyero de Berna",
"boyero suizo",
"mudhol indio",
"terranova",
"otterhound",
"caucásico ovcharka",
"papillón",
"perro paria indio",
"pequinés",
"pembroke corgi galés",
"pinscher miniatura",
"pitbull",
"braco alemán",
"braco alemán de pelo largo",
"pomerania",
"caniche mediano",
"caniche miniatura",
"caniche estándar",
"caniche toy",
"pug",
"puggle",
"montaña de los Pirineos",
"rajapalayam indio",
"redbone coonhound",
"retriever de Chesapeake",
"retriever de pelo rizado",
"retriever de pelo liso",
"golden retriever",
"perro crestado rodesiano",
"rottweiler",
"saluki",
"samoyedo",
"schipperke",
"schnauzer gigante",
"schnauzer miniatura",
"segugio italiano",
"setter inglés",
"setter Gordon",
"setter irlandés",
"shar pei",
"perro ovejero inglés",
"perro ovejero indio",
"shetland sheepdog",
"shiba inu",
"shih tzu",
"spaniel Blenheim",
"spaniel bretón",
"cocker spaniel",
"spaniel irlandés",
"spaniel japonés",
"spaniel de Sussex",
"spaniel galés",
"spitz indio",
"spitz japonés",
"springer spaniel inglés",
"san Bernardo",
"terrier americano",
"terrier australiano",
"terrier bedlington",
"terrier border",
"terrier cairn",
"terrier dandie dinmont",
"fox terrier",
"terrier irlandés",
"terrier azul de Kerry",
"terrier lakeland",
"terrier norfolk",
"terrier norwich",
"terrier patterdale",
"terrier russell",
"terrier escocés",
"terrier sealyham",
"terrier sedoso",
"terrier tibetano",
"terrier toy",
"terrier galés",
"terrier west highland",
"terrier wheaten",
"terrier yorkshire",
"pastor belga tervuren",
"vizsla",
"perro de agua español",
"weimaraner",
"whippet",
"lobero irlandés"
];

const catBreeds = [
"Criollo (Sin raza)",
"abisinio",
"americano de pelo corto",
"americano de pelo rizado",
"american bobtail",
"american curl",
"angora turco",
"asiático",
"balinés",
"bengalí",
"birmano",
"bombay",
"bosque de noruega",
"británico de pelo corto",
"británico de pelo largo",
"burmilla",
"californiano brillante",
"cartujo",
"ceilanés",
"chantilly-tiffany",
"colorpoint de pelo corto",
"cornish rex",
"cymric",
"devon rex",
"don sphynx",
"europeo de pelo corto",
"fold escocés",
"gato egipcio",
"gato exótico",
"gato hawaiano",
"havana brown",
"himalayo",
"japonés bobtail",
"javanés",
"khao manee",
"korat",
"kurilian bobtail",
"laPerm",
"maine coon",
"manx",
"mau egipcio",
"munchkin",
"nebelung",
"ocicat",
"oriental de pelo corto",
"oriental de pelo largo",
"persa",
"peterbald",
"pixie-bob",
"ragamuffin",
"ragdoll",
"ruso azul",
"sagrado de birmania",
"savannah",
"selkirk rex",
"serengeti",
"siberiano",
"siamés",
"singapura",
"snowshoe",
"somalí",
"sphynx",
"thai",
"tonkinés",
"toyger",
"turkish van",
"york chocolate"
];


interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPetDialog({ open, onOpenChange, onSuccess }: AddPetDialogProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  //Data del usuario
   const user = useAuthStore((state) => state.user);
   const userType = useAuthStore((state) => state.userType);
   const id_usuario = userType === 'owner' && user ? (user as Owner).id_usuario : undefined;
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    type: "" as "loading" | "error" | "success",
    message: ""
  });

  const [petFiles, setPetFiles] = useState({
    petHistory: null as File | null,
    petPhoto: null as File | null,
  });

  const { register, handleSubmit, formState: { errors, touchedFields }, watch, setValue, reset } = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    mode: 'onTouched',
    defaultValues: {
      petName: "",
      petAge: 0,
      petSpecies: "",
      petBreed: "",
      petGender: "",
      petWeight: 0,
    }
  });

  const formValues = watch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.name) return;
    const file = e.target.files[0];
    const name = e.target.name;
    
    setPetFiles({
      ...petFiles,
      [name]: file,
    });
  };

  const onSubmit = async (data: PetFormData) => {
   try {
      setStatusDialog({
         open: true,
         type: "loading",
         message: "Registrando mascota..."
      });

      setIsLoading(true);

      const formData = new FormData();
      
      // Agregar datos del formulario al FormData
      formData.append('petName', data.petName);
      formData.append('petAge', data.petAge.toString());
      formData.append('petSpecies', data.petSpecies);
      formData.append('petBreed', data.petBreed);
      formData.append('petGender', data.petGender);
      formData.append('petWeight', data.petWeight.toString());

      // Añadir los archivos si existen
      if (petFiles.petHistory) {
         formData.append('historial', petFiles.petHistory);
      }
      if (petFiles.petPhoto) {
         formData.append('foto', petFiles.petPhoto);
      }
      
      // Obtener token de autenticación e ID de usuario
      const token = Cookies.get('auth_token');
      console.log("token:" + token);
      
      // Enviar solicitud al backend
      const response = await fetch(`${API_URL}/pets/add?id_usuario=${id_usuario}`, {
         method: 'POST',
         headers: {
         'Authorization': `Bearer ${token}`
         },
         body: formData,
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Error al registrar la mascota');
      }

      const responseData = await response.json();

      // Mostrar diálogo de éxito
      setStatusDialog({
         open: true,
         type: "success",
         message: "Mascota registrada exitosamente"
      });
      
      // Limpiar formulario después de éxito
      reset();
      setPetFiles({
         petHistory: null,
         petPhoto: null
      });
      
      // Si hay callback de éxito, ejecutarlo
      if (onSuccess) {
         setTimeout(() => {
         onSuccess();
         }, 1500);
      }

   } catch (error: any) {
      console.error("Error al registrar mascota:", error);
      
      setStatusDialog({
         open: true,
         type: "error",
         message: error instanceof Error ? error.message : "Error al registrar mascota"
      });
   } finally {
      setIsLoading(false);
   }
   };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px] ">
          <DialogHeader>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Paw className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Registrar Nueva Mascota</DialogTitle>
              <DialogDescription>
                Completa la información de tu mascota
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="petName">Nombre de tu mascota</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petName"
                    placeholder="Nombre de tu mascota"
                    className="pl-9"
                    type="text"
                    {...register('petName')}
                  />
                </div>
                {errors.petName && touchedFields.petName && (<p className="text-sm text-red-500 mt-1.5">{errors.petName.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petAge">Edad</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petAge"
                    placeholder="Edad de tu mascota"
                    className="pl-9"
                    type="number"
                    min={0}
                    max={50}
                    {...register('petAge', { valueAsNumber: true })}
                  />
                </div>
                {errors.petAge && touchedFields.petAge && (<p className="text-sm text-red-500 mt-1.5">{errors.petAge.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petSpecies">Especie</Label>
                <div className="relative">
                  <Select name="petSpecies" onValueChange={(value) => setValue('petSpecies', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Canino" className="hover:bg-primary/10">Canino</SelectItem>
                      <SelectItem value="Felino" className="hover:bg-primary/10">Felino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.petSpecies && touchedFields.petSpecies && (<p className="text-sm text-red-500 mt-1.5">{errors.petSpecies.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petBreed">Raza</Label>
                <div className="relative">
                  <Select name="petBreed" onValueChange={(value) => setValue('petBreed', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Raza" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        formValues.petSpecies === "Canino" ? 
                          dogBreeds.map((breed) => (
                            <SelectItem key={breed} value={breed} className="hover:bg-primary/10">{breed}</SelectItem>
                          )) 
                        : formValues.petSpecies === "Felino" ? 
                          catBreeds.map((breed) => (
                            <SelectItem key={breed} value={breed} className="hover:bg-primary/10">{breed}</SelectItem>
                          ))
                        : <SelectItem value="No aplica">No aplica</SelectItem>
                      }
                    </SelectContent>
                  </Select>
                </div>
                {errors.petBreed && touchedFields.petBreed && (<p className="text-sm text-red-500 mt-1.5">{errors.petBreed.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petGender">Género</Label>
                <div className="relative">
                  <Select name="petGender" onValueChange={(value) => setValue('petGender', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho" className="hover:bg-primary/10">Macho</SelectItem>
                      <SelectItem value="Hembra" className="hover:bg-primary/10">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.petGender && touchedFields.petGender && (<p className="text-sm text-red-500 mt-1.5">{errors.petGender.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petWeight">Peso (kg)</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petWeight"
                    placeholder="Peso en kilogramos"
                    className="pl-9"
                    type="number"
                    min={0.1}
                    max={150}
                    step={0.1}
                    {...register('petWeight', { valueAsNumber: true })}
                  />
                </div>
                {errors.petWeight && touchedFields.petWeight && (<p className="text-sm text-red-500 mt-1.5">{errors.petWeight.message}</p>)}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petHistory">Historial médico (opcional)</Label>
                <p className="text-sm text-gray-600">Puedes adjuntar el historial médico de tu mascota</p>
                <div className="relative">
                  {petFiles.petHistory ? (
                    <div className="flex items-center justify-between px-3 py-2 border rounded-md">
                      <div className="flex items-center">
                        <Paw className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium text-blue-500">{petFiles.petHistory.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPetFiles({...petFiles, petHistory: null})}
                      >
                        <span className="text-red-600">eliminar</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="petHistory"
                        name="petHistory"
                        className="pl-9"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petPhoto">Foto (Opcional)</Label>
                <div className="relative">
                  {petFiles.petPhoto ? (
                    <div className="flex items-center justify-between px-3 py-2 border rounded-md">
                      <div className="flex items-center">
                        <Paw className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium text-blue-500">{petFiles.petPhoto.name}</span>
                        {petFiles.petPhoto.type.startsWith('image/') && (
                          <div className="ml-2 h-8 w-8 overflow-hidden rounded-md">
                            <img 
                              src={URL.createObjectURL(petFiles.petPhoto)} 
                              alt="Vista previa" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPetFiles({...petFiles, petPhoto: null})}
                      >
                        <span className="text-red-600">eliminar</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="petPhoto"
                        name="petPhoto"
                        className="pl-9"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Mascota"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <StatusDialog
         open={statusDialog.open}
         onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
         onSuccess={() => {
            // Limpiar el formulario
            reset();
            setPetFiles({
               petHistory: null,
               petPhoto: null
            });
            
            // Cerrar el diálogo de registro
            onOpenChange(false);
            
            // Ejecutar el callback de éxito proporcionado (actualiza la lista de mascotas)
            if (onSuccess) {
               onSuccess();
            }
         }}
         type={statusDialog.type}
         message={statusDialog.message}
         hideRedirect={true} // Ocultar redirección
      />
    </>
  );
}