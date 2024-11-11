import type { NextConfig } from "next";
import { ALLOWED_ORIGINS } from "./config";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: ALLOWED_ORIGINS.join(","),
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            // Add any additional headers you're using
            value:
              "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
          },
          {
            // Add max age to reduce preflight requests
            key: "Access-Control-Max-Age",
            value: "7200",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
