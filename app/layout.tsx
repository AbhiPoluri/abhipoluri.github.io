import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abhi Poluri — Business & Technology",
  description:
    "Student at Simon Fraser University who builds. AI dashboards, planning tools, and real side businesses. Available for internships.",
  keywords: ["Abhi Poluri", "Simon Fraser University", "SFU", "business student", "software developer", "portfolio"],
  openGraph: {
    title: "Abhi Poluri — Business & Technology",
    description:
      "Student at Simon Fraser University who builds. AI dashboards, planning tools, and real side businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className={`${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
