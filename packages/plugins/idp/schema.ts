import { z } from "zod";

export const VALID_CODE_CHALLENGE_METHODS = ["S256", "plain"] as const;

export const VALID_SCOPES = [
  "openid",
  "profile",
  "email",
  "address",
  "phone",
  "offline_access",
] as const;

export const ssoOptionsSchema = z.object({
  clientId: z.string(),
  authorizationUrl: z.string().url(),
  redirectURI: z.string().url(),
  scopes: z.array(z.enum(VALID_SCOPES)),
  errorRedirectURI: z.string().url().optional(),
  codeChallengeMethod: z.enum(VALID_CODE_CHALLENGE_METHODS).optional(),
  responseType: z.string().optional(),
});
