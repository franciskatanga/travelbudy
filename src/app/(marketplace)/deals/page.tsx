import { prisma } from "@/lib/prisma";
import { CatalogGrid } from "@/components/marketplace/catalog-grid";

export default async function DealsPage() {
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, include: { supplier: true, destination: true }, orderBy: [{ ratingAverage: "desc" }, { basePrice: "asc" }], take: 12 });
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-medium uppercase tracking-widest text-gold-500">Travel more, spend wisely</p><h1 className="mt-2 text-3xl font-semibold text-ink">Deals</h1><p className="mt-2 max-w-2xl text-ink-muted">Discover highly rated experiences and strong-value trips from verified suppliers.</p><div className="mt-8"><CatalogGrid products={products as never[]} emptyMessage="No deals are available yet." /></div></div>;
}
