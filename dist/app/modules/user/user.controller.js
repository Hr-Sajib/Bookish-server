"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = require("./user.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const appError_1 = __importDefault(require("../../errors/appError"));
// Create a new user
const createUser = (0, catchAsync_1.default)(async (req, res) => {
    const payload = req.body;
    // const filePath = req.file?.path; // If you support file uploads
    const newUser = await user_service_1.userServices.createUserIntoDB({
        ...payload,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "User created successfully",
        data: newUser,
    });
});
const verifyUser = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const newUser = await user_service_1.userServices.verifyUserFromDB(email, otp);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "User verified successfully",
        data: newUser,
    });
});
// // Get all users
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const users = await user_service_1.userServices.getAllUsersFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All users fetched successfully",
        data: users,
    });
});
// Get logged in users
const getLoggedInUsers = (0, catchAsync_1.default)(async (req, res) => {
    const user = await user_service_1.userServices.getLoggedInUsersFromRedis();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Logged in users fetched successfully",
        data: user,
    });
});
// Get user by ID
const getUserById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const user = await user_service_1.userServices.getUserByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User fetched successfully",
        data: user,
    });
});
const getMe = (0, catchAsync_1.default)(async (req, res) => {
    const email = req.user?.email;
    if (!email)
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User phone missing from token!");
    console.log("in ctrl : ", email);
    const user = await user_service_1.userServices.getMeFromDB(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: user,
    });
});
// // Update user (except password)
const updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { email, password, isVerified, isDeleted, role, otp, ...updatableData } = req.body;
    const userEmail = req.user.email;
    const loggedInUserRole = req.user.role;
    const updatedUser = await user_service_1.userServices.updateUserData(loggedInUserRole, id, userEmail, {
        ...updatableData,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User data updated successfully",
        data: updatedUser,
    });
});
// Soft delete user with role-based authorization
const softDeleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { role, userId: loggedInUserId } = req.user; // set by auth middleware
    // Authorization check
    if (role !== "admin" && id !== loggedInUserId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to delete this user");
    }
    const deletedUser = await user_service_1.userServices.softDeleteUserInDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
    });
});
// Send OTP for password reset (public endpoint)
const sendResetPasswordOTPController = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Email is required!");
    }
    const result = await user_service_1.userServices.sendResetPasswordOTP(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
// Reset password using OTP (public endpoint)
const resetPasswordWithOTPController = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Email, OTP, and new password are required!");
    }
    // Basic client-side validation (service has more robust checks)
    if (typeof otp !== "string" || otp.length !== 6 || isNaN(Number(otp))) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "OTP must be a 6-digit number string!");
    }
    if (newPassword.length < 6) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "New password must be at least 6 characters long!");
    }
    const updatedUser = await user_service_1.userServices.resetPasswordWithTokenAndOTP(email, otp, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset successfully",
        data: updatedUser,
    });
});
exports.userController = {
    createUser,
    verifyUser,
    updateUser,
    getLoggedInUsers,
    softDeleteUser,
    getAllUsers,
    getUserById,
    getMe,
    sendResetPasswordOTPController,
    resetPasswordWithOTPController,
};
