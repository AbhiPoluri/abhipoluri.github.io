import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abhi Poluri — Product, Strategy & Technology",
  description:
    "Abhi Poluri is an SFU business student and product builder working across strategy, software, and AI.",
  keywords: ["Abhi Poluri", "product builder", "Simon Fraser University", "SFU", "strategy", "AI"],
  openGraph: {
    title: "Abhi Poluri — Product, Strategy & Technology",
    description:
      "Business student and hands-on builder working where product strategy, software, and AI meet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
