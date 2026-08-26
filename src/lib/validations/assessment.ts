import { z } from "zod";

export const submitAnswersSchema = z.object({
  attemptid: z.string().uuid(),
  testid: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
});
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
