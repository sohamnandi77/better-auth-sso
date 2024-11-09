"use client";

import { env } from "@/env";
import { ssoLogin } from "@/lib/auth-client";
import { AUTH_API_BASE_URL } from "@/lib/auth-config";
import { Button } from "./ui/button";

const SignInButton = () => {
  return (
    <div className="flex justify-center">
      <Button
        className="gap-2 justify-between"
        variant="default"
        onClick={() => {
          ssoLogin({
            clientId: "TdJIcbe16WxTHtN95nyywh5E4yOo6ItG",
            authorizationUrl: `${AUTH_API_BASE_URL}/api/auth/authorize`,
            redirectURI: `${env.NEXT_PUBLIC_AUTH_API_URL}/dashboard`,
            errorRedirectURI: `${env.NEXT_PUBLIC_AUTH_API_URL}/error`,
            scopes: ["openid", "email", "profile"],
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.2em"
          height="1.2em"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2z"
          ></path>
        </svg>
        <span>Sign In</span>
      </Button>
    </div>
  );
};

export default SignInButton;
