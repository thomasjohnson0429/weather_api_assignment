import { WeatherService } from "../../services/weatherService";
import redisClient from "../../services/redisClient";

// Mock fetch
global.fetch = jest.fn();

// Mock Redis client
jest.mock("../../services/redisClient", () => ({
  __esModule: true,
  default: {
    keys: jest.fn().mockResolvedValue([]),
    get: jest.fn(),
  },
}));

describe("WeatherService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWeather", () => {
    const mockWeatherData = {
      name: "San Francisco",
      main: {
        temp: 293.15, // 20°C
        feels_like: 292.15,
        humidity: 65,
      },
      weather: [
        {
          description: "scattered clouds",
        },
      ],
    };

    it("should return weather data for valid coordinates", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      const result = await WeatherService.getWeather({
        lat: 37.7749,
        lon: -122.4194,
      });

      expect(result).toEqual({
        location: "San Francisco",
        currentCondition: "scattered clouds",
        temperature: {
          value: 293,
          feelsLike: 292,
          type: "hot",
        },
        alerts: null,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Failed to fetch weather data");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle invalid API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Invalid weather data received");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle missing temperature data", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "San Francisco",
            main: {
              feels_like: 292.15,
              humidity: 65,
            },
            weather: [
              {
                description: "scattered clouds",
              },
            ],
          }),
      });

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Invalid weather data received");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle missing feels_like data", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "San Francisco",
            main: {
              temp: 293.15,
              humidity: 65,
            },
            weather: [
              {
                description: "scattered clouds",
              },
            ],
          }),
      });

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Invalid weather data received");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle missing weather description", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "San Francisco",
            main: {
              temp: 293.15,
              feels_like: 292.15,
              humidity: 65,
            },
            weather: [],
          }),
      });

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Invalid weather data received");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });

    it("should handle missing location name", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            main: {
              temp: 293.15,
              feels_like: 292.15,
              humidity: 65,
            },
            weather: [
              {
                description: "scattered clouds",
              },
            ],
          }),
      });

      await expect(
        WeatherService.getWeather({
          lat: 37.7749,
          lon: -122.4194,
        })
      ).rejects.toThrow("Invalid weather data received");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=37.7749&lon=-122.4194")
      );
    });
  });
});
