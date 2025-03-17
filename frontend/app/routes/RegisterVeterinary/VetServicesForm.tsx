import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { X, Plus, Stethoscope } from "lucide-react";

interface Service {
  name: string;
  price: string;
}

interface FormData {
  services: Service[];
}

export default function VetServicesForm() {
  const [submitted, setSubmitted] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos guardados del formulario anterior
    const basicInfoData = localStorage.getItem("vetBasicInfo");
    if (basicInfoData) {
      const basicInfo = JSON.parse(basicInfoData);
      setClinicName(basicInfo.clinicName || "");
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      services: [{ name: "", price: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const onSubmit = (data: FormData) => {
    console.log("Services Form Data:", data);
    localStorage.setItem("vetServicesInfo", JSON.stringify(data));
    setSubmitted(true);
    // Navegar al siguiente formulario o mostrar confirmación
    setTimeout(() => {
      navigate("/registrar-horarios-pagos");
    }, 1500);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {clinicName
          ? `Servicios de ${clinicName}`
          : "Registro de Servicios Veterinarios"}
      </Typography>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Servicios registrados con éxito!
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Stethoscope size={20} />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Servicios Ofrecidos
            </Typography>
          </Box>

          {fields.map((field, index) => (
            <Grid
              container
              spacing={2}
              key={field.id}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`services.${index}.name`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre del Servicio"
                      variant="outlined"
                      error={!!errors.services?.[index]?.name}
                      helperText={errors.services?.[index]?.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 5 }}>
                <Controller
                  name={`services.${index}.price`}
                  control={control}
                  rules={{
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^[0-9]+(\.[0-9]{1,2})?$/,
                      message: "Ingrese un precio válido",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Precio"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      error={!!errors.services?.[index]?.price}
                      helperText={errors.services?.[index]?.price?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  color="error"
                >
                  <X size={20} />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<Plus size={20} />}
            onClick={() => append({ name: "", price: "" })}
            variant="outlined"
            sx={{ mt: 1 }}
            fullWidth
          >
            Agregar Servicio
          </Button>
        </Paper>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
        >
          Continuar
        </Button>
      </form>
    </Box>
  );
}
