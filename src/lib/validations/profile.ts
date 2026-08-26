import { z } from "zod";

export const profileInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  currentBand: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 9), "Enter a band between 0 and 9"),
  targetBand: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (Number(v) >= 4 && Number(v) <= 9), "Enter a band between 4.0 and 9.0"),
});
export type ProfileInfoInput = z.infer<typeof profileInfoSchema>;

export const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  streakReminders: z.boolean(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;