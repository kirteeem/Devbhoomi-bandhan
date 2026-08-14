import { Router } from "express";
import { listPublicTestimonials, submitTestimonial, submitTestimonialSchema } from "../controllers/testimonialController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listPublicTestimonials);
router.post("/", validate(submitTestimonialSchema), submitTestimonial);

export default router;
