import { prisma } from "@/lib/prisma";
import { CatalogGrid } from "@/components/marketplace/catalog-grid";

export default async function PackagesPage() {
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED", type: "PACKAGE" }, include: { supplier: true, destination: true }, orderBy: { ratingAverage: "desc" } });
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-medium uppercase tracking-widest text-brand-600">Ready-made journeys</p><h1 className="mt-2 text-3xl font-semibold text-ink">Packages</h1><p className="mt-2 max-w-2xl text-ink-muted">Thoughtfully assembled trips with accommodation, activities and local expertise in one plan.</p><div className="mt-8"><CatalogGrid products={products as never[]} emptyMessage="No packages are published yet." /></div></div>;
}
