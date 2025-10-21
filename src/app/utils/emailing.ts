import nodemailer from "nodemailer";
import config from "../config";

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {

    console.log("user and pass: ", process.env.EMAIL_USER, process.env.EMAIL_PASS)
  const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: process.env.EMAIL_USER,  
                    pass: process.env.EMAIL_PASS,  
                },
            });

  const mailOptions = {
    from: `"Bookish" <${config.email_user}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions); 
};

export const sendResetPasswordEmailOTP = async (email: string, otp: string) => {
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
  await sendMail({ to: email, subject, text, html });
};