import { z } from "zod";

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface ServiceConfig {
  retryConfig: RetryConfig;
  timeout: number;
}

// Validation schemas
export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  response_format: z
    .object({
      type: z.literal("json_schema"),
      json_schema: z.object({
        name: z.string(),
        schema: z.object({
          type: z.string(),
          properties: z.record(z.unknown()),
          required: z.array(z.string()),
        }),
      }),
    })
    .optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(4096),
});

export const requestPayloadSchema = z.object({
  model: z.string().min(1),
  messages: z.array(chatMessageSchema).min(1),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  response_format: z
    .object({
      type: z.literal("json_schema"),
      json_schema: z.record(z.unknown()),
    })
    .optional(),
});

export type ModelParameters = z.infer<typeof modelParametersSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type RequestPayload = z.infer<typeof requestPayloadSchema>;

export interface ErrorContext {
  timestamp: string;
  requestId?: string;
  attempt?: number;
  maxAttempts?: number;
}

// Response validation schema
export const responseSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  object: z.literal("chat.completion"),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal("assistant"),
        content: z.string(),
      }),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type ParsedResponse = z.infer<typeof responseSchema>;

// Error types
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: ErrorContext,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}
