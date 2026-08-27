import {
  profileInfoSchema,
  settingsSchema,
  changePasswordSchema,
} from "@/lib/validations/profile";

describe("profileInfoSchema", () => {
  const base = { firstName: "Nafisa", lastName: "Rahman" };

  it("accepts the minimum required fields with everything else blank", () => {
    const result = profileInfoSchema.safeParse({
      ...base,
      phone: "",
      address: "",
      gender: "",
      dob: "",
      currentBand: "",
      targetBand: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing first name", () => {
    const result = profileInfoSchema.safeParse({ ...base, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a currentBand within 0-9", () => {
    const result = profileInfoSchema.safeParse({ ...base, currentBand: "6.5" });
    expect(result.success).toBe(true);
  });

  it("rejects a currentBand above 9", () => {
    const result = profileInfoSchema.safeParse({ ...base, currentBand: "9.5" });
    expect(result.success).toBe(false);
  });

  it("rejects a currentBand below 0", () => {
    const result = profileInfoSchema.safeParse({ ...base, currentBand: "-1" });
    expect(result.success).toBe(false);
  });

  it("accepts a targetBand within 4-9", () => {
    const result = profileInfoSchema.safeParse({ ...base, targetBand: "7" });
    expect(result.success).toBe(true);
  });

  it("rejects a targetBand below 4", () => {
    const result = profileInfoSchema.safeParse({ ...base, targetBand: "3.5" });
    expect(result.success).toBe(false);
  });

  it("rejects a targetBand above 9", () => {
    const result = profileInfoSchema.safeParse({ ...base, targetBand: "9.5" });
    expect(result.success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("accepts valid boolean toggles", () => {
    const result = settingsSchema.safeParse({ emailNotifications: true, streakReminders: false });
    expect(result.success).toBe(true);
  });

  it("rejects a non-boolean value", () => {
    const result = settingsSchema.safeParse({ emailNotifications: "yes", streakReminders: false });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    const result = changePasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = changePasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "somethingelse",
    });
    expect(result.success).toBe(false);
  });
});
