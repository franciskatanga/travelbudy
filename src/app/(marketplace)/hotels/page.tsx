import { prisma } from "@/lib/prisma";
import { CatalogGrid } from "@/components/marketplace/catalog-grid";

export default async function HotelsPage() {
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED", type: "HOTEL" }, include: { supplier: true, destination: true }, orderBy: { ratingAverage: "desc" } });
  return <CatalogPage title="Hotels" description="Stay somewhere memorable, from city bases to riverside retreats." products={products} />;
}

function CatalogPage({ title, description, products }: { title: string; description: string; products: Awaited<ReturnType<typeof prisma.product.findMany>> }) {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-medium uppercase tracking-widest text-brand-600">Stay well</p><h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 max-w-2xl text-ink-muted">{description}</p><div className="mt-8"><CatalogGrid products={products as never[]} emptyMessage="No hotels are published yet." /></div></div>;
}
