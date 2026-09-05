import { prisma } from "@/lib/prisma";
import { requireSupplierId } from "@/lib/current-org";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function SupplierDashboardPage() {
  const { supplierId } = await requireSupplierId();

  const supplier = await prisma.supplier.findUniqueOrThrow({ where: { id: supplierId } });
  const [products, bookingItems, reviews] = await Promise.all([
    prisma.product.findMany({ where: { supplierId } }),
    prisma.bookingItem.findMany({ where: { product: { supplierId } }, include: { booking: true } }),
    prisma.review.findMany({ where: { supplierId } }),
  ]);

  const revenue = bookingItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink">{supplier.businessName}</h1>
        {supplier.badges.includes("verified") && <Badge tone="brand">Verified</Badge>}
        <Badge tone="gold">Trust Score {supplier.trustScore}/100</Badge>
      </div>
      <p className="text-sm text-ink-muted">Supplier dashboard — {supplier.type.replaceAll("_", " ").toLowerCase()}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatMoney(revenue)} />
        <KpiCard label="Published products" value={`${publishedCount}/${products.length}`} />
        <KpiCard label="Bookings" value={String(bookingItems.length)} />
        <KpiCard label="Average rating" value={String(avgRating)} helpText={`${reviews.length} reviews`} />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Verification status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge tone={supplier.verificationStatus === "APPROVED" ? "success" : "warning"}>
              {supplier.verificationStatus.replaceAll("_", " ")}
            </Badge>
            <p className="text-sm text-ink-muted">
              {supplier.badges.length > 0 ? supplier.badges.join(", ") : "No badges yet"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
