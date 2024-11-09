import { AUTH_API_BASE_URL } from "@/lib/auth-config";
import { Session } from "@/lib/types";
import { betterFetch, BetterFetchOption } from "@better-fetch/fetch";

// Define base configuration type
type FetchConfig = Omit<BetterFetchOption, "baseURL">;

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<{
  data: T | null;
  error: {
    message?: string;
    status: number;
    statusText: string;
  } | null;
}> {
  return await betterFetch<T>(endpoint, {
    baseURL: `${AUTH_API_BASE_URL}/api/auth`,
    method: config.method ?? "GET",
    credentials: "include",
    ...config,
  });
}

// Specific API functions
export const authApi = {
  getSession: (fetchConfig?: Omit<FetchConfig, "method">) =>
    apiCall<Session>("/get-session", fetchConfig),
  listSessions: (fetchConfig?: Omit<FetchConfig, "method">) =>
    apiCall<Session[]>("/list-sessions", fetchConfig),
  revokeSession: (sessionId: string) =>
    apiCall<{ status: boolean }>(`/revoke-session`, {
      body: { sessionId },
      method: "POST",
    }),
  revokeSessions: () =>
    apiCall<{ status: boolean }>(`/revoke-sessions`, {
      method: "POST",
    }),
  revokeOtherSessions: () =>
    apiCall<{ status: boolean }>(`/revoke-other-sessions`, {
      method: "POST",
    }),
  signOut: (fetchConfig?: Omit<FetchConfig, "method">) =>
    apiCall<{ status: boolean }>("/sign-out", {
      ...fetchConfig,
      method: "POST",
    }),
};
