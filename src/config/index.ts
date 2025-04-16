import { z } from "zod";

const envSchema = z.object({
  VITE_REST_API: z.string().url(),
  VITE_MAILS_API_URL: z.string().url(),
});

const envVars = {
  VITE_REST_API: import.meta.env.VITE_REST_API,
  VITE_MAILS_API_URL: import.meta.env.VITE_MAILS_API_URL,
};

const parsedEnv = envSchema.safeParse(envVars);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const config = {
  REST_API: parsedEnv.data.VITE_REST_API,
  VITE_MAILS_API_URL: parsedEnv.data.VITE_MAILS_API_URL,
};
