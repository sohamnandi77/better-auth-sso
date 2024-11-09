import { GenericEndpointContext } from "better-auth";
import { APIError } from "better-auth/api";
import {
  applicationSchema,
  consentSchema,
  VALID_CODE_CHALLENGE_METHODS,
  VALID_SCOPES,
} from "./schema";

export const validateClientId = async (
  ctx: GenericEndpointContext,
  clientId: string
) => {
  const application = (await ctx.context.adapter.findOne({
    model: "application",
    where: [
      {
        field: "clientId",
        value: clientId,
      },
    ],
  })) as typeof applicationSchema._type;

  if (!application) {
    throw new APIError("BAD_REQUEST", {
      message: "Invalid client_id",
    });
  }

  return application;
};

export const validateRedirectUri = (
  application: typeof applicationSchema._type,
  redirectUri: string
) => {
  if (!application.redirectUris.includes(redirectUri)) {
    throw new APIError("BAD_REQUEST", {
      message: "Invalid redirect_uri",
    });
  }
  return true;
};

export const validateScope = (
  application: typeof applicationSchema._type,
  scope: string
) => {
  const requestedScopes = scope.split(" ");
  const invalidScopes = requestedScopes.filter(
    (scope) => !VALID_SCOPES.includes(scope as (typeof VALID_SCOPES)[number])
  );

  if (invalidScopes.length > 0) {
    throw new APIError("BAD_REQUEST", {
      message: `Invalid scope: ${invalidScopes.join(", ")}`,
    });
  }

  // Check if application is allowed these scopes
  const unauthorizedScopes = requestedScopes.filter(
    (scope) => !application.allowedScopes.includes(scope)
  );

  if (unauthorizedScopes.length > 0) {
    throw new APIError("BAD_REQUEST", {
      message: `Unauthorized scope: ${unauthorizedScopes.join(", ")}`,
    });
  }

  return true;
};

export const validateCodeChallenge = (
  codeChallenge: string,
  codeChallengeMethod: (typeof VALID_CODE_CHALLENGE_METHODS)[number]
) => {
  // Validate code challenge format
  if (codeChallengeMethod === "S256") {
    // S256 should be base64url-encoded string of length 43
    if (!/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)) {
      throw new APIError("BAD_REQUEST", {
        message: `Invalid code challenge for method ${codeChallengeMethod}`,
      });
    }
  } else if (codeChallengeMethod === "plain") {
    // Plain should be between 43-128 characters
    if (codeChallenge.length < 43 || codeChallenge.length > 128) {
      throw new APIError("BAD_REQUEST", {
        message: `Invalid code challenge for method ${codeChallengeMethod}`,
      });
    }
  }

  return true;
};

export const validateResponseType = (responseType: string) => {
  if (responseType !== "code") {
    throw new APIError("BAD_REQUEST", {
      message: `Invalid response_type: ${responseType}`,
    });
  }
  return true;
};

export const checkExistingConsent = async (
  ctx: GenericEndpointContext,
  userId: string,
  applicationId: string,
  requestedScopes: string[]
) => {
  const existingConsent = (await ctx.context?.adapter.findOne({
    model: "consent",
    where: [
      {
        field: "userId",
        value: userId,
      },
      {
        field: "applicationId",
        value: applicationId,
      },
      {
        field: "expiresAt",
        operator: "gt",
        value: new Date()?.getTime(),
      },
    ],
  })) as typeof consentSchema._type;

  if (!existingConsent) {
    return false;
  }

  // Check if all requested scopes are already consented
  const hasAllScopes = requestedScopes.every((scope) =>
    existingConsent.scopes.includes(scope)
  );

  return hasAllScopes;
};
