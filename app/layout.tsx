import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, Libre_Baskerville, Work_Sans } from "next/font/google";
import Script from "next/script";
import "./statement.css";
import "./eggs.css";

const sans = Funnel_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Funnel_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// Wandr's own brand faces, used only inside its feature panel.
const wandrSerif = Libre_Baskerville({
  variable: "--font-wandr-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const wandrSans = Work_Sans({
  variable: "--font-wandr-sans",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${wandrSerif.variable} ${wandrSans.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var html = document.documentElement;
                var theme = localStorage.getItem("theme");
                if (theme === "light" || theme === "dark") html.dataset.theme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
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
