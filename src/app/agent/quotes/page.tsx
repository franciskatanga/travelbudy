import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function QuotesPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const quotes = await prisma.quote.findMany({
    where: { organizationId },
    include: { customer: true, lineItems: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Quotes</h1>
      <p className="text-sm text-ink-muted">{quotes.length} quotes built from marketplace inventory.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {quotes.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{q.customer?.fullName ?? "Unassigned"}</p>
                <p className="text-xs text-ink-muted">{q.lineItems.length} line items</p>
              </div>
              <Badge tone={q.status === "accepted" ? "success" : "neutral"}>{q.status}</Badge>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>{formatMoney(q.subtotal.toString(), q.currencyCode)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Tax</span>
                <span>{formatMoney(q.taxAmount.toString(), q.currencyCode)}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink">
                <span>Total</span>
                <span>{formatMoney(q.totalAmount.toString(), q.currencyCode)}</span>
              </div>
            </div>
          </Card>
        ))}
        {quotes.length === 0 && <p className="text-sm text-ink-muted">No quotes yet.</p>}
      </div>
    </div>
  );
}
