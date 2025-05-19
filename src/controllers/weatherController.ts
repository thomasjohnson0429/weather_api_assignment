import { Request, Response } from "express";
import { WeatherService } from "../services/weatherService";
import { WeatherRequest } from "../types/weather";
import { AlertService } from "../services/alertService";

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

      // Validate coordinate format
      const latitude = Number(lat);
      const longitude = Number(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res
          .status(400)
          .json({ error: "Invalid coordinates: must be numbers" });
      }

      // Get weather data
      const weatherData = await WeatherService.getWeather({
        lat: latitude,
        lon: longitude,
      });

      // Get alerts for location
      const currentTime = Math.floor(Date.now() / 1000);
      const alerts = await AlertService.getAlertsForLocation(
        latitude,
        longitude,
        currentTime
      );

      // Combine weather data with alerts
      res.json({
        ...weatherData,
        alerts,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
