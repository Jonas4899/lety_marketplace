import { z } from "zod";

export const ownerFormSchema = z.object({
  userName: z
    .string()
    .min(3, "Su nombre debe tener minimo 3 caracteres")
    .max(30, "Su nombre puede tener maximo caracteres")
    .regex(/^[a-zA-Z\s]+$/, { message: "Solo se permiten letras y espacios." }),
  email: z
    .string()
    .email({ message: "Debe ser un un correo valido!" })
    .toLowerCase(),
  phone: z.string().min(10, "El numero telefonico no es valido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial"
    ),
  agreeTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debe aceptar los terminos y condiciones",
    }),
  petName: z
    .string()
    .min(2, "El nombre debe tener minimo 2 caracteres")
    .max(20, "El nombre puede tener maximo 20 caracteres"),
  petAge: z
    .number()
    .min(0, "la edad debe ser un numero positivo")
    .max(50, "la edad no puede exceder los 50 años"),
  petSpecies: z.string().min(1, "Debe seleccionar una especie"),
  petBreed: z.string().min(1, "Debe seleccionar una raza"),
  petHistory: z.instanceof(File).optional(),
  petPhoto: z.instanceof(File).optional(),
});
