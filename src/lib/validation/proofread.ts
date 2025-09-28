import { z } from "zod";

export const proofreadRequestSchema = z.object({
  text: z
    .string()
    .min(1, "校正対象の文章は必須です。")
    .max(10_000, "文章は10,000文字以内で入力してください。"),
  style: z
    .enum(["business", "casual", "academic", "report"])
    .default("business"),
  level: z.enum(["basic", "standard", "advanced"]).default("standard"),
});

export type ProofreadRequest = z.infer<typeof proofreadRequestSchema>;

export const proofreadResponseSchema = z.object({
  correctedText: z.string().min(1, "校正結果が空です。"),
  summary: z.string().min(1, "校正概要が空です。"),
  details: z.string().min(1, "校正理由が空です。"),
});

export type ProofreadResponse = z.infer<typeof proofreadResponseSchema>;
