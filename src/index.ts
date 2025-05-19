import express from "express";
import { createClient } from "redis";
import cors from "cors";
import dotenv from "dotenv";
import { WeatherController } from "./controllers/weatherController";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", async (req, res) => {
  try {
    await redisClient.set("test", "Hello from Redis!");
    const value = await redisClient.get("test");
    res.json({ message: "Welcome to the API", redisValue: value });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Weather endpoint
app.get("/weather", WeatherController.getWeather);

// Start server
const startServer = async () => {
  try {
    await redisClient.connect();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
