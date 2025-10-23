"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
let server = null;
// Database connection
async function connectToDatabase() {
    try {
        await mongoose_1.default.connect(config_1.default.db_url);
        console.log("🛢 Database connected successfully");
    }
    catch (err) {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    }
}
// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Closing server...`);
    if (server) {
        server.close(() => {
            console.log("HTTP server closed gracefully");
            mongoose_1.default.connection.close()
                .then(() => {
                console.log("MongoDB connection closed");
                process.exit(0);
            })
                .catch((err) => {
                console.error("Error closing MongoDB connection:", err);
                process.exit(1);
            });
        });
    }
    else {
        mongoose_1.default.connection.close()
            .then(() => {
            console.log("MongoDB connection closed");
            process.exit(0);
        })
            .catch((err) => {
            console.error("Error closing MongoDB connection:", err);
            process.exit(1);
        });
    }
}
// Application bootstrap
async function bootstrap() {
    try {
        await connectToDatabase();
        // Create HTTP server
        server = new http_1.Server(app_1.default);
        const port = Number(config_1.default.port) || 5100;
        server.listen(port, "0.0.0.0", () => {
            console.log(`\n🚀 Bookish server running in port ${port}`);
        });
        // Listen for termination signals
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        // Error handling
        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            gracefulShutdown("uncaughtException");
        });
        process.on("unhandledRejection", (error) => {
            console.error("Unhandled Rejection:", error);
            gracefulShutdown("unhandledRejection");
        });
    }
    catch (error) {
        console.error("Error during bootstrap:", error);
        process.exit(1);
    }
}
// Start the application
bootstrap();
