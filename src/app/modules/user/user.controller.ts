import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { userServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/appError";

// Create a new user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  // const filePath = req.file?.path; // If you support file uploads

  const newUser = await userServices.createUserIntoDB({
    ...payload,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const {email, otp} = req.body;

  const newUser = await userServices.verifyUserFromDB(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User verified successfully",
    data: newUser,
  });
});


// // Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users fetched successfully",
    data: users,
  });
});

// Get logged in users
const getLoggedInUsers = catchAsync(async (req: Request, res: Response) => {
  const user = await userServices.getLoggedInUsersFromRedis();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in users fetched successfully",
    data: user,
  });
});


// Get user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userServices.getUserByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});


const getMe = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;
  if (!email) throw new AppError(httpStatus.UNAUTHORIZED, "User phone missing from token!");

  console.log("in ctrl : ", email)

  const user = await userServices.getMeFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: user,
  });
});

// // Update user (except password)
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {email, password, isVerified, isDeleted, role, otp, ...updatableData } = req.body;
  const userEmail = req.user.email;
  const loggedInUserRole = req.user.role;

  const updatedUser = await userServices.updateUserData(loggedInUserRole, id, userEmail, {
    ...updatableData,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data updated successfully",
    data: updatedUser,
  });
});



// Soft delete user with role-based authorization
const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, userId: loggedInUserId } = req.user; // set by auth middleware

  // Authorization check
  if (role !== "admin" && id !== loggedInUserId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to delete this user"
    );
  }

  const deletedUser = await userServices.softDeleteUserInDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});

// Send OTP for password reset (public endpoint)
const sendResetPasswordOTPController = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required!");
  }

  const result = await userServices.sendResetPasswordOTP(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Reset password using OTP (public endpoint)
const resetPasswordWithOTPController = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email, OTP, and new password are required!"
    );
  }

  // Basic client-side validation (service has more robust checks)
  if (typeof otp !== "string" || otp.length !== 6 || isNaN(Number(otp))) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP must be a 6-digit number string!");
  }

  if (newPassword.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, "New password must be at least 6 characters long!");
  }

  const updatedUser = await userServices.resetPasswordWithTokenAndOTP(
    email,
    otp,
    newPassword
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: updatedUser,
  });
});

export const userController = {
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
