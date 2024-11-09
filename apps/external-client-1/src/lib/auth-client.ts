import { idpClient } from "@demo/plugins/idp-client";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { AUTH_API_BASE_URL } from "./auth-config";

export const authClient = createAuthClient({
  baseURL: AUTH_API_BASE_URL,
  plugins: [idpClient()],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const { ssoLogin } = authClient;
