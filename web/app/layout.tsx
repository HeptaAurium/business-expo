import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "St. Joseph Mukasa Business Expo 2026 — Book a Booth",
  description:
    "St. Joseph Mukasa Business Expo 2026 — Nov 29, St. Joseph Mukasa Catholic Church, Kahawa West. Reserve your exhibition booth online.",
};

// Runs before paint so a stored theme choice applies immediately — without
// this, the page would briefly flash the OS-preferred theme before the
// toggle's own effect ran and corrected it.
const themeInitScript = `
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme-init script (below) sets data-theme on this element before
      // React hydrates, on purpose — that's expected to differ from the
      // server-rendered markup, so hydration warnings for it are suppressed.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
