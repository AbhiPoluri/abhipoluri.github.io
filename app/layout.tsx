import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./work.css";
import "./footer.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
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
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        <Script id="reset-refresh-scroll" strategy="beforeInteractive">
          {`
            if ("scrollRestoration" in history) {
              history.scrollRestoration = "manual";
            }
            const root = document.documentElement;
            const forceTop = () => {
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              root.scrollTop = 0;
              if (document.body) document.body.scrollTop = 0;
            };
            window.addEventListener("beforeunload", forceTop);
            const navigation = performance.getEntriesByType("navigation")[0];
            if (navigation && navigation.type === "reload") {
              let resetFrames = 0;
              const holdAtTop = () => {
                forceTop();
                resetFrames += 1;
                if (resetFrames < 30) {
                  requestAnimationFrame(holdAtTop);
                }
              };
              holdAtTop();
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
