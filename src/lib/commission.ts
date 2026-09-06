import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Resolves the applicable commission rule for a booking line item using
 * scope priority: product > supplier > agent > destination > global.
 * Never hard-code a commission percentage in application code.
 */
export async function resolveCommissionRule(params: {
  productId?: string | null;
  supplierId?: string | null;
  agentOrganizationId?: string | null;
  destinationId?: string | null;
}) {
  const scopes: Array<{ scope: string; scopeRefId: string | null }> = [
    { scope: "product", scopeRefId: params.productId ?? null },
    { scope: "supplier", scopeRefId: params.supplierId ?? null },
    { scope: "agent", scopeRefId: params.agentOrganizationId ?? null },
    { scope: "destination", scopeRefId: params.destinationId ?? null },
  ];

  for (const { scope, scopeRefId } of scopes) {
    if (!scopeRefId) continue;
    const rule = await prisma.commissionRule.findFirst({
      where: { scope, scopeRefId, isActive: true },
    });
    if (rule) return rule;
  }

  return prisma.commissionRule.findFirst({ where: { scope: "global", isActive: true } });
}

export function calculateCommissionAmount(
  bookingAmount: Decimal | number,
  rule: { type: string; value: Decimal | number } | null
): Decimal {
  const amount = new Decimal(bookingAmount);
  if (!rule) return new Decimal(0);
  const value = new Decimal(rule.value);
  return rule.type === "percentage" ? amount.mul(value).div(100) : value;
}
