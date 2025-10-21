import { Document, Types } from "mongoose";

// Enum for User Roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}


// User Schema Definition
export interface IUser extends Document {
  _id: Types.ObjectId;

  userName: string
  email: string;
  password: string;
  role: UserRole;

  phone: string;

  otp: {
    otpCode: number | null,
    otpExpireTime: string | null,
  }

  passwordResetOtp: {
    otpCode: number | null,
    otpExpireTime: string | null,
  }

  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean
}
