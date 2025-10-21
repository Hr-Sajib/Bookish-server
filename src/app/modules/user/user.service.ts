import { IUser } from "./user.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import UserModel from "./user.model";
import AppError from "../../errors/appError";
import config from "../../config";
import { sendMail, sendResetPasswordEmailOTP } from "../../utils/emailing";
import { email } from "zod";

// ----------------------------------------------------------------
// CREATE USER
// ----------------------------------------------------------------
const createUserIntoDB = async (payload: IUser & { image?: string }) => {
  // ✅ Generate OTP
  const otpCode = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
  const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins later

  // ✅ Create user with OTP data
  const newUser = await UserModel.create({
    ...payload,
    otp: {
      otpCode,
      otpExpireTime,
    },
  });

  if (!newUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create user!");
  }

  // ✅ Prepare email content
  const subject = "Welcome to Bookish – Verify Your Email";
  const text = `Your verification OTP is ${otpCode}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome to Bookish 👋</h2>
      <p>Hi ${newUser.userName || "User"},</p>
      <p>Thank you for registering. Please verify your email using the OTP below:</p>
      <h3 style="color: #4CAF50; font-size: 24px; letter-spacing: 3px;">${otpCode}</h3>
      <p>This OTP will expire in <b>10 minutes</b>.</p>
      <br/>
      <p>— The Bookish Team</p>
    </div>
  `;

  try {
    await sendMail({
      to: newUser.email,
      subject,
      text,
      html,
    });
    console.log(`✅ OTP email sent successfully to ${newUser.email}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
  }

  return newUser;
};


const verifyUserFromDB = async (email: string, otp: number)=>{
  const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.otp.otpCode || !user.otp.otpExpireTime) {
      throw new AppError(httpStatus.BAD_REQUEST, 'No OTP request found');
    }

    const isExpired = new Date() > new Date(user.otp.otpExpireTime);
    if (isExpired) {
      throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }

    if (user.otp.otpCode !== otp) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP code');
    }

    // ✅ OTP matched and valid — clear otp and verify user
    user.isVerified = true;
    user.otp = { otpCode: null, otpExpireTime: '' };

    await user.save();

    return user;
}


// ----------------------------------------------------------------
// GET ALL USERS (non-deleted)
// ----------------------------------------------------------------
const getAllUsersFromDB = async () => {
  const users = await UserModel.find({ isDeleted: false , role: {$ne: 'admin'}}).select("-password");
  return users;
};

// // ----------------------------------------------------------------
// // GET SINGLE USER BY ID
// // ----------------------------------------------------------------
const getUserByIdFromDB = async (userId: string) => {
  const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  return user;
};

// // ----------------------------------------------------------------
// // GET ME (based on decoded user info)
// // ----------------------------------------------------------------
const getMeFromDB = async (email: string) => {

  console.log("email: ",email)
  const user = await UserModel.findOne({ email }).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  return user;
};

// // ----------------------------------------------------------------
// // UPDATE USER (non-password fields only)
// // ----------------------------------------------------------------
const updateUserData = async (
  role: string,
  id: string,
  userEmail: string,
  updates: Partial<IUser>
) => {
  const userData = await UserModel.findById(id);
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Access control
  if (role !== "admin" && userData.email !== userEmail) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: You can only update your own profile."
    );
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update user data!");
  }

  return updatedUser;
};

// // ----------------------------------------------------------------
// // SOFT DELETE USER
// // ----------------------------------------------------------------
const softDeleteUserInDB = async (userId: string) => {
  const user = await UserModel.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found or already deleted!");
  }

  const deletedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { isDeleted: true } },
    { new: true }
  );

  return deletedUser;
};


// ----------------------------------------------------------------
// SEND RESET PASSWORD OTP
// ----------------------------------------------------------------
const sendResetPasswordOTP = async (userEmail: string) => {
  const user = await UserModel.findOne({ email: userEmail, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Update passwordResetOtp field
  await UserModel.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        "passwordResetOtp.otpCode": otpCode,
        "passwordResetOtp.otpExpireTime": otpExpireTime
      }
    },
    { new: true }
  );

  try {
    await sendResetPasswordEmailOTP(userEmail, otpCode.toString());
    console.log(`✅ Password reset OTP sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("❌ Failed to send password reset OTP email:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP email!");
  }

  return { message: "Password reset OTP sent successfully" };
};

// ----------------------------------------------------------------
// RESET PASSWORD WITH OTP
// ----------------------------------------------------------------
const resetPasswordWithTokenAndOTP = async (
  userEmail: string,
  otp: string,
  newPassword: string
) => {
  const user = await UserModel.findOne({ email: userEmail, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Validate OTP existence
  if (!user.passwordResetOtp?.otpCode || !user.passwordResetOtp?.otpExpireTime) {
    throw new AppError(httpStatus.BAD_REQUEST, "No password reset OTP request found!");
  }

  // Check OTP expiration
  const otpExpireTime = new Date(user.passwordResetOtp.otpExpireTime);
  const isExpired = Date.now() > otpExpireTime.getTime();
  if (isExpired) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password reset OTP has expired!");
  }

  // Verify OTP
  if (user.passwordResetOtp.otpCode.toString() !== otp.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP!");
  }

  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, "New password must be at least 6 characters long!");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  // Update user with new password and clear OTP
  const updatedUser = await UserModel.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        password: hashedPassword,
        "passwordResetOtp.otpCode": null,
        "passwordResetOtp.otpExpireTime": null,
      },
    },
    { new: true, select: "-password" }
  );

  if (!updatedUser) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to reset password!");
  }

  return updatedUser;
};

// ----------------------------------------------------------------
// EXPORT
// ----------------------------------------------------------------
export const userServices = {
  createUserIntoDB,
  verifyUserFromDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  getMeFromDB,
  updateUserData,
  softDeleteUserInDB,
  sendResetPasswordOTP,
  resetPasswordWithTokenAndOTP,
};
