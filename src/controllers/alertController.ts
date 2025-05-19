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
