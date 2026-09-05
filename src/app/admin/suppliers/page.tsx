import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  INFORMATION_REQUIRED: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export default async function AdminSuppliersPage() {
  await requireAdmin();

  const suppliers = await prisma.supplier.findMany({
    include: { organization: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Suppliers</h1>
      <p className="text-sm text-ink-muted">{suppliers.length} suppliers on the platform.</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Trust score</th>
                <th className="px-5 py-3">Verification</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{s.businessName}</td>
                  <td className="px-5 py-3 text-ink-muted">{s.type.replaceAll("_", " ")}</td>
                  <td className="px-5 py-3 text-ink-muted">{s._count.products}</td>
                  <td className="px-5 py-3 text-ink-muted">{s.trustScore}/100</td>
                  <td className="px-5 py-3">
                    <Badge tone={TONE[s.verificationStatus]}>{s.verificationStatus.replaceAll("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-ink-muted">No suppliers yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
