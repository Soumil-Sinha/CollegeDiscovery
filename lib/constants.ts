export const COLLEGE_TYPES = ["IIT", "NIT", "IIIT", "PRIVATE", "DEEMED", "CENTRAL", "STATE"] as const

export const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const

export const POPULAR_ROLES = [
  { label: "Software Engineer", avgMonthlyPackage: 120000 },
  { label: "Data Scientist", avgMonthlyPackage: 130000 },
  { label: "Product Manager", avgMonthlyPackage: 150000 },
  { label: "DevOps Engineer", avgMonthlyPackage: 110000 },
  { label: "ML Engineer", avgMonthlyPackage: 140000 },
  { label: "Backend Developer", avgMonthlyPackage: 100000 },
  { label: "Frontend Developer", avgMonthlyPackage: 90000 },
  { label: "Full Stack Developer", avgMonthlyPackage: 105000 },
  { label: "Consultant", avgMonthlyPackage: 120000 },
  { label: "Analyst", avgMonthlyPackage: 80000 },
] as const

export const AVG_LIVING_COST_MONTHLY = 25000

export const FEES_RANGES = [
  { label: "Under ₹2L", min: 0, max: 200000 },
  { label: "₹2L – ₹5L", min: 200000, max: 500000 },
  { label: "₹5L – ₹10L", min: 500000, max: 1000000 },
  { label: "₹10L – ₹20L", min: 1000000, max: 2000000 },
  { label: "Above ₹20L", min: 2000000, max: Infinity },
] as const

export const RATING_OPTIONS = [
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4.0 },
  { label: "3.5+", value: 3.5 },
  { label: "3.0+", value: 3.0 },
] as const

export const COURSES = [
  "B.Tech CSE", "B.Tech ECE", "B.Tech ME", "B.Tech CE",
  "B.Tech EE", "B.Tech IT", "MBA", "MCA", "M.Tech", "BBA", "BCA",
] as const

export const ITEMS_PER_PAGE = 12

export const SEARCH_RATE_LIMIT = { windowMs: 60_000, max: 30 }
