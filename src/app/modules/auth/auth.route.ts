import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { AuthValidations } from "./auth.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post("/login", validateRequest(AuthValidations.loginValidationSchema), AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshAccessToken);
router.post("/logout",
    auth(UserRole.ADMIN, UserRole.USER),
    AuthController.logout);

export const AuthRoutes = router;