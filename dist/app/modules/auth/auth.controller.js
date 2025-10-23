"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const auth_service_1 = require("./auth.service");
const config_1 = __importDefault(require("../../config"));
const appError_1 = __importDefault(require("../../errors/appError"));
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const { accessToken, refreshToken, user } = await auth_service_1.AuthService.loginUserIntoDB(req.body);
    // refresh token 
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === "production", // only over HTTPS in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // access token
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully!",
        data: user,
    });
});
const refreshAccessToken = (0, catchAsync_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "No refresh token provided");
    }
    const { accessToken } = await auth_service_1.AuthService.refreshAccessToken(refreshToken);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Access token refreshed successfully!",
        data: { accessToken },
    });
});
const logout = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User not authenticated");
    }
    await auth_service_1.AuthService.logoutUser(userId);
    // Clear cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === "production",
        sameSite: "strict",
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged out successfully!",
        data: null,
    });
});
exports.AuthController = {
    loginUser,
    refreshAccessToken,
    logout,
};
