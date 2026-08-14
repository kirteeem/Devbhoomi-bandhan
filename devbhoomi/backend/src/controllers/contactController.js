import { z } from "zod";
import ContactMessage from "../models/ContactMessage.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendEmail, PRIEST_REQUEST_EMAIL } from "../utils/email.js";
import { ok } from "../utils/apiResponse.js";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(1, "Please choose a subject"),
  message: z.string().trim().min(10, "Please share a few more details so we can help").max(2000),
});

// The support inbox that reviews every message submitted from the public
// Contact Us page. Reuses the same fixed address the priest/verification
// team already monitors, rather than introducing a second inbox to check.
const SUPPORT_INBOX = process.env.SUPPORT_EMAIL || PRIEST_REQUEST_EMAIL;

// POST /api/contact — public endpoint used by ContactUs.tsx.
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = contactMessageSchema.parse(req.body);

  const saved = await ContactMessage.create({
    name,
    email,
    phone: phone || undefined,
    subject,
    message,
    user: req.user?._id,
  });

  // Best-effort notification — if SMTP isn't configured, sendEmail already
  // falls back to logging instead of throwing, so a message is never lost
  // and the member still gets a success response either way.
  try {
    await sendEmail({
      to: SUPPORT_INBOX,
      subject: `New Contact Us message — ${subject}`,
      text: [
        `A new message was submitted via the Contact Us page.`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Subject: ${subject}`,
        ``,
        message,
      ].join("\n"),
      html: `
        <p>A new message was submitted via the Contact Us page.</p>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone || "—"}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${subject}</td></tr>
        </table>
        <p>${message}</p>
      `,
    });
  } catch (emailErr) {
    // Never fail the request just because notification email delivery
    // failed — the message is already safely saved in the database.
    console.error("[contact] failed to send notification email:", emailErr);
  }

  ok(
    res,
    { id: saved._id },
    "Thanks for reaching out! A relationship manager will get back to you within 2-4 business hours.",
    201
  );
});
