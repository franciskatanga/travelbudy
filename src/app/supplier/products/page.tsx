import { prisma } from "@/lib/prisma";
import { requireSupplierId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "brand" | "success" | "warning"> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  PUBLISHED: "success",
  SUSPENDED: "warning",
  ARCHIVED: "neutral",
};

export default async function SupplierProductsPage() {
  const { supplierId } = await requireSupplierId();

  const products = await prisma.product.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products & Packages</h1>
          <p className="text-sm text-ink-muted">{products.length} products in your catalog.</p>
        </div>
        <Button href="/supplier/packages/new" size="sm">New package</Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-5 py-3 text-ink-muted">{p.type}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatMoney(p.basePrice.toString(), p.currencyCode)}</td>
                  <td className="px-5 py-3 text-ink-muted">★ {p.ratingAverage.toString()}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status.replaceAll("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                    No products yet — start the package creation wizard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
