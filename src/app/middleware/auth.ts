import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import config from "../config";
import { UserRole } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/appError";
import status from "http-status";



const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // debugLog("Start", { endpoint: req.originalUrl, method: req.method });

    // Check for token presence
    const token = req.cookies?.accessToken;


    if (!token) {
      // debugLog("Error", { message: "No authorization token provided" });
      throw new AppError(status.UNAUTHORIZED, "You are not authorized!");
    }

    try {
      // Verify token
      // debugLog("Token Verification", { action: "Attempting to verify JWT" });
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;


      // Find user in database
      const { role, email } = decoded;
      // debugLog("User Lookup", { email, role });
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError(status.NOT_FOUND, "This user is not found!");
      }


      // Check required roles
      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {

        throw new AppError(status.UNAUTHORIZED, "You are not authorized!");
      }


      // Attach user to request
      req.user = decoded as JwtPayload & { role: string };

      console.log("logged in user : ", decoded)

      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(
          new AppError(
            status.UNAUTHORIZED,
            "Token has expired! Please login again."
          )
        );
      }

      return next(new AppError(status.UNAUTHORIZED, "Invalid token!"));
    }
  });
};

export default auth;