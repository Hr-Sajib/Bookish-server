"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middleware/notFound"));
const app = (0, express_1.default)();
// ✅ CORS config — allow all origins safely (works with credentials)
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        callback(null, true); // allow all origins dynamically
    },
    credentials: true,
    exposedHeaders: ["Card-Number"],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/v1", routes_1.default);
app.get("/", (req, res) => {
    res.send("Bookish app server running!");
});
app.use(globalErrorHandler_1.default);
// Not Found
app.use(notFound_1.default);
exports.default = app;
