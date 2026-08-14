import { Router } from "express";
import { z } from "zod";
import { searchMatches, getSuggestedMatches } from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";

const router = Router();

// Free-text-ish filter fields are capped in length; everything else is
// bounded to sane types/ranges so it can't be abused to build unbounded
// Mongo queries (e.g. huge `limit`, or a comma list with thousands of
// entries).
const csvField = z.string().trim().max(300).optional();
const searchMatchesQuerySchema = z.object({
  district: csvField,
  tehsil: csvField,
  minAge: z.coerce.number().int().min(18).max(100).optional(),
  maxAge: z.coerce.number().int().min(18).max(100).optional(),
  minHeight: z.coerce.number().int().min(100).max(250).optional(),
  maxHeight: z.coerce.number().int().min(100).max(250).optional(),
  education: csvField,
  profession: z.string().trim().max(100).optional(),
  income: csvField,
  religion: csvField,
  community: csvField,
  subCaste: z.string().trim().max(100).optional(),
  gotra: z.string().trim().max(100).optional(),
  maritalStatus: csvField,
  manglik: csvField,
  smoking: csvField,
  drinking: csvField,
  familyType: csvField,
  diet: z.string().trim().max(50).optional(),
  sortBy: z.enum(["newest", "oldest", "compatibility"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

router.get("/", protect, validateQuery(searchMatchesQuerySchema), searchMatches);
router.get("/suggested", protect, getSuggestedMatches);

export default router;
