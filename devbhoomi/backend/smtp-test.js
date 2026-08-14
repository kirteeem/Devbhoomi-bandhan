import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_FROM,
    subject: "SMTP Test",
    text: "This is a test email",
  });

  console.log("✅ EMAIL SENT");
} catch (err) {
  console.error(err);
}