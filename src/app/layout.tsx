import type { Metadata, Viewport } from "next";

import { ToastProvider } from "@/components/ui/toast-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_TAGLINE,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: APP_NAME,
    capable: true,
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" }
    ],
    apple: [{ url: "/icons/icon-192.svg" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#2749A0"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
