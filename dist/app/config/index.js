"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join((process.cwd(), ".env")) });
exports.default = {
    NODE_ENV: process.env.NODE_ENV,
    backend_url: process.env.BACKEND_URL,
    client_url: process.env.CLIENT_URL,
    port: process.env.PORT,
    db_url: process.env.DB_URL,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    jwt_otp_secret: process.env.JWT_OTP_SECRET,
    jwt_pass_reset_secret: process.env.JWT_PASS_RESET_SECRET,
    jwt_pass_reset_expires_in: process.env.JWT_PASS_RESET_EXPIRES_IN,
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    admin_profile_photo: process.env.ADMIN_PROFILE_PHOTO,
    admin_mobile_number: process.env.ADMIN_MOBILE_NUMBER,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    sender_email: process.env.SENDER_EMAIL,
    sender_app_password: process.env.SENDER_APP_PASS,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    email_user: process.env.EMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
    redis_password: process.env.REDIS_PASSWORD,
    aws: {
        aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
        aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
        aws_region: process.env.AWS_REGION,
        aws_s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
    },
    // smtp_host: process.env.SMTP_HOST,
    // smtp_port: process.env.SMTP_PORT,
    // email_user: process.env.HOSTINGER_USER,
    // email_password: process.env.HOSTINGER_EMAIL_PASSWORD,
    app_name: process.env.APP_NAME,
};
