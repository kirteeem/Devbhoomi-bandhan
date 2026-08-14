import { z } from "zod";
import Testimonial from "../models/Testimonial.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

export const submitTestimonialSchema = z.object({
  coupleNames: z.string().trim().min(2).max(150),
  district: z.string().trim().max(50).optional(),
  story: z.string().trim().min(10, "Tell us a bit more about your story").max(1000),
  photoUrl: z.string().trim().url().optional(),
  marriedOn: z.coerce.date().optional(),
});

// GET /api/testimonials — public, approved only
export const listPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isApproved: true }).sort({ isFeatured: -1, createdAt: -1 }).limit(20);
  ok(res, { testimonials });
});

// POST /api/testimonials — couples submit their own story for review.
// Only whitelisted fields are accepted; isApproved/isFeatured are always
// controller-set so a public, unauthenticated caller can't self-approve.
export const submitTestimonial = asyncHandler(async (req, res) => {
  const { coupleNames, district, story, photoUrl, marriedOn } = req.body;
  const testimonial = await Testimonial.create({
    coupleNames,
    district,
    story,
    photoUrl,
    marriedOn,
    isApproved: false,
    isFeatured: false,
  });
  ok(res, { testimonial }, "Thank you! Your story is pending review.", 201);
});
