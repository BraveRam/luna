import { z } from "zod";
import loadEnv from "dotenv";

loadEnv.config();

export const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  BACKBLAZE_MAIN_KEY_ID: z.string().optional(),
  BACKBLAZE_MAIN_APPLICATION_KEY: z.string().optional(),
  BACKBLAZE_MAIN_BUCKET_NAME: z.string().optional(),
  BACKBLAZE_UTILS_KEY_ID: z.string().optional(),
  BACKBLAZE_UTILS_APPLICATION_KEY: z.string().optional(),
  BACKBLAZE_UTILS_BUCKET_NAME: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  QSTASH_URL: z.string().optional(),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
