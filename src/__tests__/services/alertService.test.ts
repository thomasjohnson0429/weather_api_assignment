import { AlertService } from "../../services/alertService";
import redisClient from "../../services/redisClient";
import { Alert } from "../../types/alert";

// Mock Redis client
jest.mock("../../services/redisClient", () => ({
  __esModule: true,
  default: {
    setEx: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    keys: jest.fn(),
  },
}));

describe("AlertService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveAlert", () => {
    const mockAlert: Alert = {
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
      msg_type: "Alert",
      categories: ["Met"],
      urgency: "Immediate",
      severity: "Extreme",
      certainty: "Observed",
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      sender: "test-sender",
      description: [
        {
          language: "en",
          event: "Test Event",
          headline: "Test Headline",
          description: "Test Description",
          instruction: "Test Instruction",
        },
      ],
    };

    it("should save alert with expiration", async () => {
      await AlertService.saveAlert(mockAlert);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `alert:${mockAlert.alert.id}`,
        expect.any(Number),
        JSON.stringify(mockAlert)
      );
    });

    it("should handle expired alerts", async () => {
      const expiredAlert = {
        ...mockAlert,
        end: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      await AlertService.saveAlert(expiredAlert);
      expect(redisClient.set).toHaveBeenCalledWith(
        `alert:${expiredAlert.alert.id}`,
        JSON.stringify(expiredAlert)
      );
      expect(redisClient.setEx).not.toHaveBeenCalled();
    });
  });

  describe("getAlertsForLocation", () => {
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
        msg_type: "Alert",
        categories: ["Met"],
        urgency: "Immediate",
        severity: "Extreme",
        certainty: "Observed",
        start: Math.floor(Date.now() / 1000) - 1800,
        end: Math.floor(Date.now() / 1000) + 1800,
        sender: "test-sender",
        description: [
          {
            language: "en",
            event: "Test Event",
            headline: "Test Headline",
            description: "Test Description",
            instruction: "Test Instruction",
          },
        ],
      },
    ];

    beforeEach(() => {
      (redisClient.keys as jest.Mock).mockResolvedValue(["alert:test-alert-1"]);
      (redisClient.get as jest.Mock).mockResolvedValue(
        JSON.stringify(mockAlerts[0])
      );
    });

    it("should return alerts for location within polygon", async () => {
      const alerts = await AlertService.getAlertsForLocation(
        37.77, // lat
        -122.41, // lon
        Math.floor(Date.now() / 1000)
      );

      expect(alerts).toHaveLength(1);
      expect(alerts[0].alert.id).toBe("test-alert-1");
    });

    it("should return empty array when no alerts found", async () => {
      (redisClient.keys as jest.Mock).mockResolvedValue([]);

      const alerts = await AlertService.getAlertsForLocation(
        37.77,
        -122.41,
        Math.floor(Date.now() / 1000)
      );

      expect(alerts).toHaveLength(0);
    });

    it("should filter out inactive alerts", async () => {
      const inactiveAlert = {
        ...mockAlerts[0],
        end: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      (redisClient.get as jest.Mock).mockResolvedValue(
        JSON.stringify(inactiveAlert)
      );

      const alerts = await AlertService.getAlertsForLocation(
        37.77,
        -122.41,
        Math.floor(Date.now() / 1000)
      );

      expect(alerts).toHaveLength(0);
    });

    it("should filter out alerts outside polygon", async () => {
      const alerts = await AlertService.getAlertsForLocation(
        40.0, // lat (outside polygon)
        -122.41, // lon
        Math.floor(Date.now() / 1000)
      );

      expect(alerts).toHaveLength(0);
    });
  });

  describe("isPointInPolygon", () => {
    const polygon = [
      [
        [37.7749, -122.4194],
        [37.7749, -122.4094],
        [37.7649, -122.4094],
        [37.7649, -122.4194],
      ],
    ];

    it("should return true for point inside polygon", async () => {
      const isInside = await AlertService["isPointInPolygon"](
        [37.77, -122.41],
        polygon
      );
      expect(isInside).toBe(true);
    });

    it("should return false for point outside polygon", async () => {
      const isInside = await AlertService["isPointInPolygon"](
        [40.0, -122.41],
        polygon
      );
      expect(isInside).toBe(false);
    });

    it("should return true for point on polygon vertex", async () => {
      const isInside = await AlertService["isPointInPolygon"](
        [37.7749, -122.4194],
        polygon
      );
      expect(isInside).toBe(true);
    });

    it("should handle complex polygon shapes", async () => {
      const complexPolygon = [
        [
          [37.7749, -122.4194],
          [37.7749, -122.4094],
          [37.7649, -122.4094],
          [37.7649, -122.4194],
          [37.7699, -122.4144], // Additional point creating a more complex shape
          [37.7749, -122.4194],
        ],
      ];

      const isInside = await AlertService["isPointInPolygon"](
        [37.77, -122.41],
        complexPolygon
      );
      expect(isInside).toBe(true);
    });
  });
});
