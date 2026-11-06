import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
  return (
    <header
      className="border-b"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/expo-logo.png"
            alt="St. Joseph Mukasa Business Expo 2026 logo"
            width={40}
            height={40}
            className="rounded-md object-cover"
            priority
          />
          <span
            className="text-sm font-semibold leading-tight sm:text-base"
            style={{ color: "var(--brand-primary)" }}
          >
            St. Joseph Mukasa
            <br className="sm:hidden" /> Business Expo 2026
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/#packages"
            className="hidden font-medium transition-opacity hover:opacity-70 sm:inline"
            style={{ color: "var(--brand-muted)" }}
          >
            Packages
          </Link>
          <Link
            href="/booths"
            className="rounded-md px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Book a Booth
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
