import { BetterAuthClientPlugin, BetterAuthError } from "better-auth";
import { generateCodeVerifier, generateState } from "oslo/oauth2";
import { z } from "zod";
import type { idp } from ".";
import { ssoOptionsSchema } from "./schema";

export interface SsoOptions {
  /**
   * The client ID of your application
   */
  clientId: string;
  /**
   * The redirect URL for your application. This is where the provider will
   * redirect the user after the sign in process. Make sure this URL is
   * whitelisted in the provider's dashboard.
   */
  redirectURI: string;
  /**
   * The Error Redirect URL for your application. This is where the provider will redirect the user if there is an error during the sign in process.
   */
  errorRedirectURI?: string;
  /**
   * The scopes you want to request from the provider
   */
  scopes: string[];
  /**
   * URL for the authorization endpoint.
   */
  authorizationUrl: string;
  /**
   * OAuth response type.
   * @default "code"
   */
  responseType?: string;
  /**
   * The method used to generate the code challenge.
   * @default "S256"
   */
  codeChallengeMethod?: "S256" | "plain";
}

export interface SsoLoginResponse {
  /**
   * The Logout Endpoint where the user can logout and invalidate the session.
   */
  logoutUrl: string;
  /**
   * The redirect URL for your application. This is where the provider will
   * redirect the user after the logout process. Make sure this URL is
   * whitelisted in the provider's dashboard.
   */
  redirectURI: string;
}

export const idpClient = () => {
  return {
    id: "idp",
    $InferServerPlugin: {} as ReturnType<typeof idp>,
    getActions: ($fetch) => ({
      ssoLogin: (options: SsoOptions) => {
        try {
          // browser check
          if (typeof window === "undefined" || !window.document) {
            console.warn(
              "SSO Client is only available in browser environments"
            );
            return;
          }

          const opts = ssoOptionsSchema.safeParse(options);

          if (opts.error) {
            throw new BetterAuthError(`BAD_REQUEST, ${opts.error}`);
          }

          const {
            clientId,
            redirectURI,
            scopes,
            responseType,
            codeChallengeMethod,
            errorRedirectURI,
            authorizationUrl,
          } = opts.data;

          // generate state & code challenge
          const codeVerifier = generateCodeVerifier();
          const state = generateState();

          const url = new URL(authorizationUrl);
          url.searchParams.set("response_type", responseType ?? "code");
          url.searchParams.set("client_id", clientId);
          url.searchParams.set("state", state);
          url.searchParams.set("scope", scopes.join(" "));
          url.searchParams.set("redirect_uri", redirectURI);
          url.searchParams.set("code_challenge", codeVerifier);
          url.searchParams.set(
            "code_challenge_method",
            codeChallengeMethod ?? "S256"
          );
          if (errorRedirectURI)
            url.searchParams.set("error_redirect_uri", errorRedirectURI);

          // store it in local storage
          if (localStorage) {
            localStorage.setItem("state", state);
          }

          // redirect to /authorize
          window.location.href = url.toString();
        } catch (error) {
          console.error("Error during SSO flow:", error);
          throw error;
        }
      },
      handleSsoRedirect: async (options: SsoLoginResponse) => {
        try {
          // browser check
          if (typeof window === "undefined" || !window.document) {
            console.warn(
              "SSO Client is only available in browser environments"
            );
            return;
          }

          const opts = z.string().url().safeParse(options);
          if (opts.error) {
            throw new BetterAuthError(`BAD_REQUEST, ${opts.error}`);
          }

          // verify the state parameter coming in url from custom idp server with state stored locally.
          const url = new URL(window.location.href);
          const state = url.searchParams.get("state");
          const storedState = localStorage.getItem("state");
          if (state !== storedState) {
            // call a POST method to IDP Server `/sign-out` url
            const logoutUrl = opts.data;
            await $fetch(logoutUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });
            // Add redirectURI support or onSuccess/onError Support
            // if redirect url is present, redirect to it
          }
        } catch (error) {
          console.error("Error during SSO flow:", error);
          throw error;
        }
      },
    }),
  } satisfies BetterAuthClientPlugin;
};
