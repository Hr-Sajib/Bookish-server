import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    isVerified:{
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    
    otp: {
      otpCode: {
        type: Number,
        default: null
      },
      otpExpireTime: {
        type: String,
        default: null
      },
    },

    passwordResetOtp: {
      otpCode: {
        type: Number,
        default: null
      },
      otpExpireTime: {
        type: String,
        default: null
      },
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// hashing password before saving/creating
userSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) {
    return next();
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  user.password = await bcrypt.hash(user.password, saltRounds);

  next();
});

// hashing password before updating (findOneAndUpdate)
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Partial<IUser>;
  if (update && update.password) {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
    update.password = await bcrypt.hash(update.password, saltRounds);
    this.setUpdate(update);
  }
  next();
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
