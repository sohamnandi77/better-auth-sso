import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://demo.better-auth.com",
      images: "https://demo.better-auth.com/og.png",
      siteName: "External Client",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@beakcru",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "https://demo.better-auth.com/og.png",
      ...override.twitter,
    },
  };
}
