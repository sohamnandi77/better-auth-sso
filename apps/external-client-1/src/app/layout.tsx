import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Wrapper, WrapperWithQuery } from "@/components/wrapper";
import { createMetadata } from "@/lib/metadata";
import { Montserrat } from "next/font/google";

import "./globals.css";

export const metadata = createMetadata({
  title: {
    template: "%s | External Client",
    default: "External Client",
  },
  description: "The most comprehensive authentication library for typescript",
  metadataBase: new URL("https://demo.better-auth.com"),
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Wrapper>
            <WrapperWithQuery>{children}</WrapperWithQuery>
          </Wrapper>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
