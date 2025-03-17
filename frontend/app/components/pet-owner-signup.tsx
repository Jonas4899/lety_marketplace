import type React from "react";

import { useState } from "react";
import { PawPrintIcon as Paw, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
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


interface PetOwnerSignupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function PetOwnerSignup({
  open,
  onOpenChange,
  onBack,
}: PetOwnerSignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    agreeTerms: false,
    petName: "",
    petAge: "",
    petSpecies: "",
    petBreed: "",
    petHistory: null,
    petPhoto: null,
  });

  const dogBreeds = [
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
  "perro boyero australiano",
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
  "perro esquimal americano",
  "perro lapphund finlandés",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files || e.target.name) return;
    const file = e.target.files[0]; // Obtiene el archivo seleccionado
    const name = e.target.name; // Obtiene el atributo 'name' del input

    console.log(e.target.files);
    setFormData((formData) => ({
      ...formData,
      [name]: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Here you would typically send the data to your backend
      console.log("Submitting pet owner registration:", formData);
      // Close the dialog after successful submission
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col items-center justify-center w-full">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Paw className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Registro como Dueño de Mascota</DialogTitle>
              <DialogDescription>
                {step === 1 ? "Información personal" : "Información de la mascota"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre y Apellido</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    className="pl-9"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="321 1234567"
                    className="pl-9"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Crea una contraseña"
                    className="pl-9"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  Acepto los términos y condiciones y la política de privacidad
                </Label>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="petName">Nombre de tu mascota</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petName"
                    name="petName"
                    placeholder="Nombre de tu mascota"
                    className="pl-9"
                    type="text"
                    value={formData.petName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petAge">Edad</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petAge"
                    name="petAge"
                    placeholder="Edad de tu mascota"
                    className="pl-9"
                    type="number"
                    value={formData.petAge}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petSpecies">Especie</Label>
                <div className="relative">
                  <Select name="petSpecies" required onValueChange={(value) => setFormData({...formData, petSpecies: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem  value="canino">Canino</SelectItem>
                      <SelectItem value="fenilo">Felino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petBreed">Raza</Label>
                <div className="relative">
                  <Select name="petBreed" required onValueChange={(value) => setFormData({...formData, petBreed: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Especie" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        formData.petSpecies === "canino" ? dogBreeds.map((breed) => (
                            <SelectItem value={breed}>{breed}</SelectItem>
                        )) : ( catBreeds.map((breed) => (
                          <SelectItem value={breed}>{breed}</SelectItem>
                        )))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petHistory">Historial medico (opcional)</Label>
                <p className="text-sm text-gray-600">Puedes adjuntar el historial medico de tu mascota</p>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petHistory"
                    name="petHistory"
                    className="pl-9"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="petPhoto">Foto (Opcional)</Label>
                <div className="relative">
                  <Paw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petPhoto"
                    name="petPhoto"
                    className="pl-9"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
              </div>

            </div>
          )}


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onBack}>
              Volver
            </Button>
            <Button type="submit">
              {step === 1 ? "Continuar" : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
