import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const petFormSchema = z.object({
  petName: z.string().min(2, "El nombre debe tener minimo 2 caracteres").max(20, "El nombre puede tener maximo 20 caracteres"),
  petAge: z.number().min(0, "la edad debe ser un numero positivo").max(50, "la edad no puede exceder los 50 años"),
  petSpecies: z.string().min(1, 'Debe seleccionar una especie'),
  petBreed: z.string().min(1, 'Debe seleccionar una raza'),
  petHistory: z.instanceof(File).optional(),
  petPhoto: z.instanceof(File).optional(),
});
