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

export const querySchema = z.object({
  response_type: z.enum(["code"]), // Only supporting authorization code flow
  client_id: z.string(),
  redirect_uri: z.string().url(),
  scope: z.string(),
  state: z.string(),
  code_challenge: z.string(),
  code_challenge_method: z.enum(VALID_CODE_CHALLENGE_METHODS),
  error_redirect_uri: z.string().url().optional(),
  consent: z.enum(["granted", "decline"]).optional(),
  dontRememberMe: z.enum(["true", "false"]).optional(),
});

// Client and Application Schema
export const applicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUris: z.array(z.string().url()),
  allowedScopes: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const consentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  applicationId: z.string().uuid(),
  scopes: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
