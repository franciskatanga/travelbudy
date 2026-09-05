import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { getProductMedia } from "@/lib/media";
import type { Prisma } from "@prisma/client";

interface SearchPageProps {
  searchParams: Promise<{
    destination?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
  if (params.destination) {
    where.destination = { slug: params.destination };
  }
  if (params.category) {
    where.categories = { has: params.category };
  }
  if (params.minPrice || params.maxPrice) {
    where.basePrice = {
      ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { basePrice: "asc" }
      : params.sort === "price_desc"
        ? { basePrice: "desc" }
        : params.sort === "rating"
          ? { ratingAverage: "desc" }
          : params.sort === "newest"
            ? { createdAt: "desc" }
            : { ratingAverage: "desc" };

  const [products, destinations] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { supplier: true, destination: true }, take: 30 }),
    prisma.destination.findMany({ take: 10 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink">Destination</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {destinations.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/search?destination=${d.slug}`}
                      className="text-ink-muted hover:text-brand-600"
                    >
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink">Category</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {["safari", "beach", "adventure", "luxury", "family", "wildlife"].map((c) => (
                  <li key={c}>
                    <Link
                      href={`/search?category=${c}`}
                      className="capitalize text-ink-muted hover:text-brand-600"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">{products.length} results</p>
            <form className="flex items-center gap-2 text-sm">
              <select name="sort" className="rounded-md border border-border px-2 py-1.5 text-sm">
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </form>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden py-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 w-full shrink-0 bg-navy-800 sm:h-auto sm:w-48">
                    {getProductMedia(p.media)[0]?.type === "image" && (
                      <Image src={getProductMedia(p.media)[0].url} alt={p.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-ink-muted">{p.destination?.name}</p>
                        <h3 className="mt-0.5 font-semibold text-ink">{p.title}</h3>
                      </div>
                      {p.supplier?.badges?.includes("verified") && <Badge tone="brand">Verified</Badge>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{p.summary}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div>
                        <p className="text-xs text-ink-muted">
                          ★ {p.ratingAverage.toString()} · {p.durationDays ?? "—"} days
                        </p>
                        <p className="font-semibold text-ink">
                          From {formatMoney(p.basePrice.toString(), p.currencyCode)}
                        </p>
                      </div>
                      <Button href={`/packages/${p.slug}`} size="sm" variant="outline">
                        View details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-sm text-ink-muted">
                No matching packages. Try adjusting filters or run the seed script.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
