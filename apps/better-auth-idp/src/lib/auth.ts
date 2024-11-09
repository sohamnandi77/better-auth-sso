import { env } from "@/env";
import { idp } from "@demo/plugins/idp";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import { AUTH_CONFIG } from "./auth.config";

const dialect = new PostgresJSDialect({
  postgres: postgres(env.DATABASE_URL),
});

export const auth = betterAuth({
  appName: "Better Auth IDP Demo",
  database: {
    dialect,
    type: "postgresql",
  },
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    maxPasswordLength: AUTH_CONFIG.MAX_PASSWORD_LENGTH,
    resetPasswordTokenExpiresIn: AUTH_CONFIG.RESET_PASSWORD_TOKEN_EXPIRES_IN,
  },
  plugins: [bearer(), idp()],
  logger: {
    disabled: env.NODE_ENV !== "development",
    verboseLogging: env.NODE_ENV === "development",
  },
});
