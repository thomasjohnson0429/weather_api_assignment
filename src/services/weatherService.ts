import { WeatherRequest, WeatherResponse } from "../types/weather";

const API_KEY = "8da5a56a109e90d6f22e0f29cc8f15d3";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export class WeatherService {
  private static async fetchWeatherData(
    params: WeatherRequest
  ): Promise<WeatherResponse> {
    const { lat, lon } = params;
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WeatherResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch weather data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  public static async getWeather(
    params: WeatherRequest
  ): Promise<WeatherResponse> {
    return this.fetchWeatherData(params);
  }
}
