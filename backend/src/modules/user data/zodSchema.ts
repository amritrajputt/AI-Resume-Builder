import * as z from "zod";
export const resumeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),

  skills: z.array(z.string()),

  codingProfiles: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  achievements: z.array(z.any()).optional(),
  education: z.array(z.any()),
});