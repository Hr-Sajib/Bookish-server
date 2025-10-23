"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
const http_status_1 = __importDefault(require("http-status"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)(async (req, res, next) => {
        // debugLog("Start", { endpoint: req.originalUrl, method: req.method });
        // Check for token presence
        const token = req.cookies?.accessToken;
        if (!token) {
            // debugLog("Error", { message: "No authorization token provided" });
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        try {
            // Verify token
            // debugLog("Token Verification", { action: "Attempting to verify JWT" });
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
            // Find user in database
            const { role, email } = decoded;
            // debugLog("User Lookup", { email, role });
            const user = await user_model_1.default.findOne({ email });
            if (!user) {
                throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user is not found!");
            }
            // Check required roles
            if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
                throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            // Attach user to request
            req.user = decoded;
            console.log("logged in user : ", decoded);
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                return next(new appError_1.default(http_status_1.default.UNAUTHORIZED, "Token has expired! Please login again."));
            }
            return next(new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token!"));
        }
    });
};
exports.default = auth;
