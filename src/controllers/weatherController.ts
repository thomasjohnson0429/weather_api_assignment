import { Request, Response } from "express";
import { WeatherService } from "../services/weatherService";
import { WeatherRequest } from "../types/weather";

export class WeatherController {
  public static async getWeather(
    req: Request<{}, {}, {}, WeatherRequest>,
    res: Response
  ) {
    try {
      const { lat, lon } = req.query;

      // Validate query parameters
      if (!lat || !lon) {
        return res
          .status(400)
          .json({ error: "Latitude and longitude are required" });
      }

      const weatherData = await WeatherService.getWeather({
        lat: Number(lat),
        lon: Number(lon),
      });

      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
