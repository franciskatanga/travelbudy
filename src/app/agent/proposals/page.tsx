import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "brand" | "success" | "warning"> = {
  draft: "neutral",
  sent: "brand",
  viewed: "brand",
  accepted: "success",
  declined: "warning",
};

export default async function AgentProposalsPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const proposals = await prisma.proposal.findMany({
    where: { organizationId },
    include: { customer: true, quote: true, booking: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Proposals</h1>
      <p className="text-sm text-ink-muted">{proposals.length} branded proposals sent to customers.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {proposals.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-xs text-ink-muted">Prepared for {p.customer.fullName}</p>
              </div>
              <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>{p.status}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-ink-muted">
                {formatMoney(p.quote.totalAmount.toString(), p.quote.currencyCode)}
              </span>
              {p.booking ? (
                <Badge tone="success">Booking {p.booking.reference}</Badge>
              ) : (
                <span className="text-xs text-ink-muted">Not yet booked</span>
              )}
            </div>
          </Card>
        ))}
        {proposals.length === 0 && (
          <Card className="col-span-full p-6 text-center text-sm text-ink-muted">
            No proposals yet — build one from a quote.
          </Card>
        )}
      </div>
    </div>
  );
}
