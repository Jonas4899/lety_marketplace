import { test, expect } from "@playwright/test";

// Mock data to be used in tests
const mockData = {
  clinicId: 1,
  // 30 days before today
  fromDate: new Date(
    new Date().setDate(new Date().getDate() - 30)
  ).toISOString(),
  toDate: new Date().toISOString(),
};

// Base URL for API
const API_BASE_URL = "http://localhost:3001";

test.describe("Analytics API Endpoints", () => {
  test("should return summary statistics", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/summary/${mockData.clinicId}?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("totalAppointments");
    expect(responseData).toHaveProperty("avgRating");
    expect(responseData).toHaveProperty("totalRevenue");
    expect(responseData).toHaveProperty("totalPets");

    expect(typeof responseData.totalAppointments).toBe("number");
    expect(typeof responseData.avgRating).toBe("number");
    expect(typeof responseData.totalRevenue).toBe("number");
    expect(typeof responseData.totalPets).toBe("number");
  });

  test("should return appointments statistics", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/appointments/${mockData.clinicId}?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("totalAppointments");
    expect(responseData).toHaveProperty("statusDistribution");
    expect(responseData).toHaveProperty("appointmentsByDate");

    expect(Array.isArray(responseData.statusDistribution)).toBeTruthy();
    expect(responseData.statusDistribution.length).toBe(3);

    expect(Array.isArray(responseData.appointmentsByDate)).toBeTruthy();

    responseData.statusDistribution.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("value");
      expect(typeof item.name).toBe("string");
      expect(typeof item.value).toBe("number");
    });

    responseData.appointmentsByDate.forEach((item) => {
      expect(item).toHaveProperty("date");
      expect(item).toHaveProperty("total");
      expect(item).toHaveProperty("completed");
      expect(item).toHaveProperty("scheduled");
      expect(item).toHaveProperty("cancelled");

      expect(typeof item.date).toBe("string");
      expect(typeof item.total).toBe("number");
      expect(typeof item.completed).toBe("number");
      expect(typeof item.scheduled).toBe("number");
      expect(typeof item.cancelled).toBe("number");
    });
  });

  test("should return services statistics", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/services/${mockData.clinicId}?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("topServices");
    expect(responseData).toHaveProperty("servicesRevenue");

    expect(Array.isArray(responseData.topServices)).toBeTruthy();
    expect(Array.isArray(responseData.servicesRevenue)).toBeTruthy();

    responseData.topServices.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("value");
      expect(typeof item.name).toBe("string");
      expect(typeof item.value).toBe("number");
    });

    responseData.servicesRevenue.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("value");
      expect(item).toHaveProperty("revenue");
      expect(typeof item.name).toBe("string");
      expect(typeof item.value).toBe("number");
      expect(typeof item.revenue).toBe("number");
    });
  });

  test("should return demographics statistics", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/demographics/${mockData.clinicId}?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("petTypeDistribution");
    expect(responseData).toHaveProperty("ageDistribution");

    expect(Array.isArray(responseData.petTypeDistribution)).toBeTruthy();
    expect(Array.isArray(responseData.ageDistribution)).toBeTruthy();

    responseData.petTypeDistribution.forEach((item) => {
      expect(item).toHaveProperty("type");
      expect(item).toHaveProperty("count");
      expect(typeof item.type).toBe("string");
      expect(typeof item.count).toBe("number");
    });

    responseData.ageDistribution.forEach((item) => {
      expect(item).toHaveProperty("range");
      expect(item).toHaveProperty("count");
      expect(typeof item.range).toBe("string");
      expect(typeof item.count).toBe("number");
    });
  });

  test("should return ratings statistics", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/ratings/${mockData.clinicId}?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("averageRating");
    expect(responseData).toHaveProperty("ratingDistribution");

    expect(typeof responseData.averageRating).toBe("number");
    expect(Array.isArray(responseData.ratingDistribution)).toBeTruthy();

    responseData.ratingDistribution.forEach((item) => {
      expect(item).toHaveProperty("rating");
      expect(item).toHaveProperty("count");
      expect(typeof item.rating).toBe("string");
      expect(typeof item.count).toBe("number");
    });
  });

  test("should handle invalid clinic ID", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/summary/999?from_date=${mockData.fromDate}&to_date=${mockData.toDate}`
    );

    expect(response.status()).toBe(404);
    const responseData = await response.json();

    expect(responseData).toHaveProperty("message");
    expect(responseData.message).toBe("Clínica no encontrada");
  });

  test("should handle invalid date range", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/analytics/summary/${mockData.clinicId}?from_date=invalid&to_date=invalid`
    );

    expect(response.status()).toBe(400);
    const responseData = await response.json();

    expect(responseData).toHaveProperty("message");
    expect(responseData.message).toBe("Formato de fecha inválido");
  });
});
