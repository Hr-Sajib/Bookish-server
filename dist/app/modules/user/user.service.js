"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("./user.model"));
const appError_1 = __importDefault(require("../../errors/appError"));
const config_1 = __importDefault(require("../../config"));
const emailing_1 = require("../../utils/emailing");
const redis_client_1 = __importDefault(require("../../redis/redis.client"));
// ----------------------------------------------------------------
// CREATE USER
// ----------------------------------------------------------------
const createUserIntoDB = async (payload) => {
    // ✅ Generate OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins later
    // ✅ Create user with OTP data
    const newUser = await user_model_1.default.create({
        ...payload,
        otp: {
            otpCode,
            otpExpireTime,
        },
    });
    if (!newUser) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create user!");
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
        await (0, emailing_1.sendMail)({
            to: newUser.email,
            subject,
            text,
            html,
        });
        console.log(`✅ OTP email sent successfully to ${newUser.email}`);
    }
    catch (error) {
        console.error("❌ Failed to send OTP email:", error);
    }
    return newUser;
};
const verifyUserFromDB = async (email, otp) => {
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!user.otp.otpCode || !user.otp.otpExpireTime) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'No OTP request found');
    }
    const isExpired = new Date() > new Date(user.otp.otpExpireTime);
    if (isExpired) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'OTP has expired');
    }
    if (user.otp.otpCode !== otp) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP code');
    }
    // ✅ OTP matched and valid — clear otp and verify user
    user.isVerified = true;
    user.otp = { otpCode: null, otpExpireTime: '' };
    await user.save();
    return user;
};
// ----------------------------------------------------------------
// GET ALL USERS (non-deleted)
// ----------------------------------------------------------------
const getAllUsersFromDB = async () => {
    const users = await user_model_1.default.find({ isDeleted: false, role: { $ne: 'admin' } }).select("-password");
    return users;
};
// // ----------------------------------------------------------------
// // GET SINGLE USER BY ID
// // ----------------------------------------------------------------
const getUserByIdFromDB = async (userId) => {
    const user = await user_model_1.default.findOne({ _id: userId, isDeleted: false }).select("-password");
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    return user;
};
// // ----------------------------------------------------------------
// // GET ME (based on decoded user info)
// // ----------------------------------------------------------------
const getMeFromDB = async (email) => {
    console.log("email: ", email);
    const user = await user_model_1.default.findOne({ email }).select("-password");
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    return user;
};
// // ----------------------------------------------------------------
// // UPDATE USER (non-password fields only)
// // ----------------------------------------------------------------
const updateUserData = async (role, id, userEmail, updates) => {
    const userData = await user_model_1.default.findById(id);
    if (!userData) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    // Access control
    if (role !== "admin" && userData.email !== userEmail) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized: You can only update your own profile.");
    }
    const updatedUser = await user_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password");
    if (!updatedUser) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update user data!");
    }
    return updatedUser;
};
// // ----------------------------------------------------------------
// // SOFT DELETE USER
// // ----------------------------------------------------------------
const softDeleteUserInDB = async (userId) => {
    const user = await user_model_1.default.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found or already deleted!");
    }
    const deletedUser = await user_model_1.default.findByIdAndUpdate(userId, { $set: { isDeleted: true } }, { new: true });
    return deletedUser;
};
// ----------------------------------------------------------------
// SEND RESET PASSWORD OTP
// ----------------------------------------------------------------
const sendResetPasswordOTP = async (userEmail) => {
    const user = await user_model_1.default.findOne({ email: userEmail, isDeleted: false });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    // Update passwordResetOtp field
    await user_model_1.default.findOneAndUpdate({ email: userEmail }, {
        $set: {
            "passwordResetOtp.otpCode": otpCode,
            "passwordResetOtp.otpExpireTime": otpExpireTime
        }
    }, { new: true });
    try {
        await (0, emailing_1.sendResetPasswordEmailOTP)(userEmail, otpCode.toString());
        console.log(`✅ Password reset OTP sent successfully to ${userEmail}`);
    }
    catch (error) {
        console.error("❌ Failed to send password reset OTP email:", error);
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to send OTP email!");
    }
    return { message: "Password reset OTP sent successfully" };
};
// ----------------------------------------------------------------
// RESET PASSWORD WITH OTP
// ----------------------------------------------------------------
const resetPasswordWithTokenAndOTP = async (userEmail, otp, newPassword) => {
    const user = await user_model_1.default.findOne({ email: userEmail, isDeleted: false });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    // Validate OTP existence
    if (!user.passwordResetOtp?.otpCode || !user.passwordResetOtp?.otpExpireTime) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "No password reset OTP request found!");
    }
    // Check OTP expiration
    const otpExpireTime = new Date(user.passwordResetOtp.otpExpireTime);
    const isExpired = Date.now() > otpExpireTime.getTime();
    if (isExpired) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password reset OTP has expired!");
    }
    // Verify OTP
    if (user.passwordResetOtp.otpCode.toString() !== otp.trim()) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Invalid OTP!");
    }
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "New password must be at least 6 characters long!");
    }
    // Hash new password
    const hashedPassword = await bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    // Update user with new password and clear OTP
    const updatedUser = await user_model_1.default.findOneAndUpdate({ email: userEmail }, {
        $set: {
            password: hashedPassword,
            "passwordResetOtp.otpCode": null,
            "passwordResetOtp.otpExpireTime": null,
        },
    }, { new: true, select: "-password" });
    if (!updatedUser) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to reset password!");
    }
    return updatedUser;
};
// ----------------------------------------------------------------
// GET LOGGED-IN USERS FROM REDIS
// ----------------------------------------------------------------
const getLoggedInUsersFromRedis = async () => {
    // 1️⃣ Fetch all keys related to user refresh tokens
    const keys = await redis_client_1.default.keys("user:*:refreshToken");
    if (!keys.length)
        return []; // no users logged in
    // 2️⃣ Extract user IDs from keys
    const userIds = keys.map((key) => key.split(":")[1]);
    console.log("logged in users : ", userIds);
    // 3️⃣ Fetch user data from MongoDB (only email and userName)
    const users = await user_model_1.default.find({ _id: { $in: userIds }, isDeleted: false })
        .select("email userName");
    // 4️⃣ Return as array of objects
    return users;
};
// ----------------------------------------------------------------
// EXPORT
// ----------------------------------------------------------------
exports.userServices = {
    createUserIntoDB,
    verifyUserFromDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    getMeFromDB,
    updateUserData,
    softDeleteUserInDB,
    sendResetPasswordOTP,
    resetPasswordWithTokenAndOTP,
    getLoggedInUsersFromRedis
};
