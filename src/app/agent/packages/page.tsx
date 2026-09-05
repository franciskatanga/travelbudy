import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success"> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  PUBLISHED: "success",
  SUSPENDED: "warning",
  ARCHIVED: "neutral",
};

export default async function AgentPackagesPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const packages = await prisma.product.findMany({
    where: { supplier: { organizationId } },
    include: { destination: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Packages</h1>
          <p className="text-sm text-ink-muted">{packages.length} packages published by your agency.</p>
        </div>
        <Button href="/agent/packages/new" size="sm">Post a package</Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">
                    <a href={`/packages/${p.slug}`} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                      {p.title}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{p.destination?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatMoney(p.basePrice.toString(), p.currencyCode)}</td>
                  <td className="px-5 py-3 text-ink-muted">{p.durationDays ? `${p.durationDays} days` : "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status.replaceAll("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                    You haven&apos;t posted any packages yet.
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
