export const ALLOWED_ORIGINS = [
  "https://external-client-1.vercel.app",
  // Include localhost for development
  process.env.NODE_ENV === "development" ? "http://localhost:3001" : null,
].filter(Boolean);
