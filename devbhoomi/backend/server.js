import "dotenv/config";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middleware/errorHandler.js";
import { initSocket } from "./src/socket/index.js";

import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import matchRoutes from "./src/routes/matchRoutes.js";
import kundaliRoutes from "./src/routes/kundaliRoutes.js";
import priestRoutes from "./src/routes/priestRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import verificationRoutes from "./src/routes/verificationRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import testimonialRoutes from "./src/routes/testimonialRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import safetyRoutes from "./src/routes/safetyRoutes.js";

import { handleWebhook } from "./src/controllers/paymentController.js";

// ─────────────────────────────────────────────────────────────────────────────
// PATH SETUP
// ─────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "MONGO_URI:",
  process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌"
);

console.log("PORT:", process.env.PORT);

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────────────────────────────────────

await connectDB();

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS + HTTP SERVER
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// Enable proxy trust for deployment platforms like Render
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

console.log("Allowed CORS origins:", allowedOrigins);

// ─────────────────────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────────────────────

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io);

app.set("io", io);

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS CORS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an origin
    // Example: Postman, mobile apps, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(
      "CORS blocked request from origin:",
      origin,
      "— allowed origins are:",
      allowedOrigins
    );

    return callback(
      new Error(`CORS blocked: ${origin} is not an allowed origin`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options(/(.*)/, cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────────────
// HELMET SECURITY
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    crossOriginEmbedderPolicy: false,

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com",
          "https://avatar.iran.liara.run",
          "*",
        ],
      },
    },
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPRESSION
// ─────────────────────────────────────────────────────────────────────────────

app.use(compression());

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT WEBHOOK
// IMPORTANT: This must come before express.json()
// ─────────────────────────────────────────────────────────────────────────────

app.post(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  handleWebhook
);

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST PARSERS
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(mongoSanitize());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITERS
// ─────────────────────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many auth attempts, please try again later.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many OTP requests from this device, please try again later.",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// APPLY RATE LIMITERS
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/auth/otp", otpLimiter);

app.use("/api/auth/phone", otpLimiter);

app.use("/api/auth", authLimiter);

app.use("/api", apiLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "देवभूमि बंधन API is running",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);

app.use("/api/profiles", profileRoutes);

app.use("/api/matches", matchRoutes);

app.use("/api/kundali", kundaliRoutes);

app.use("/api/priest", priestRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/verification", verificationRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/testimonials", testimonialRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/safety", safetyRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// SERVE REACT / VITE FRONTEND
// ─────────────────────────────────────────────────────────────────────────────
//
// This assumes your frontend build creates:
//
// dist/
//   index.html
//   assets/
//
// If your frontend is React + Vite, run:
//
// npm run build
//
// before starting the production server.
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  express.static(
    path.join(__dirname, "dist")
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// REACT ROUTER FALLBACK
// ─────────────────────────────────────────────────────────────────────────────
//
// This fixes:
//
// /                 ✅
// /profile          ✅
// /matches          ✅
// /kundali          ✅
//
// and most importantly:
//
// Refresh /profile  → ✅
// Refresh /matches  → ✅
// Refresh /kundali  → ✅
//
// Express sends index.html and React Router handles the URL.
// ─────────────────────────────────────────────────────────────────────────────

app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "dist", "index.html")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

app.use(notFound);

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});