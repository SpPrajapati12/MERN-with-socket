import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log("📧 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"MERN App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (to: string, token: string) => {
  console.log("sendVerificationEmail called");
  console.log("To:", to);
  console.log("Token:", token);

  return sendEmail(
    to,
    "Verify Your Email",
    `<p>Click <a href="${process.env.CLIENT_URL}/verify-email/${token}">here</a> to verify your email.</p>`
  );
};
export const sendResetPasswordEmail = (to: string, token: string) =>
  sendEmail(
    to,
    "Reset Your Password",
    `<p>Click <a href="${process.env.CLIENT_URL}/reset-password/${token}">here</a> to reset your password. Link expires in 1 hour.</p>`
  );
