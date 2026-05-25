import { z } from "zod"

export const collegeFiltersSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(["IIT", "NIT", "IIIT", "PRIVATE", "DEEMED", "CENTRAL", "STATE"]).optional(),
  minFees: z.coerce.number().min(0).optional(),
  maxFees: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  course: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(["rating", "fees_asc", "fees_desc", "placement", "name"]).optional(),
})

export type CollegeFilters = z.infer<typeof collegeFiltersSchema>

export const compareSchema = z.object({
  ids: z.string().transform((val) => val.split(",").filter(Boolean).slice(0, 3)),
})

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
})

export const reviewSchema = z.object({
  collegeId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(2000),
})

export const savedCollegeSchema = z.object({
  collegeId: z.string().cuid(),
})

export const roiSchema = z.object({
  collegeId: z.string().cuid(),
  expectedMonthlyPackage: z.coerce.number().min(10000).max(10000000),
})

export const smartFilterSchema = z.object({
  course: z.string().default("B.Tech CSE"),
  maxFees: z.coerce.number().min(0),
})
