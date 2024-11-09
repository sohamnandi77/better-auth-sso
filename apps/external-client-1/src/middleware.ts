import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_API_BASE_URL } from "@/lib/auth-config";
import type { Session } from "@/lib/types";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: AUTH_API_BASE_URL,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
