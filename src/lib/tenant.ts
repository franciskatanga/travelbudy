import { prisma } from "@/lib/prisma";

/**
 * Resolves the full set of permission keys granted to a user across all of
 * their role assignments (organization membership and/or supplier staff).
 * This is the single source of truth for authorization checks — never infer
 * access from a role name in application code.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  const permissions = new Set<string>();
  for (const userRole of userRoles) {
    for (const rp of userRole.role.permissions) {
      permissions.add(rp.permission.key);
    }
  }
  return Array.from(permissions);
}

/**
 * Returns the organization IDs a user is a member of. Used to scope every
 * CRM/agency query — an agency must never see another agency's data.
 */
export async function getUserOrganizationIds(userId: string): Promise<string[]> {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: "active" },
    select: { organizationId: true },
  });
  return memberships.map((m) => m.organizationId);
}

/**
 * Returns the supplier IDs a user manages (owner org or staff record).
 * Used to scope every supplier-portal query.
 */
export async function getUserSupplierIds(userId: string): Promise<string[]> {
  const staffRecords = await prisma.supplierStaff.findMany({
    where: { userId, status: "active" },
    select: { supplierId: true },
  });
  const orgIds = await getUserOrganizationIds(userId);
  const ownedSuppliers = await prisma.supplier.findMany({
    where: { organizationId: { in: orgIds } },
    select: { id: true },
  });
  return Array.from(new Set([...staffRecords.map((s) => s.supplierId), ...ownedSuppliers.map((s) => s.id)]));
}

/** Throws unless the organizationId is in the caller's tenant scope. */
export function assertTenantAccess(organizationId: string, allowedOrgIds: string[]) {
  if (!allowedOrgIds.includes(organizationId)) {
    throw new Error("Forbidden: cross-tenant access denied");
  }
}
