import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Reuses up to 10 pooled sockets instead of opening a fresh TCP+TLS
      // connection to Atlas per request — the single biggest driver of
      // "every API call feels slow" on a free/small instance.
      maxPoolSize: 10,
      minPoolSize: 2,
      // Fail fast (5s) instead of the 30s default if Atlas is unreachable,
      // so a bad connection surfaces as a quick error, not a long hang.
      serverSelectionTimeoutMS: 5000,
      // Don't queue queries in memory while disconnected — surface the
      // error immediately instead of a mysterious hang.
      bufferCommands: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};