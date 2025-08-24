import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(8080),
  EMAIL_HOST: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_PORT: z.coerce.number().default(587),
  JWT_SECRET: z.string(),
})

export type Env = z.infer<typeof envSchema>
