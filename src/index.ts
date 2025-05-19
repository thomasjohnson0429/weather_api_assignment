import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WeatherController } from "./controllers/weatherController";
import { AlertController } from "./controllers/alertController";
import { AlertService } from "./services/alertService";
import { initializeRedis } from "./services/redisClient";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", async (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Weather endpoint
app.get("/weather", WeatherController.getWeather);

// Alert endpoint
app.post("/alerts", AlertController.createAlert);

// Start server
const startServer = async () => {
  try {
    // Initialize Redis first
    await initializeRedis();

    // Initialize AlertService
    await AlertService.initialize();

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
