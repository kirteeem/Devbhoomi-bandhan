import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import User from "../models/User.js";


export const requirePremium = (req, res, next) => {
  if (!req.user.isPremium()) {
    res.status(403);
    throw new Error("This feature is available to Premium members only. Please upgrade your plan.");
  }
  next();
};
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      res.status(401);
      throw new Error("User not found or inactive");
    }
    req.user = user;

    // Best-effort "last seen" heartbeat — fire and forget so it never slows
    // down the request or fails it if the write has a transient error.
    User.updateOne({ _id: user._id }, { lastActiveAt: new Date() }).catch(() => {});

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("You do not have permission to perform this action");
    }
    next();
  };
