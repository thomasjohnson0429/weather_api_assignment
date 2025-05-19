import { createClient } from "redis";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Initialize Redis connection
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log("Redis client connected");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

// Export the Redis client instance
export default redisClient;
