import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const identitySchema = z.object({
  targetSelf: z
    .string()
    .min(10, "Please describe who you want to become (min 10 chars)")
    .max(500),
  motivation: z
    .string()
    .min(10, "Please describe your motivation (min 10 chars)")
    .max(500),
});

export const protocolSchema = z.object({
  name: z.string().min(2, "Protocol name must be at least 2 characters").max(80),
  description: z.string().max(200).optional(),
  order: z.number().int().min(0).max(2),
});

export const protocolsBatchSchema = z.object({
  protocols: z
    .array(protocolSchema)
    .min(1, "At least 1 protocol is required")
    .max(3, "Maximum 3 protocols allowed"),
});

export const dailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(500).optional(),
});

export const excuseSchema = z.object({
  protocolLogId: z.string().cuid(),
  category: z.enum(["TIRED", "BUSY", "PROCRASTINATED", "LOW_MOOD", "OTHER"]),
  note: z.string().max(200).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type IdentityInput = z.infer<typeof identitySchema>;
export type ProtocolInput = z.infer<typeof protocolSchema>;
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type ExcuseInput = z.infer<typeof excuseSchema>;
