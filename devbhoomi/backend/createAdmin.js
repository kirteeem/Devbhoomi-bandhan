import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./src/models/User.js";

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({
  email: "admin@devbhoomibandhan.com",
});

if (existing) {
  console.log("Admin already exists");
  process.exit();
}

const admin = new User({
  fullName: "DevBhoomi Bandhan Admin",
  email: "admin@devbhoomibandhan.com",
  passwordHash: "Admin@12345",
  role: "admin",
  isEmailVerified: true,
});

await admin.save();

console.log("✅ Admin created");
process.exit();
