import { WeatherRequest, ProcessedWeatherData } from "../types/weather";

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

  public static async getWeather(
    params: WeatherRequest
  ): Promise<ProcessedWeatherData> {
    const weatherData = await this.fetchWeatherData(params);

    const processedData: ProcessedWeatherData = {
      location: weatherData.name,
      currentCondition: weatherData.weather[0].description,
      temperature: {
        value: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        type: this.determineTemperatureType(weatherData.main.temp),
      },
      alerts: null, // Current weather endpoint doesn't provide alerts
    };

    return processedData;
  }
}
