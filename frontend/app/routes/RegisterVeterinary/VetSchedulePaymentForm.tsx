import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Checkbox,
  FormControl,
  FormGroup,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Clock, CreditCard } from "lucide-react";

interface Schedule {
  day: string;
  from: string;
  to: string;
}

interface FormData {
  schedule: Schedule[];
  is24Hours: boolean;
  paymentMethods: {
    cash: boolean;
    creditCard: boolean;
    debitCard: boolean;
    bankTransfer: boolean;
    onlinePayment: boolean;
  };
}

const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function VetSchedulePaymentForm() {
  const [submitted, setSubmitted] = useState(false);
  const [clinicName, setClinicName] = useState("");

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
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      schedule: days.map((day) => ({ day, from: "09:00", to: "18:00" })),
      is24Hours: false,
      paymentMethods: {
        cash: true,
        creditCard: false,
        debitCard: false,
        bankTransfer: false,
        onlinePayment: false,
      },
    },
  });

  const is24Hours = watch("is24Hours");

  const onSubmit = (data: FormData) => {
    console.log("Schedule and Payment Form Data:", data);
    localStorage.setItem("vetSchedulePaymentInfo", JSON.stringify(data));
    setSubmitted(true);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {clinicName
          ? `Horarios y Pagos de ${clinicName}`
          : "Horarios y Métodos de Pago"}
      </Typography>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Información registrada con éxito!
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Clock size={20} />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Horario de Atención
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Controller
                name="is24Hours"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            }
            label="Atención las 24 horas"
            sx={{ mb: 2 }}
          />

          {!is24Hours && (
            <Box sx={{ maxHeight: "200px", overflowY: "auto", pr: 1 }}>
              <Grid container spacing={1}>
                {days.map((day, index) => (
                  <Grid size={{ xs: 12 }} key={day}>
                    <Card variant="outlined" sx={{ mb: 1 }}>
                      <CardContent
                        sx={{ py: 1, px: 2, "&:last-child": { pb: 1 } }}
                      >
                        <Grid container spacing={1} alignItems="center">
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {day}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Controller
                              name={`schedule.${index}.from`}
                              control={control}
                              rules={{ required: "Obligatorio" }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Desde"
                                  type="time"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ step: 900 }}
                                  variant="outlined"
                                  size="small"
                                  error={!!errors.schedule?.[index]?.from}
                                  helperText={
                                    errors.schedule?.[index]?.from?.message
                                  }
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Controller
                              name={`schedule.${index}.to`}
                              control={control}
                              rules={{ required: "Obligatorio" }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Hasta"
                                  type="time"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ step: 900 }}
                                  variant="outlined"
                                  size="small"
                                  error={!!errors.schedule?.[index]?.to}
                                  helperText={
                                    errors.schedule?.[index]?.to?.message
                                  }
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CreditCard size={20} />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Métodos de Pago Aceptados
            </Typography>
          </Box>

          <FormControl component="fieldset">
            <FormGroup>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="paymentMethods.cash"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label="Efectivo"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="paymentMethods.creditCard"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label="Tarjeta de Crédito"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="paymentMethods.debitCard"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label="Tarjeta de Débito"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="paymentMethods.bankTransfer"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label="Transferencia Bancaria"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="paymentMethods.onlinePayment"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label="Pagos en Línea"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormGroup>
          </FormControl>
        </Paper>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
        >
          Finalizar Registro
        </Button>
      </form>
    </Box>
  );
}
