import Razorpay from "razorpay";

let instance = null;

// Lazily constructed so the app can still boot (e.g. in dev without payment
// keys configured) — routes that need it will throw a clear error instead.
export const getRazorpay = () => {
  if (instance) return instance;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
};
