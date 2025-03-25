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
