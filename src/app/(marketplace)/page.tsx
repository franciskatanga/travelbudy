import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { getProductMedia } from "@/lib/media";

const CATEGORIES = [
  "Safari",
  "Beach",
  "Adventure",
  "Luxury",
  "Honeymoon",
  "Family",
  "Business",
  "Cultural",
  "Wildlife",
  "Weekend Getaways",
];

export default async function HomePage() {
  let featuredDestinations: Awaited<ReturnType<typeof prisma.destination.findMany>> = [];
  let featuredProducts: Prisma.ProductGetPayload<{
    include: { supplier: true; destination: true };
  }>[] = [];
  let databaseUnavailable = false;

  try {
    [featuredDestinations, featuredProducts] = await Promise.all([
      prisma.destination.findMany({ where: { isFeatured: true }, take: 6 }),
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        take: 8,
        orderBy: { ratingAverage: "desc" },
        include: { supplier: true, destination: true },
      }),
    ]);
  } catch {
    databaseUnavailable = true;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80"
            alt="African safari landscape at sunset"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-300">
            Discover. Plan. Book. Travel.
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your next journey starts here.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            The operating system for modern travel commerce — connecting travellers, agents,
            hotels, tour operators and suppliers in one intelligent ecosystem.
          </p>

          {/* Search widget */}
          <form
            action="/search"
            className="mt-10 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-xl sm:grid-cols-4 sm:gap-2"
          >
            <input
              name="destination"
              placeholder="Destination"
              className="h-12 rounded-md border border-border px-3.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <input
              name="dates"
              placeholder="Dates"
              className="h-12 rounded-md border border-border px-3.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <input
              name="travellers"
              placeholder="Travellers"
              className="h-12 rounded-md border border-border px-3.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {databaseUnavailable && (
          <div className="mb-8 rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
            Live travel inventory is temporarily unavailable. Search and account access remain available.
          </div>
        )}
        <h2 className="text-xl font-semibold text-ink">Explore by experience</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat.toLowerCase())}`}
              className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-ink hover:border-brand-500 hover:text-brand-600"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured destinations */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Featured destinations</h2>
          <Link href="/destinations" className="text-sm font-medium text-brand-600">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {featuredDestinations.map((d) => (
            <Link key={d.id} href={`/search?destination=${d.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-navy-800">
                {d.heroImageUrl && (
                  <Image
                    src={d.heroImageUrl}
                    alt={d.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                  {d.name}
                </span>
              </div>
            </Link>
          ))}
          {featuredDestinations.length === 0 && (
            <p className="col-span-full text-sm text-ink-muted">
              No destinations seeded yet — run the seed script.
            </p>
          )}
        </div>
      </section>

      {/* Featured packages */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Best-rated trips</h2>
          <Link href="/packages" className="text-sm font-medium text-brand-600">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <Link key={p.id} href={`/packages/${p.slug}`}>
              <Card className="overflow-hidden py-0">
                <div className="relative h-44 w-full bg-navy-800">
                  {getProductMedia(p.media)[0]?.type === "image" && (
                    <Image src={getProductMedia(p.media)[0].url} alt={p.title} fill className="object-cover" />
                  )}
                  {p.supplier?.badges?.includes("verified") && (
                    <Badge tone="brand" className="absolute left-3 top-3">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-ink-muted">{p.destination?.name}</p>
                  <h3 className="mt-1 font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    {p.durationDays ?? "—"} days · {p.supplier?.businessName}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    From {formatMoney(p.basePrice.toString(), p.currencyCode)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
          {featuredProducts.length === 0 && (
            <p className="col-span-full text-sm text-ink-muted">
              No packages published yet — run the seed script.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface-raised py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-ink">Are you a travel agent or supplier?</h2>
          <div className="flex gap-3">
            <Button href="/for-agents" variant="outline">For Travel Agents</Button>
            <Button href="/for-suppliers" variant="brand">For Suppliers</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
