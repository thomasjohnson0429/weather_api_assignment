import { Request, Response } from "express";
import { AlertService } from "../services/alertService";
import { AlertRequest } from "../types/alert";

export class AlertController {
  public static async createAlert(
    req: Request<{}, {}, AlertRequest>,
    res: Response
  ) {
    try {
      const { alert } = req.body;

      if (!alert) {
        return res.status(400).json({ error: "Alert data is required" });
      }

      // Validate required alert fields
      if (!alert.alert?.id || !alert.alert?.geometry?.coordinates) {
        return res
          .status(400)
          .json({ error: "Invalid alert data: missing required fields" });
      }

      // Validate geometry
      if (
        !Array.isArray(alert.alert.geometry.coordinates) ||
        !Array.isArray(alert.alert.geometry.coordinates[0]) ||
        alert.alert.geometry.coordinates[0].length < 3
      ) {
        return res
          .status(400)
          .json({ error: "Invalid alert data: invalid geometry" });
      }

      await AlertService.saveAlert(alert);
      res.status(201).json({ message: "Alert created successfully" });
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({
        error: "Failed to create alert",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
