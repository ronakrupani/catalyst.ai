import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

const DESCRIPTION =
  "Two agents in a line. One reasons about your business and ranks channels; the other scrapes live ad platforms for real placements and real CPMs. Watch it run, then audit every number.";

export const metadata: Metadata = {
  metadataBase: new URL("https://catalyst.ai"),
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
