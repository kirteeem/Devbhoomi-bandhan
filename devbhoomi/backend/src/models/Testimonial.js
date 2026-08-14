import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    coupleNames: { type: String, required: true },
    district: String,
    story: { type: String, required: true, maxlength: 1000 },
    photoUrl: String,
    marriedOn: Date,
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
