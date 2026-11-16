import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('devlearn_token'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAX_VIDEO_MB: z.coerce.number().default(100),
  MAX_PDF_MB: z.coerce.number().default(10),
  RAG_BASE_URL: z.string().default('http://127.0.0.1:8000'),
  RAG_INTERNAL_KEY: z.string().min(1),
  RAG_TIMEOUT_MS: z.coerce.number().default(15000),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
