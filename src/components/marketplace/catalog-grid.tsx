import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { getProductMedia } from "@/lib/media";

type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  basePrice: { toString(): string };
  currencyCode: string;
  durationDays: number | null;
  ratingAverage: { toString(): string };
  media: unknown;
  supplier: { businessName: string; badges: string[] };
  destination: { name: string } | null;
};

export function CatalogGrid({ products, emptyMessage = "No experiences found yet." }: { products: CatalogProduct[]; emptyMessage?: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const media = getProductMedia(product.media);
        const cover = media.find((item) => item.type === "image");

        return (
          <Card key={product.id} className="overflow-hidden py-0">
            <div className="relative h-48 w-full bg-navy-800">
              {cover && <Image src={cover.url} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />}
              {product.supplier.badges.includes("verified") && (
                <Badge tone="brand" className="absolute left-3 top-3">Verified</Badge>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-muted">{product.destination?.name ?? product.supplier.businessName}</p>
              <h2 className="mt-1 font-semibold text-ink">{product.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{product.summary ?? "Explore this experience with a trusted travel supplier."}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-muted">★ {product.ratingAverage.toString()} · {product.durationDays ?? "—"} days</p>
                  <p className="font-semibold text-ink">From {formatMoney(product.basePrice.toString(), product.currencyCode)}</p>
                </div>
                <Button href={`/packages/${product.slug}`} size="sm" variant="outline">View details</Button>
              </div>
            </div>
          </Card>
        );
      })}
      {products.length === 0 && <p className="col-span-full text-sm text-ink-muted">{emptyMessage}</p>}
    </div>
  );
}
