"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
exports.redis = new ioredis_1.default({
    host: config_1.default.redis_host || "127.0.0.1",
    port: Number(config_1.default.redis_port) || 6379,
    password: config_1.default.redis_password || undefined,
});
exports.redis.on("connect", () => console.log("✅ Redis connected"));
exports.redis.on("error", (err) => console.error("❌ Redis error:", err));
exports.default = exports.redis;
