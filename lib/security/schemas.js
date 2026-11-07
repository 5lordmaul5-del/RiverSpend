import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000)
}).strict();

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(16),
  agent: z.string().trim().min(1).max(64).optional(),
  teamSize: z.union([z.literal(2), z.literal(4), z.literal(8), z.literal(10), z.literal(20), z.literal(30)]).optional()
}).strict();

export const fortressFlagsSchema = z.object({
  shopActive: z.boolean().optional(),
  stripeEnabled: z.boolean().optional(),
  aiChatEnabled: z.boolean().optional()
}).strict().refine((flags) => Object.keys(flags).length > 0, {
  message: "È necessario specificare almeno un flag modificabile."
});

export const internalFortressCommandSchema = z.object({
  flags: fortressFlagsSchema,
  agentName: z.enum(["nova", "admin"]).default("nova")
}).strict();

export const hmacHeadersSchema = z.object({
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
  timestamp: z.string().regex(/^\d{10}$/).transform(Number),
  nonce: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/)
}).strict();
