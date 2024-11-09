import { env } from "@/env";

export const AUTH_API_BASE_URL =
  env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? env.NEXT_PUBLIC_AUTH_API_URL
    : "http://localhost:3000";
