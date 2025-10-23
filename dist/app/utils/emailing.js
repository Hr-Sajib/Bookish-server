"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmailOTP = exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendMail = async ({ to, subject, text, html, }) => {
    console.log("user and pass: ", process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: `"Bookish" <${config_1.default.email_user}>`,
        to,
        subject,
        text,
        html,
    };
    await transporter.sendMail(mailOptions);
};
exports.sendMail = sendMail;
const sendResetPasswordEmailOTP = async (email, otp) => {
    const subject = "Your Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`;
    const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset</h2>
      <p>Your Password Reset OTP is:</p>
      <h3>${otp}</h3>
      <p>This OTP will expire in <b>10 minutes</b>.</p>
    </div>
  `;
    await (0, exports.sendMail)({ to: email, subject, text, html });
};
exports.sendResetPasswordEmailOTP = sendResetPasswordEmailOTP;
