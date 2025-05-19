import request from "supertest";
import express from "express";
import { WeatherController } from "../../controllers/weatherController";
import { AlertService } from "../../services/alertService";
import { WeatherService } from "../../services/weatherService";

// Mock AlertService
jest.mock("../../services/alertService", () => ({
  AlertService: {
    getAlertsForLocation: jest.fn(),
  },
}));

// Mock WeatherService
jest.mock("../../services/weatherService", () => ({
  WeatherService: {
    getWeather: jest.fn(),
  },
}));

describe("WeatherController Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.get("/weather", WeatherController.getWeather);
    jest.clearAllMocks();
  });

  describe("GET /weather", () => {
    const mockAlerts = [
      {
        alert: {
          id: "test-alert-1",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [37.7749, -122.4194],
                [37.7749, -122.4094],
                [37.7649, -122.4094],
                [37.7649, -122.4194],
              ],
            ],
          },
        },
        start: Math.floor(Date.now() / 1000) - 1800,
        end: Math.floor(Date.now() / 1000) + 1800,
      },
    ];

    const mockWeatherData = {
      temperature: 20,
      humidity: 65,
      description: "Sunny",
    };

    it("should return weather data with alerts", async () => {
      // Mock both services
      (AlertService.getAlertsForLocation as jest.Mock).mockResolvedValue(
        mockAlerts
      );
      (WeatherService.getWeather as jest.Mock).mockResolvedValue(
        mockWeatherData
      );

      const response = await request(app)
        .get("/weather")
        .query({ lat: 37.77, lon: -122.41 })
        .expect(200);

      expect(response.body).toHaveProperty("alerts");
      expect(response.body.alerts).toHaveLength(1);
      expect(response.body).toMatchObject(mockWeatherData);
      expect(AlertService.getAlertsForLocation).toHaveBeenCalledWith(
        37.77,
        -122.41,
        expect.any(Number)
      );
      expect(WeatherService.getWeather).toHaveBeenCalledWith({
        lat: 37.77,
        lon: -122.41,
      });
    });

    it("should return 400 for missing coordinates", async () => {
      const response = await request(app).get("/weather").expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid coordinates", async () => {
      const response = await request(app)
        .get("/weather")
        .query({ lat: "invalid", lon: -122.41 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return empty alerts array when no alerts found", async () => {
      // Mock both services
      (AlertService.getAlertsForLocation as jest.Mock).mockResolvedValue([]);
      (WeatherService.getWeather as jest.Mock).mockResolvedValue(
        mockWeatherData
      );

      const response = await request(app)
        .get("/weather")
        .query({ lat: 37.77, lon: -122.41 })
        .expect(200);

      expect(response.body).toHaveProperty("alerts");
      expect(response.body.alerts).toHaveLength(0);
      expect(response.body).toMatchObject(mockWeatherData);
    });

    it("should return empty alerts array when Redis has no alerts", async () => {
      // Mock both services
      (AlertService.getAlertsForLocation as jest.Mock).mockResolvedValue([]);
      (WeatherService.getWeather as jest.Mock).mockResolvedValue(
        mockWeatherData
      );

      const response = await request(app)
        .get("/weather")
        .query({ lat: 37.77, lon: -122.41 })
        .expect(200);

      expect(response.body).toHaveProperty("alerts");
      expect(response.body.alerts).toEqual([]);
      expect(response.body).toMatchObject(mockWeatherData);
      expect(AlertService.getAlertsForLocation).toHaveBeenCalledWith(
        37.77,
        -122.41,
        expect.any(Number)
      );
    });
  });
});
