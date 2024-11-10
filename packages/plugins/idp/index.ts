import { BetterAuthPlugin, setSessionCookie } from "better-auth";
import { APIError, getSession } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { applicationSchema, querySchema } from "./schema";
import {
  checkExistingConsent,
  validateClientId,
  validateCodeChallenge,
  validateRedirectUri,
  validateResponseType,
  validateScope,
} from "./utils";

export interface IdpOptions {
  /**
   * SignIn URL for the IDP
   *
   * @default "/sign-in"
   */
  signInUrl?: string;

  /**
   * Skip consent screen
   * @default true
   */
  skipConsent?: boolean;

  /**
   * Consent screen URL
   * @default "/consent"
   */
  consentUrl?: string;
}

export const idp = (options?: IdpOptions) =>
  ({
    id: "idp",
    endpoints: {
      idpAuthorise: createAuthEndpoint(
        "/authorize",
        {
          method: "GET",
          query: querySchema,
        },
        async (ctx) => {
          // Validate the query parameters
          const queryString = querySchema.safeParse(ctx.query);

          if (queryString.error) {
            ctx.context.logger.error(
              `Invalid query parameters: ${JSON.stringify(ctx.query)}`
            );
            const searchParams = new URLSearchParams({
              error: "invalid_request",
              state: ctx.query.state ?? "",
            }).toString();
            const redirectUrl = `${
              ctx.query?.error_redirect_uri ?? ctx.query.redirect_uri
            }?${searchParams}`;
            throw ctx.redirect(redirectUrl);
          }

          const {
            client_id,
            code_challenge,
            code_challenge_method = "S256",
            redirect_uri,
            response_type,
            scope,
            state,
            dontRememberMe,
          } = queryString.data;

          // Fetch the application from the database
          const application = await validateClientId(ctx, client_id);

          try {
            // Validating the response_type
            if (!validateResponseType(response_type)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid response_type",
              });
            }

            // Validate the redirect_uri
            if (!validateRedirectUri(application, redirect_uri)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid redirect_uri",
              });
            }

            // Validate the scope
            if (!validateScope(application, scope)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid scope",
              });
            }

            // Validate the code_challenge
            if (!validateCodeChallenge(code_challenge, code_challenge_method)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid code_challenge",
              });
            }
          } catch (error) {
            if (error instanceof Error) {
              ctx.context.logger.error(
                `Error during authorization: ${error.message}`
              );
            }
            const searchParams = new URLSearchParams({
              error: (error as APIError)?.message ?? "server_error",
              state,
            }).toString();
            const redirectUrl = `${
              ctx.query?.error_redirect_uri ?? redirect_uri
            }?${searchParams}`;
            throw ctx.redirect(redirectUrl);
          }

          // Get user session
          const session = await getSession()({
            ...ctx,
            _flag: "json",
            headers: ctx.headers!,
            query: {
              disableCookieCache: false,
            },
          });

          if (!session) {
            const completeQueryParams = {
              ...ctx.query,
              callback_url: `${ctx.context.baseURL}/authorize`,
            };

            // Build the query string from the completeQueryParams
            const queryString = new URLSearchParams(
              completeQueryParams
            ).toString();
            const redirectUrl = `${ctx.context.options.baseURL}${
              options?.signInUrl ?? "/sign-in"
            }?${queryString}`;

            console.log(redirectUrl);

            throw ctx.redirect(redirectUrl);
          }

          // Handle consent flow
          const requestedScopes = scope.split(" ");

          if (!(options?.skipConsent ?? true)) {
            // Handle consent=decline from consent screen
            if (ctx.query?.consent === "decline") {
              const queryString = new URLSearchParams({
                error: "consent_declined",
                state,
              }).toString();
              const redirectUrl = `${
                ctx.query?.error_redirect_uri ?? redirect_uri
              }?${queryString}`;
              throw ctx.redirect(redirectUrl);
            }

            // If not coming back from consent screen, check for existing consent
            if (ctx.query?.consent !== "granted") {
              const hasConsent = await checkExistingConsent(
                ctx,
                session.user.id,
                application.id,
                requestedScopes
              );

              // Redirect to consent screen if no existing consent
              if (!hasConsent) {
                const consentParams = new URLSearchParams({
                  client_id,
                  scope,
                  state,
                  redirect_uri,
                  response_type,
                  code_challenge,
                  code_challenge_method,
                  application_name: application.name,
                  callback_url: `${ctx.context.baseURL}/api/auth/authorize`,
                }).toString();

                const consentUrl = `${
                  options?.consentUrl ?? "/consent"
                }?${consentParams}`;
                throw ctx.redirect(consentUrl);
              }
            }

            // Store new consent if coming back with consent=granted
            if (ctx.query?.consent === "granted") {
              await ctx.context.adapter.create({
                model: "consent",
                data: {
                  id: ctx.context.uuid(),
                  userId: session.user.id,
                  applicationId: application.id,
                  scopes: requestedScopes,
                  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
              });
            }
          }

          // Generate authorization code
          // const authCode = ctx.context.uuid();

          // Store the code challenge for later verification
          // await ctx.context.adapter.create({
          //   model: "authorizationCode",
          //   data: {
          //     id: authCode,
          //     userId: session.user.id,
          //     applicationId: application.id,
          //     codeChallenge: code_challenge,
          //     codeChallengeMethod: code_challenge_method,
          //     scopes: requestedScopes,
          //     expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          //   },
          // });

          // Set the session cookie
          await setSessionCookie(
            ctx,
            {
              session: session.session,
              user: session.user,
            },
            dontRememberMe === "true" ? true : false,
            {
              httpOnly: true,
              secure: true,
              sameSite: "none",
            }
          );

          // Redirect to the redirect_uri with the authorization code and state
          const searchParams = new URLSearchParams({
            // code: authCode,
            state,
          }).toString();
          const redirectUrl = `${ctx.query.redirect_uri}?${searchParams}`;
          throw ctx.redirect(redirectUrl);
        }
      ),
    },
    schema: {
      application: {
        tableName: "application",
        fields: {
          name: {
            type: "string",
            required: true,
            returned: true,
          },
          clientId: {
            type: "string",
            required: true,
            unique: true,
            returned: true,
          },
          clientSecret: {
            type: "string",
            required: true,
            returned: false, // Security: don't return in API responses
          },
          redirectUris: {
            type: "string[]",
            required: true,
            returned: true,
            validator: applicationSchema.pick({ redirectUris: true }),
          },
          allowedScopes: {
            type: "string[]",
            required: true,
            returned: true,
            validator: applicationSchema.pick({ allowedScopes: true }),
          },
          active: {
            type: "boolean",
            required: false,
            defaultValue: true,
            returned: true,
          },
          createdAt: {
            type: "date",
            required: true,
            returned: true,
            defaultValue: "now",
          },
          updatedAt: {
            type: "date",
            required: true,
            returned: true,
            defaultValue: "now",
          },
        },
      },
      // authorizationCode: {
      //   tableName: "authorizationCode",
      //   fields: {
      //     code: {
      //       type: "string",
      //       required: true,
      //       unique: true,
      //       returned: false, // Security: don't expose authorization codes
      //     },
      //     codeChallenge: {
      //       type: "string",
      //       required: true,
      //       returned: false, // Security: don't expose code challenge
      //     },
      //     codeChallengeMethod: {
      //       type: "string",
      //       required: true,
      //       returned: false,
      //       validator: querySchema.pick({ code_challenge_method: true }),
      //     },
      //     scopes: {
      //       type: "string[]",
      //       required: true,
      //       returned: false,
      //       validator: applicationSchema.pick({ allowedScopes: true }),
      //     },
      //     used: {
      //       type: "boolean",
      //       required: false,
      //       defaultValue: false,
      //       returned: false,
      //     },
      //     expiresAt: {
      //       type: "date",
      //       required: true,
      //       returned: false,
      //     },
      //     userId: {
      //       type: "string",
      //       required: true,
      //       returned: false,
      //       references: {
      //         model: "user",
      //         field: "id",
      //       },
      //     },
      //     applicationId: {
      //       type: "string",
      //       required: true,
      //       returned: false,
      //       references: {
      //         model: "application",
      //         field: "id",
      //       },
      //     },
      //     createdAt: {
      //       type: "date",
      //       required: true,
      //       returned: false,
      //       defaultValue: "now",
      //     },
      //   },
      // },
      consent: {
        tableName: "consent",
        fields: {
          scopes: {
            type: "string[]",
            required: true,
            returned: true,
            validator: applicationSchema.pick({ allowedScopes: true }),
          },
          expiresAt: {
            type: "date",
            required: true,
            returned: true,
          },
          userId: {
            type: "string",
            required: true,
            returned: true,
            references: {
              model: "user",
              field: "id",
            },
          },
          applicationId: {
            type: "string",
            required: true,
            returned: true,
            references: {
              model: "application",
              field: "id",
            },
          },
          createdAt: {
            type: "date",
            required: true,
            returned: true,
            defaultValue: "now",
          },
          updatedAt: {
            type: "date",
            required: true,
            returned: true,
            defaultValue: "now",
          },
        },
      },
    },
  }) satisfies BetterAuthPlugin;
