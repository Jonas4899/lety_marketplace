import { z } from 'zod';

export const ownerFormSchema = z.object({
  userName: z.string().min(3, "Su nombre debe tener minimo 3 caracteres").max(30, "Su nombre puede tener maximo caracteres").regex(/^[a-zA-Z\s]+$/, { message: "Solo se permiten letras y espacios." }),
  email: z.string().email({message: "Debe ser un un correo valido"}).toLowerCase(),
  phone: z.string().min(9, "El numero telefonico no es valido").max(10, "El numero telefonico no es valido"),
  password: z.string().min(6, "La contraseña debe tener minimo 6 caracteres"),
});
