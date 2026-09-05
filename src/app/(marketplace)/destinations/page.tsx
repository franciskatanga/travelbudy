import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function DestinationsPage() {
  let destinations: Awaited<ReturnType<typeof prisma.destination.findMany>> = [];
  try {
    destinations = await prisma.destination.findMany({ orderBy: [{ isFeatured: "desc" }, { name: "asc" }] });
  } catch {
    destinations = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Explore the world</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Destinations</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">Find your next journey across Zambia and beyond, with trusted local experts at every stop.</p>
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {destinations.map((destination) => (
          <Link key={destination.id} href={`/search?destination=${destination.slug}`} className="group">
            <Card className="overflow-hidden py-0">
              <div className="relative aspect-[4/3] bg-navy-800">
                {destination.heroImageUrl && <Image src={destination.heroImageUrl} alt={destination.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-ink">{destination.name}</h2>
                <p className="mt-1 text-xs text-ink-muted">{destination.categories.slice(0, 2).join(" · ")}</p>
              </div>
            </Card>
          </Link>
        ))}
        {destinations.length === 0 && <p className="col-span-full text-sm text-ink-muted">Destinations are temporarily unavailable.</p>}
      </div>
    </div>
  );
}
