import Redis from "ioredis";
import config from "../config";

export const redis = new Redis({
  host: config.redis_host || "127.0.0.1",
  port: Number(config.redis_port) || 6379,
  password: config.redis_password || undefined,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

export default redis;
