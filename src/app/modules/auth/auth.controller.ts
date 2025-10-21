import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import config from "../../config";
import AppError from "../../errors/appError";

const loginUser = catchAsync(async (req, res) => {

  const { accessToken, refreshToken, user } = await AuthService.loginUserIntoDB(req.body);

  // refresh token 
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production", // only over HTTPS in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // access token
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });


  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully!",
    data: user,
  });



});

const refreshAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "No refresh token provided");
  }

  const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Access token refreshed successfully!",
    data: { accessToken },
  });
});



export const AuthController = {
  loginUser,
  refreshAccessToken
};
