import request from "supertest";
import express from "express";
import { AlertController } from "../../controllers/alertController";
import { AlertService } from "../../services/alertService";
import redisClient from "../../services/redisClient";

// Mock AlertService
jest.mock("../../services/alertService", () => ({
  AlertService: {
    saveAlert: jest.fn(),
  },
}));

describe("AlertController Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/alerts", AlertController.createAlert);
    jest.clearAllMocks();
  });

  describe("POST /alerts", () => {
    const mockAlert = {
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
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 3600,
    };

    it("should create a new alert", async () => {
      const response = await request(app)
        .post("/alerts")
        .send({ alert: mockAlert })
        .expect(201);

      expect(response.body).toEqual({ message: "Alert created successfully" });
      expect(AlertService.saveAlert).toHaveBeenCalledWith(mockAlert);
    });

    it("should return 400 for invalid alert data", async () => {
      const invalidAlert = {
        alert: {
          id: "test-alert-1",
          // Missing required geometry
        },
      };

      const response = await request(app)
        .post("/alerts")
        .send({ alert: invalidAlert })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for missing alert data", async () => {
      const response = await request(app).post("/alerts").send({}).expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
