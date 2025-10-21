import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { AuthValidations } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(AuthValidations.loginValidationSchema), AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshAccessToken);

export const AuthRoutes = router;
