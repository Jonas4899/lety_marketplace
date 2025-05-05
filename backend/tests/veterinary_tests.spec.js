import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import os from "os";

// Base URL for API requests
const API_BASE_URL = "http://localhost:3001";

// Test data for veterinary clinic
const testVeterinary = {
  nombre: "Test Clinic",
  direccion: "Test Address 123",
  telefono: "1234567890",
  correo: `test-${Date.now()}@example.com`,
  contrasena: "Password123!",
  descripcion: "A test veterinary clinic",
  NIT: `NIT-${Date.now()}`,
  servicios: JSON.stringify([
    { name: "Vaccination", price: "50.00", category: "preventive" },
    { name: "Surgery", price: "200.00", category: "treatment" },
  ]),
  horarios: JSON.stringify({
    monday: {
      open: "08:00:00",
      close: "18:00:00",
      is24Hours: false,
      closed: false,
    },
    tuesday: {
      open: "08:00:00",
      close: "18:00:00",
      is24Hours: false,
      closed: false,
    },
    wednesday: {
      open: "08:00:00",
      close: "18:00:00",
      is24Hours: false,
      closed: false,
    },
    thursday: {
      open: "08:00:00",
      close: "18:00:00",
      is24Hours: false,
      closed: false,
    },
    friday: {
      open: "08:00:00",
      close: "18:00:00",
      is24Hours: false,
      closed: false,
    },
    saturday: {
      open: "09:00:00",
      close: "15:00:00",
      is24Hours: false,
      closed: false,
    },
    sunday: { closed: true },
  }),
};

let clinicId;

test.describe.serial("Veterinary API Tests", () => {
  // Create a temporary certificate file for testing
  let tempCertificatePath;

  test.beforeAll(async () => {
    const tmpDir = os.tmpdir();
    tempCertificatePath = path.join(tmpDir, `certificate-${Date.now()}.pdf`);
    fs.writeFileSync(tempCertificatePath, "Mock certificate content");
  });

  test.afterAll(async () => {
    // Clean up temporary file
    if (tempCertificatePath && fs.existsSync(tempCertificatePath)) {
      fs.unlinkSync(tempCertificatePath);
    }
  });

  test("Veterinary creation", async ({ request }) => {
    const formData = {};

    Object.entries(testVeterinary).forEach(([key, value]) => {
      formData[key] = value;
    });

    const response = await request.post(`${API_BASE_URL}/register/veterinary`, {
      multipart: {
        ...formData,
        certificadoSalud: {
          name: "certificate.pdf",
          mimeType: "application/pdf",
          buffer: fs.readFileSync(tempCertificatePath),
        },
      },
    });

    // Assert the response
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("Clínica registrada exitosamente");
    expect(responseBody.datosClinica).toBeDefined();
    expect(responseBody.datosClinica.id_clinica).toBeDefined();

    // Store the clinic ID for subsequent tests
    clinicId = responseBody.datosClinica.id_clinica;

    // Verify services and schedules were created
    expect(responseBody.servicios).toBeDefined();
    expect(responseBody.servicios.length).toBe(2);
    expect(responseBody.horarios).toBeDefined();
    expect(responseBody.horarios.length).toBeGreaterThan(0);
  });

  test("Register single service", async ({ request }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      console.log(
        "Clinic ID is not available for this test: Register single service"
      );
      test.skip("Clinic ID is required for this test");
      return;
    }

    const serviceData = {
      id_clinica: clinicId,
      nombre: "Dental Cleaning",
      precio: 85.99,
      categoria: "dental",
    };

    const response = await request.post(`${API_BASE_URL}/register/service`, {
      data: serviceData,
    });

    // Assert the response
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("Servicio registrado exitosamente");
    expect(responseBody.servicio).toBeDefined();
    expect(responseBody.servicio.nombre).toBe(serviceData.nombre);
    expect(responseBody.servicio.precio).toBe(serviceData.precio);
  });

  test("Register multiple services", async ({ request }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      console.log(
        "Clinic ID is not available for this test: Register multiple services"
      );
      test.skip("Clinic ID is required for this test");
      return;
    }

    const servicesData = {
      id_clinica: clinicId,
      servicios: [
        { nombre: "X-Ray", precio: 120, categoria: "diagnostic" },
        { nombre: "Blood Test", precio: 45, categoria: "laboratory" },
        { nombre: "Grooming", precio: 35, categoria: "aesthetic" },
      ],
    };

    const response = await request.post(`${API_BASE_URL}/register/services`, {
      data: servicesData,
    });

    // Assert the response
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toContain(
      "servicios registrados exitosamente"
    );
    expect(responseBody.servicios).toBeDefined();
    expect(responseBody.servicios.length).toBe(3);
  });

  test("Register single schedule", async ({ request }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      console.log(
        "Clinic ID is not available for this test: Register single schedule"
      );
      test.skip("Clinic ID is required for this test");
      return;
    }

    const scheduleData = {
      id_clinica: clinicId,
      dia_semana: "friday",
      hora_apertura: "08:30:00",
      hora_cierre: "20:00:00",
      es_24h: false,
      esta_cerrado: false,
    };

    const response = await request.post(`${API_BASE_URL}/register/schedule`, {
      data: scheduleData,
    });

    // Assert the response
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("Horario registrado exitosamente");
    expect(responseBody.horario).toBeDefined();
    expect(responseBody.horario.dia_semana).toBe(scheduleData.dia_semana);
    expect(responseBody.horario.hora_apertura).toBe(scheduleData.hora_apertura);
  });

  test("Register multiple schedules", async ({ request }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      console.log(
        "Clinic ID is not available for this test: Register multiple schedules"
      );
      test.skip("Clinic ID is required for this test");
      return;
    }

    const schedulesData = {
      id_clinica: clinicId,
      horarios: [
        { dia_semana: "monday", es_24h: true, esta_cerrado: false },
        {
          dia_semana: "tuesday",
          hora_apertura: "07:00:00",
          hora_cierre: "19:00:00",
          es_24h: false,
          esta_cerrado: false,
        },
        { dia_semana: "sunday", esta_cerrado: true },
      ],
    };

    const response = await request.post(`${API_BASE_URL}/register/schedules`, {
      data: schedulesData,
    });

    // Assert the response
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("horarios registrados exitosamente");
    expect(responseBody.horarios).toBeDefined();
    expect(responseBody.horarios.length).toBe(3);
  });

  test("Validate error handling for missing fields in veterinary creation", async ({
    request,
  }) => {
    const incompleteData = {
      nombre: "Incomplete Clinic",
      direccion: "Some Address",
      // Missing required fields
    };

    const response = await request.post(`${API_BASE_URL}/register/veterinary`, {
      multipart: incompleteData,
    });

    // Assert the response indicates an error
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("campos obligatorios");
  });

  test("Validate error handling for invalid service data", async ({
    request,
  }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      test.skip("Clinic ID is required for this test");
      return;
    }

    const invalidServiceData = {
      id_clinica: clinicId,
      nombre: "Invalid Service",
      // Missing required fields
    };

    const response = await request.post(`${API_BASE_URL}/register/service`, {
      data: invalidServiceData,
    });

    // Assert the response indicates an error
    expect(response.status()).toBe(400);
  });

  test("Validate error handling for invalid schedule day", async ({
    request,
  }) => {
    // Skip if clinicId is not available
    if (!clinicId) {
      test.skip("Clinic ID is required for this test");
      return;
    }

    const invalidScheduleData = {
      id_clinica: clinicId,
      dia_semana: "invalidDay", // Invalid day
      hora_apertura: "08:00:00",
      hora_cierre: "18:00:00",
    };

    const response = await request.post(`${API_BASE_URL}/register/schedule`, {
      data: invalidScheduleData,
    });

    // Assert the response indicates an error
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("día de la semana");
  });
});

test.describe.serial("Citas - ciclo completo", () => {
  let ownerToken, vetToken, citaId, clinicaId, mascotaId, servicioId;

  test.beforeAll(async ({ request }) => {
    // 1. Crear usuario dueño
    const ownerRes = await request.post(`${API_BASE_URL}/register/user`, {
      data: {
        nombre: "Dueño Test",
        correo: `dueno-${Date.now()}@mail.com`,
        contrasena: "Test1234!",
        telefono: "1234567890",
      },
    });
    expect(ownerRes.status()).toBe(201);
    const ownerData = await ownerRes.json();
    ownerToken = ownerData.token;
    // 2. Crear clínica y obtener vetToken (mock: login clínica)
    const vetRes = await request.post(`${API_BASE_URL}/login/veterinary`, {
      data: {
        correo: testVeterinary.correo,
        contrasena: testVeterinary.contrasena,
      },
    });
    expect(vetRes.status()).toBe(200);
    const vetData = await vetRes.json();
    vetToken = vetData.token;
    clinicaId = vetData.clinica.id_clinica;
    // 3. Crear mascota
    const petRes = await request.post(`${API_BASE_URL}/register/pet`, {
      data: {
        id_usuario: ownerData.usuario.id_usuario,
        nombre: "Firulais",
        especie: "Perro",
        edad: 3,
        raza: "Labrador",
        genero: "Macho",
        peso: 20,
      },
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    expect(petRes.status()).toBe(201);
    const petData = await petRes.json();
    mascotaId = petData.mascota.id_mascota;
    // 4. Crear servicio
    const serviceRes = await request.post(`${API_BASE_URL}/register/service`, {
      data: {
        id_clinica: clinicaId,
        nombre: "Consulta General",
        precio: 100,
        categoria: "consulta",
      },
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    expect(serviceRes.status()).toBe(201);
    const serviceData = await serviceRes.json();
    servicioId = serviceData.servicio.id_servicio;
    // 5. Crear cita
    const citaRes = await request.post(
      `${API_BASE_URL}/appointments/schedule`,
      {
        data: {
          petId: mascotaId,
          serviceId: servicioId,
          date: new Date(Date.now() + 86400000).toISOString(),
          timeSlot: "10:00-11:00",
          reason: "Chequeo anual",
          notes: "Sin observaciones",
          reminderPreference: "email",
          acceptedTerms: true,
          clinicId: clinicaId,
        },
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    expect(citaRes.status()).toBe(201);
    const citaData = await citaRes.json();
    citaId = citaData.cita.id_cita;
  });

  test("Editar cita (dueño)", async ({ request }) => {
    const editRes = await request.put(
      `${API_BASE_URL}/appointments/${citaId}/edit`,
      {
        data: {
          reason: "Cambio de motivo",
          notes: "Notas editadas",
          timeSlot: "11:00-12:00",
        },
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    expect(editRes.status()).toBe(200);
    const citaDetalle = await request.get(
      `${API_BASE_URL}/appointments/${citaId}`,
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    const citaJson = await citaDetalle.json();
    expect(citaJson.appointment.reason).toBe("Cambio de motivo");
    expect(citaJson.appointment.time).toBe("11:00-12:00");
  });

  test("Finalizar cita (vet)", async ({ request }) => {
    const finalizeRes = await request.put(
      `${API_BASE_URL}/appointments/${citaId}/finalize`,
      {
        data: {
          diagnostico: "Otitis",
          tratamiento: "Limpieza de oídos",
          medicamentos: [
            {
              nombre: "Gotas óticas",
              dosis: "2 gotas",
              via: "auricular",
              observaciones: "7 días",
            },
          ],
          recomendaciones: "Evitar agua en los oídos",
          instrucciones_seguimiento: "Revisión en 10 días",
          notas_internas: "Paciente tranquilo",
          servicios_adicionales: [{ nombre: "Limpieza profunda", precio: 50 }],
          productos_vendidos: [
            { nombre: "Gotas óticas", cantidad: 1, precio: 30 },
          ],
        },
        headers: { Authorization: `Bearer ${vetToken}` },
      }
    );
    expect(finalizeRes.status()).toBe(200);
    // Verifica que el estado sea finalizada y los campos estén guardados
    const citaDetalle = await request.get(
      `${API_BASE_URL}/appointments/${citaId}`,
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    const citaJson = await citaDetalle.json();
    expect(citaJson.appointment.status).toBe("finalizada");
    // No se expone todo, pero podrías agregar un endpoint para ver trazabilidad y campos internos si lo necesitas
  });
});
