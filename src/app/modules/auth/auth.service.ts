import AppError from "../../errors/appError";
import bcrypt from "bcrypt";
import config from "../../config";
import UserModel from "../user/user.model";
import httpStatus from "http-status";
import { createToken, verifyToken } from "../../utils/auth.utils";


const loginUserIntoDB = async (payload: { email: string; password: string }) => {

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

  return {
    accessToken,
    refreshToken,
    user
  };
};




// ✅ Refresh token logic
const refreshAccessToken = async (token: string) => {
  try {
    const decoded = verifyToken(token, config.jwt_refresh_secret as string);

    const user = await UserModel.findById(decoded.userId);
    if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

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


export const AuthService = {
  loginUserIntoDB,
  refreshAccessToken,
};