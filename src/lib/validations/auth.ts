import { z } from "zod";

function isAtLeast13(dob: string) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  return (hadBirthdayThisYear ? age : age - 1) >= 13;
}

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => !Number.isNaN(new Date(val).getTime()), "Enter a valid date")
    .refine((val) => new Date(val) <= new Date(), "Date of birth can't be in the future")
    .refine(isAtLeast13, "You must be at least 13 years old"),
  role: z.enum(["student", "teacher", "admin"]),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
