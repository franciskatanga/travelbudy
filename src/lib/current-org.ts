import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Resolves the active agency organization for the signed-in agent/owner.
 * Redirects to login if unauthenticated, or home if the user has no agency
 * membership — this is the tenant-scoping boundary for all /agent pages.
 */
export async function requireAgentOrganizationId(): Promise<{ organizationId: string; userId: string }> {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/agent");
  const organizationId = session.user.organizationIds[0];
  if (!organizationId) redirect("/");
  return { organizationId, userId: session.user.id };
}

export async function requireSupplierId(): Promise<{ supplierId: string; userId: string }> {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/supplier");
  const supplierId = session.user.supplierIds[0];
  if (!supplierId) redirect("/");
  return { supplierId, userId: session.user.id };
}

export async function requireAdmin(): Promise<{ userId: string; permissions: string[] }> {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!session.user.permissions.includes("analytics.view") && !session.user.permissions.includes("system.settings")) {
    redirect("/");
  }
  return { userId: session.user.id, permissions: session.user.permissions };
}

/** Resolves (or lazily creates) the traveller's own Customer CRM record. */
export async function requireTravellerCustomer() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const { prisma } = await import("@/lib/prisma");
  const customer = await prisma.customer.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, fullName: session.user.name ?? "Traveller", email: session.user.email },
  });
  return customer;
}
