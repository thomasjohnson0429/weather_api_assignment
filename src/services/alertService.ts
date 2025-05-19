import { Alert } from "../types/alert";
import redisClient from "./redisClient";

export class AlertService {
  // Initialize Redis connection
  public static async initialize(): Promise<void> {
    try {
      // No initialization needed anymore
    } catch (error) {
      console.error("Failed to initialize AlertService:", error);
      throw error;
    }
  }

  private static async isPointInPolygon(
    point: [number, number],
    polygon: number[][][]
  ): Promise<boolean> {
    const [lat, lon] = point; // point is [latitude, longitude]
    let inside = false;

    // Get the first polygon (outer ring)
    const outerRing = polygon[0];

    for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
      const [yi, xi] = outerRing[i]; // [latitude, longitude]
      const [yj, xj] = outerRing[j]; // [latitude, longitude]

      // Check if point is on the edge
      if (xi === lon && yi === lat) {
        return true;
      }

      const intersect =
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  public static async saveAlert(alert: Alert): Promise<void> {
    const alertKey = `alert:${alert.alert.id}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const ttlSeconds = alert.end - currentTime;

    // Save the alert data with expiration in a single atomic operation
    if (ttlSeconds > 0) {
      await redisClient.setEx(alertKey, ttlSeconds, JSON.stringify(alert));
    } else {
      // If TTL is 0 or negative, just set without expiration
      await redisClient.set(alertKey, JSON.stringify(alert));
    }
  }

  public static async getAlertsForLocation(
    lat: number,
    lon: number,
    currentTime: number
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Get all alert keys
    const alertKeys = await redisClient.keys("alert:*");

    if (alertKeys.length === 0) {
      return alerts;
    }

    for (const alertKey of alertKeys) {
      const alertData = await redisClient.get(alertKey);

      if (!alertData) {
        continue;
      }

      const alert: Alert = JSON.parse(alertData);
      const isActive = currentTime >= alert.start && currentTime <= alert.end;

      if (isActive) {
        // Check if the point is within the polygon
        const isInPolygon = await this.isPointInPolygon(
          [lat, lon], // Pass as [latitude, longitude]
          alert.alert.geometry.coordinates
        );

        if (isInPolygon) {
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }
}
