import * as z from "zod";

// Define the Zod schema for form validation
export const vetClinicSchema = z
  .object({
    clinicName: z.string().min(3, "El nombre de la clínica es obligatorio"),
    nit: z
      .string()
      .regex(
        /^[0-9-]{9,12}$/,
        "El NIT debe contener entre 9-12 caracteres (números y guiones)"
      ),
    address: z.string().min(5, "La dirección es obligatoria"),
    phone: z.string().min(7, "El teléfono es obligatorio"),
    description: z.string().optional(),
    email: z.string().email("Ingrese un correo electrónico válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
        "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial"
      ),
    confirmPassword: z.string(),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, "Debe aceptar los términos y condiciones"),
    businessLicense: z
      .boolean()
      .refine(
        (val) => val === true,
        "Debe confirmar que tiene licencia para operar"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Export a type for form data
export type VetClinicFormData = z.infer<typeof vetClinicSchema>;
