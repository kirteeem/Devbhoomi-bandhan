import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBuffer = (buffer, folder = "devbhoomi-bandhan") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        // Pin these explicitly rather than trusting Cloudinary's "auto"
        // detection: without resource_type: "image", a disguised non-image
        // file (e.g. an .html/.svg with a spoofed image content-type) could
        // be accepted and later served back with a content-type that lets
        // it execute in a browser. allowed_formats is a second, independent
        // check enforced by Cloudinary itself on the file's real content.
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export default cloudinary;
