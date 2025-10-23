"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.AuthValidations.loginValidationSchema), auth_controller_1.AuthController.loginUser);
router.post("/refresh-token", auth_controller_1.AuthController.refreshAccessToken);
router.post("/logout", (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), auth_controller_1.AuthController.logout);
exports.AuthRoutes = router;
