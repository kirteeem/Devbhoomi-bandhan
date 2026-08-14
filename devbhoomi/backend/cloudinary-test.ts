#!/usr/bin/env ts-node
// Manual smoke-test script for the Cloudinary integration — not used by the
// running app. Previously had real Cloudinary credentials hardcoded inline;
// since this file isn't gitignored (unlike .env), that meant a live
// cloud_name/api_key/api_secret would end up in git history the moment this
// was committed. Now reads from the environment like everywhere else.
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in environment.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  try {
    // Upload a sample image from Cloudinary's demo account
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );

    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // Fetch image details
    const details = await cloudinary.api.resource(uploadResult.public_id);

    console.log("Width:", details.width);
    console.log("Height:", details.height);
    console.log("Format:", details.format);
    console.log("File Size (bytes):", details.bytes);

    // f_auto = automatically serves the best image format for the browser
    // q_auto = automatically chooses an optimal compression quality
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    console.log(
      "\nDone! Click link below to see optimized version of the image."
    );
    console.log("Check the size and the format.");
    console.log(transformedUrl);
  } catch (err) {
    console.error(err);
  }
}

main();