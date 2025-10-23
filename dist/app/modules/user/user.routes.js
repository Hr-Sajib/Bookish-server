"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
// route file (updated with uncommented and perfected password reset routes)
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_interface_1 = require("./user.interface");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
// Create user (public)
router.post("/", (0, validateRequest_1.default)(user_validation_1.UserValidations.createUserValidationSchema), user_controller_1.userController.createUser);
// Verify user with OTP (public)
router.post("/verifyUser", user_controller_1.userController.verifyUser);
// Get all users (admin only - uncomment auth if needed)
router.get("/", 
// auth(UserRole.ADMIN),
user_controller_1.userController.getAllUsers);
// Get currently logged-in users (admin only)
router.get("/logged-in-users", (0, auth_1.default)(user_interface_1.UserRole.ADMIN), user_controller_1.userController.getLoggedInUsers);
// Get current user (authenticated)
router.get("/getMe", (0, auth_1.default)(user_interface_1.UserRole.USER, user_interface_1.UserRole.ADMIN), user_controller_1.userController.getMe);
// Get single user by ID (public or adjust auth as needed)
router.get("/:id", user_controller_1.userController.getUserById);
// Update user (authenticated, own profile or admin)
router.patch("/:id", (0, validateRequest_1.default)(user_validation_1.UserValidations.updateUserValidationSchema), (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), user_controller_1.userController.updateUser);
// Soft delete user (admin only - add auth if needed)
router.delete("/:id", (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), user_controller_1.userController.softDeleteUser);
// Send OTP for password reset (public)
router.post("/send-reset-otp", user_controller_1.userController.sendResetPasswordOTPController);
// Reset password with OTP (public)
router.post("/reset-password-otp", user_controller_1.userController.resetPasswordWithOTPController);
exports.UserRoutes = router;
