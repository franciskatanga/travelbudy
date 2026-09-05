import { prisma } from "@/lib/prisma";

/**
 * Agents publish packages on behalf of their agency. Since the catalog model
 * ties every Product to a Supplier, each agency gets one lazily-created
 * "virtual supplier" record representing its own curated packages —
 * distinct from real hotel/tour-operator suppliers on the marketplace.
 */
export async function getOrCreateAgencySupplier(organizationId: string) {
  const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });

  const existing = await prisma.supplier.findFirst({
    where: { organizationId, type: "TOUR_OPERATOR", slug: `${organization.slug}-packages` },
  });
  if (existing) return existing;

  return prisma.supplier.create({
    data: {
      organizationId,
      countryId: organization.countryId ?? (await prisma.country.findFirstOrThrow()).id,
      type: "TOUR_OPERATOR",
      businessName: `${organization.name} — Curated Packages`,
      slug: `${organization.slug}-packages`,
      about: `Packages curated and published by ${organization.name}.`,
      verificationStatus: "APPROVED",
      badges: ["agency_curated"],
      trustScore: 80,
    },
  });
}
