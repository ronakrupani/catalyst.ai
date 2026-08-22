import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Absolute base for OG and canonical URLs. Falls back through the Vercel
 * production domain so a deployment does not advertise card images on a
 * domain that is not serving them yet.
 */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const DESCRIPTION =
  "Two agents in a line. One reasons about your business and ranks channels; the other scrapes live ad platforms for real placements and real CPMs. Watch it run, then audit every number.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "catalyst.ai — find where your audience actually is",
    template: "%s · catalyst.ai",
  },
  description: DESCRIPTION,
  applicationName: "catalyst.ai",
  openGraph: {
    type: "website",
    siteName: "catalyst.ai",
    title: "catalyst.ai — find where your audience actually is",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "catalyst.ai — find where your audience actually is",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0c12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
