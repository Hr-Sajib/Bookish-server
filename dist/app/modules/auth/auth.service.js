"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const appError_1 = __importDefault(require("../../errors/appError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const user_model_1 = __importDefault(require("../user/user.model"));
const http_status_1 = __importDefault(require("http-status"));
const auth_utils_1 = require("../../utils/auth.utils");
const redis_client_1 = __importDefault(require("../../redis/redis.client"));
const loginUserIntoDB = async (payload) => {
    const user = await user_model_1.default.findOne({ email: payload.email });
    if (!user) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User not found");
    }
    const isPasswordValid = await bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid password");
    }
    const jwtPayload = {
        email: user.email,
        userId: user._id,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    // 4️⃣ Store refresh token in Redis
    await redis_client_1.default.set(`user:${user._id}:refreshToken`, refreshToken, "EX", 7 * 24 * 60 * 60 // 7 days in seconds
    );
    console.log(`[LoginService][Redis] Refresh token stored for user:${user._id}`);
    return {
        accessToken,
        refreshToken,
        user,
    };
};
const refreshAccessToken = async (refreshToken) => {
    try {
        // 1️⃣ Verify refresh token
        const decoded = (0, auth_utils_1.verifyToken)(refreshToken, config_1.default.jwt_refresh_secret);
        const userId = decoded.userId;
        // 2️⃣ Check if user exists
        const user = await user_model_1.default.findById(userId);
        if (!user)
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User not found");
        // 3️⃣ Verify refresh token in Redis
        const storedToken = await redis_client_1.default.get(`user:${userId}:refreshToken`);
        console.log("[RefreshService][Redis] Stored refresh token:", storedToken ? storedToken.slice(0, 10) + "..." : "none");
        if (!storedToken || storedToken !== refreshToken) {
            console.log("[RefreshService] Refresh token mismatch!");
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid refresh token");
        }
        console.log("[RefreshService] Refresh token verified in Redis");
        // 4️⃣ Generate new access token
        const jwtPayload = {
            email: user.email,
            userId: user._id,
            role: user.role,
        };
        const newAccessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
        return { accessToken: newAccessToken };
    }
    catch (error) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid or expired refresh token");
    }
};
const logoutUser = async (userId) => {
    console.log("user logged out : ", userId);
    try {
        // Delete refresh token from Redis
        const deleted = await redis_client_1.default.del(`user:${userId}:refreshToken`);
        console.log(`[LogoutService][Redis] Refresh token for user:${userId} ${deleted ? "deleted" : "not found"}`);
        if (!deleted) {
            console.log(`[LogoutService] No refresh token found for user:${userId}`);
        }
        return { message: "User logged out successfully" };
    }
    catch (error) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to log out user");
    }
};
exports.AuthService = {
    loginUserIntoDB,
    refreshAccessToken,
    logoutUser,
};
