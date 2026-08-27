import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

function isoDateYearsAgo(years: number, extraDays = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + extraDays);
  return d.toISOString().slice(0, 10);
}

describe("signupSchema", () => {
  const base = {
    firstName: "Nafisa",
    lastName: "Rahman",
    email: "nafisa@example.com",
    password: "password123",
    role: "student" as const,
  };

  it("accepts a valid signup for someone exactly 13", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(13) });
    expect(result.success).toBe(true);
  });

  it("rejects someone who turns 13 tomorrow (not yet had this year's birthday)", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(13, 1) });
    expect(result.success).toBe(false);
  });

  it("accepts someone who already had this year's birthday and is 13", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(13, -1) });
    expect(result.success).toBe(true);
  });

  it("rejects a date of birth in the future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const result = signupSchema.safeParse({ ...base, dob: future.toISOString().slice(0, 10) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid (unparseable) date of birth", () => {
    const result = signupSchema.safeParse({ ...base, dob: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing date of birth", () => {
    const result = signupSchema.safeParse({ ...base, dob: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(20), email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(20), password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognized role", () => {
    const result = signupSchema.safeParse({ ...base, dob: isoDateYearsAgo(20), role: "superadmin" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
