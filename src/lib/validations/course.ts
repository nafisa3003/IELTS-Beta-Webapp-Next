import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  courseid: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
