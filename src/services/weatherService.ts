import {
  WeatherRequest,
  ProcessedWeatherData,
  WeatherAlert,
} from "../types/weather";
import { AlertService } from "./alertService";
import { Alert } from "../types/alert";

const API_KEY = "8da5a56a109e90d6f22e0f29cc8f15d3";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export class WeatherService {
  private static async fetchWeatherData(params: WeatherRequest): Promise<any> {
    const { lat, lon } = params;
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log(url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch weather data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private static determineTemperatureType(
    temp: number
  ): "hot" | "cold" | "moderate" {
    if (temp >= 25) return "hot";
    if (temp <= 10) return "cold";
    return "moderate";
  }

  private static transformAlertToWeatherAlert(alert: Alert): WeatherAlert {
    return {
      sender_name: alert.sender,
      event: alert.description[0]?.event || "",
      start: alert.start,
      end: alert.end,
      description: alert.description[0]?.description || "",
      tags: alert.categories,
    };
  }

  private static validateWeatherData(data: any): void {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid weather data received");
    }

    if (!data.name || typeof data.name !== "string") {
      throw new Error("Invalid weather data received");
    }

    if (
      !data.weather ||
      !Array.isArray(data.weather) ||
      data.weather.length === 0
    ) {
      throw new Error("Invalid weather data received");
    }

    if (
      !data.weather[0].description ||
      typeof data.weather[0].description !== "string"
    ) {
      throw new Error("Invalid weather data received");
    }

    if (!data.main || typeof data.main !== "object") {
      throw new Error("Invalid weather data received");
    }

    if (typeof data.main.temp !== "number" || isNaN(data.main.temp)) {
      throw new Error("Invalid weather data received");
    }

    if (
      typeof data.main.feels_like !== "number" ||
      isNaN(data.main.feels_like)
    ) {
      throw new Error("Invalid weather data received");
    }
  }

  public static async getWeather(
    params: WeatherRequest
  ): Promise<ProcessedWeatherData> {
    const weatherData = await this.fetchWeatherData(params);
    this.validateWeatherData(weatherData);

    const currentTime = Math.floor(Date.now() / 1000);
    const alerts = await AlertService.getAlertsForLocation(
      params.lat,
      params.lon,
      currentTime
    );

    const processedData: ProcessedWeatherData = {
      location: weatherData.name,
      currentCondition: weatherData.weather[0].description,
      temperature: {
        value: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        type: this.determineTemperatureType(weatherData.main.temp),
      },
      alerts:
        alerts.length > 0
          ? alerts.map(this.transformAlertToWeatherAlert)
          : null,
    };

    return processedData;
  }
}
