import {z} from 'zod';

export const loginFormSchema = z.object({
   email: z.string().email({message: "Debe ser un un correo valido!"}).toLowerCase(),
   password: z.string().min(6, "La contraseña debe tener minimo 6 caracteres"),
})