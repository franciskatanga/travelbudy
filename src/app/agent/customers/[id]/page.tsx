import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireAgentOrganizationId();
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId },
    include: {
      bookings: { orderBy: { createdAt: "desc" } },
      quotes: { orderBy: { createdAt: "desc" } },
      leads: true,
      documents: true,
    },
  });

  if (!customer) notFound();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">{customer.fullName}</h1>
      <p className="text-sm text-ink-muted">
        {customer.email} · {customer.nationality ?? "Nationality unknown"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink">{b.reference}</p>
                    <p className="text-xs text-ink-muted">{formatMoney(b.totalAmount.toString(), b.currencyCode)}</p>
                  </div>
                  <BookingStatusPill status={b.status} />
                </div>
              ))}
              {customer.bookings.length === 0 && <p className="text-sm text-ink-muted">No bookings yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-ink">{formatMoney(q.totalAmount.toString(), q.currencyCode)}</p>
                  <span className="text-xs capitalize text-ink-muted">{q.status}</span>
                </div>
              ))}
              {customer.quotes.length === 0 && <p className="text-sm text-ink-muted">No quotes yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink-muted">
              {customer.documents.length === 0 ? "No documents uploaded." : customer.documents.map((d) => (
                <p key={d.id}>{d.type}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-muted">{customer.notes ?? "No notes yet."}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
