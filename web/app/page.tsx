import Image from "next/image";
import Link from "next/link";

type Package = {
  name: string;
  price: string;
  accent: "corporate" | "primary" | "accent";
  features: string[];
};

const packages: Package[] = [
  {
    name: "Sponsorship Package",
    price: "KSh 15,000",
    accent: "corporate",
    features: [
      "Brand features on all official socials",
      "Brand logo placement on event posters",
      "Strategic premium location for exhibition",
      "3 × 3 exhibition tent",
      "2 fully dressed tables & chairs",
    ],
  },
  {
    name: "Corporates & Institutions",
    price: "KSh 10,000",
    accent: "primary",
    features: [
      "Premium exhibition position",
      "3 × 3 exhibition tent",
      "2 fully dressed tables & 2 dressed chairs",
    ],
  },
  {
    name: "SMEs Package",
    price: "KSh 5,000",
    accent: "primary",
    features: [
      "Standard exhibition position",
      "3 × 3 shared exhibition tent",
      "1 fully dressed table & 2 dressed chairs",
    ],
  },
  {
    name: "Registered Youth",
    price: "KSh 3,000",
    accent: "accent",
    features: ["Shared tent space", "1 dressed table & 1 chair"],
  },
];

const accentVar: Record<Package["accent"], string> = {
  corporate: "var(--brand-corporate)",
  primary: "var(--brand-primary)",
  accent: "var(--brand-accent)",
};

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section
        className="border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
          <Image
            src="/expo-logo.png"
            alt="St. Joseph Mukasa Business Expo 2026 logo"
            width={112}
            height={112}
            className="rounded-xl"
            priority
          />

          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--brand-muted)" }}
          >
            St. Joseph Mukasa C.C. Kahawa West — Self Help Group &amp; Young
            Catholic Adults, in partnership with Caritas Nairobi
          </span>

          <h1
            className="text-4xl font-bold sm:text-5xl"
            style={{ color: "var(--brand-primary)" }}
          >
            St. Joseph Mukasa Business Expo 2026
          </h1>

          <p
            className="max-w-2xl text-base sm:text-lg"
            style={{ color: "var(--foreground)" }}
          >
            A one-day marketplace bringing together SMEs, corporates,
            institutions and youth entrepreneurs from Kahawa West and beyond —
            showcase what you do, meet new customers, and grow your business.
          </p>

          <div
            className="flex flex-col items-center gap-1 text-sm sm:flex-row sm:gap-6"
            style={{ color: "var(--brand-muted)" }}
          >
            <span className="font-semibold">
              📅 Sunday, 29 November 2026 · 7:00 AM onwards
            </span>
            <span className="hidden sm:inline">·</span>
            <span>
              📍 St. Joseph Mukasa Catholic Church, Kahawa West — along Church
              Road, off Market Road
            </span>
          </div>

          <span
            className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: "var(--brand-corporate)",
              color: "var(--brand-corporate-foreground)",
            }}
          >
            Limited slots left — book yours today
          </span>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/booths"
              className="rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-primary-foreground)",
              }}
            >
              Reserve Your Booth →
            </Link>
            <Link
              href="#packages"
              className="rounded-md border px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{
                borderColor: "var(--brand-primary)",
                color: "var(--brand-primary)",
              }}
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section
        id="packages"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--brand-primary)" }}
          >
            Exhibition Packages
          </h2>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: "var(--brand-muted)" }}
          >
            Pick the package that fits your business, then head to the booth map
            to choose and reserve your exact spot.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="flex flex-col gap-4 rounded-lg border-t-4 bg-white/60 p-6 shadow-sm dark:bg-white/5"
              style={{
                borderTopColor: accentVar[pkg.accent],
                borderLeft:
                  "1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                borderRight:
                  "1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)",
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3
                  className="text-lg font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {pkg.name}
                </h3>
                <span
                  className="whitespace-nowrap text-lg font-extrabold"
                  style={{ color: accentVar[pkg.accent] }}
                >
                  {pkg.price}
                </span>
              </div>

              <ul
                className="flex flex-1 flex-col gap-1.5 text-sm"
                style={{ color: "var(--brand-muted)" }}
              >
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span style={{ color: accentVar[pkg.accent] }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/booths"
                className="mt-2 rounded-md px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentVar[pkg.accent] }}
              >
                Book This Package
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="border-t"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-12 text-center">
          <h2
            className="text-xl font-bold sm:text-2xl"
            style={{ color: "var(--brand-primary)" }}
          >
            Ready to claim your spot?
          </h2>
          <p
            className="max-w-xl text-sm"
            style={{ color: "var(--brand-muted)" }}
          >
            Browse the live floor map for Arena and Premium Ground, and reserve
            an available booth in a few clicks.
          </p>
          <Link
            href="/booths"
            className="rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-primary-foreground)",
            }}
          >
            Reserve Your Booth →
          </Link>
        </div>
      </section>

      <footer
        className="border-t px-6 py-6 text-center text-xs"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          color: "var(--brand-muted)",
        }}
      >
        St. Joseph Mukasa C.C. Kahawa West (S.H.G.) · Young Catholic Adults ·
        Caritas Nairobi
      </footer>
    </main>
  );
}
