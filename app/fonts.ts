import { Archivo, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Display. Archivo variable, wdth axis exposed so `.ct-display` can pin
 * font-variation-settings: "wdth" 112 per design system 2.3.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  weight: "variable",
  display: "swap",
  variable: "--ct-font-display-src",
});

/** Every machine-emitted value. Tabular figures enabled in globals.css. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--ct-font-mono-src",
});

/** UI. Human-written labels and prose. Self-hosted from Fontshare. */
export const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--ct-font-ui-src",
});

export const fontVariables = [
  archivo.variable,
  jetbrainsMono.variable,
  generalSans.variable,
].join(" ");
