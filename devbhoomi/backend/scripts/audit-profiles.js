import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Profile from "../src/models/Profile.js";
import { connectDB } from "../src/config/db.js";

const run = async () => {
  await connectDB();

  const report = {
    missingProfiles: [],
    duplicateProfiles: [],
    invalidProfileUsers: [],
    suspiciousPhotos: [],
  };

  const users = await User.find({}).select("_id fullName email phone profileCode gender").lean();
  const profiles = await Profile.find({}).select("_id user photos createdAt updatedAt").lean();

  const profileMap = new Map();
  for (const profile of profiles) {
    const key = String(profile.user);
    const list = profileMap.get(key) || [];
    list.push(profile);
    profileMap.set(key, list);
  }

  for (const user of users) {
    const matches = profileMap.get(String(user._id)) || [];
    if (matches.length === 0) {
      report.missingProfiles.push(user);
    } else if (matches.length > 1) {
      report.duplicateProfiles.push({ user, profiles: matches });
    }
  }

  const userIds = new Set(users.map((u) => String(u._id)));
  for (const profile of profiles) {
    if (!userIds.has(String(profile.user))) {
      report.invalidProfileUsers.push(profile);
    }

    const suspicious = (profile.photos || []).filter((photo) => {
      if (!photo?.url) return true;
      return /avatar|placeholder|default/i.test(photo.url) && !photo.url.startsWith("data:image");
    });
    if (suspicious.length) {
      report.suspiciousPhotos.push({ profileId: profile._id, user: profile.user, photos: suspicious });
    }
  }

  console.log(JSON.stringify(report, null, 2));
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
