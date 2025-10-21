// route file (updated with uncommented and perfected password reset routes)
import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserRole } from "./user.interface";
import validateRequest from "../../middleware/validateRequest";
import { UserValidations } from "./user.validation";

const router = Router();

// Create user (public)
router.post("/", validateRequest(UserValidations.createUserValidationSchema), userController.createUser);

// Verify user with OTP (public)
router.post("/verifyUser", userController.verifyUser);

// Get all users (admin only - uncomment auth if needed)
router.get(
  "/",
  // auth(UserRole.ADMIN),
  userController.getAllUsers
);

// Get currently logged-in users (admin only)
router.get(
  "/logged-in-users",
  auth(UserRole.ADMIN),          
  userController.getLoggedInUsers
);


// Get current user (authenticated)
router.get("/getMe", 
  auth(UserRole.USER, UserRole.ADMIN),
  userController.getMe
);

// Get single user by ID (public or adjust auth as needed)
router.get("/:id", userController.getUserById);

// Update user (authenticated, own profile or admin)
router.patch(
  "/:id",
  validateRequest(UserValidations.updateUserValidationSchema), 
  auth(UserRole.ADMIN, UserRole.USER),
  userController.updateUser
);

// Soft delete user (admin only - add auth if needed)
router.delete("/:id", auth(UserRole.ADMIN, UserRole.USER), userController.softDeleteUser);

// Send OTP for password reset (public)
router.post("/send-reset-otp", userController.sendResetPasswordOTPController);

// Reset password with OTP (public)
router.post("/reset-password-otp", userController.resetPasswordWithOTPController);

export const UserRoutes = router;