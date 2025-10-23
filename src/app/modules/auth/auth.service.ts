import AppError from "../../errors/appError";
import bcrypt from "bcrypt";
import config from "../../config";
import UserModel from "../user/user.model";
import httpStatus from "http-status";
import { createToken, verifyToken } from "../../utils/auth.utils";
import redis from "../../redis/redis.client";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await UserModel.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  const jwtPayload = {
    email: user.email,
    userId: user._id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  // 4️⃣ Store refresh token in Redis
  await redis.set(
    `user:${user._id}:refreshToken`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60 // 7 days in seconds
  );
  console.log(`[LoginService][Redis] Refresh token stored for user:${user._id}`);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  try {
    // 1️⃣ Verify refresh token
    const decoded = verifyToken(refreshToken, config.jwt_refresh_secret as string);
    const userId = decoded.userId;

    // 2️⃣ Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

    // 3️⃣ Verify refresh token in Redis
    const storedToken = await redis.get(`user:${userId}:refreshToken`);
    console.log("[RefreshService][Redis] Stored refresh token:", storedToken ? storedToken.slice(0, 10) + "..." : "none");

    if (!storedToken || storedToken !== refreshToken) {
      console.log("[RefreshService] Refresh token mismatch!");
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
    console.log("[RefreshService] Refresh token verified in Redis");


    // 4️⃣ Generate new access token
    const jwtPayload = {
      email: user.email,
      userId: user._id,
      role: user.role,
    };

    const newAccessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }
};

const logoutUser = async (userId: string) => {

  console.log("user logged out : ", userId)
  try {
    // Delete refresh token from Redis
    const deleted = await redis.del(`user:${userId}:refreshToken`);
    console.log(`[LogoutService][Redis] Refresh token for user:${userId} ${deleted ? "deleted" : "not found"}`);

    if (!deleted) {
      console.log(`[LogoutService] No refresh token found for user:${userId}`);
    }

    return { message: "User logged out successfully" };
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to log out user");
  }
};

export const AuthService = {
  loginUserIntoDB,
  refreshAccessToken,
  logoutUser,
};