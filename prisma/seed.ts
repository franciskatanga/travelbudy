import { PrismaClient, OrganizationType, SupplierType, ProductType, ProductStatus, VerificationStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "../src/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  // ── Platform config ─────────────────────────────────────────
  const zmw = await prisma.currency.upsert({
    where: { code: "ZMW" },
    update: {},
    create: { code: "ZMW", name: "Zambian Kwacha", symbol: "K", decimalPlaces: 2 },
  });

  await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: { code: "en", name: "English" },
  });

  const zambia = await prisma.country.upsert({
    where: { code: "ZM" },
    update: {},
    create: {
      code: "ZM",
      name: "Zambia",
      currencyId: zmw.id,
      timezone: "Africa/Lusaka",
      taxRules: { vatPercent: 16 },
    },
  });

  // ── RBAC: permissions & roles ───────────────────────────────
  for (const key of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  for (const [roleKey, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      update: {},
      create: { key: roleKey, name: roleKey.replace(/_/g, " ") },
    });
    for (const permKey of permissionKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key: permKey } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  // ── Organizations ────────────────────────────────────────────
  const zambeziAgency = await prisma.organization.upsert({
    where: { slug: "zambezi-travel-agency" },
    update: {},
    create: {
      type: OrganizationType.AGENCY,
      name: "Zambezi Travel Agency",
      slug: "zambezi-travel-agency",
      countryId: zambia.id,
      isDemo: true,
      branding: { primaryColor: "#0f9d8a" },
    },
  });

  const royalLivingstoneOrg = await prisma.organization.upsert({
    where: { slug: "royal-livingstone-collection" },
    update: {},
    create: {
      type: OrganizationType.SUPPLIER,
      name: "Royal Livingstone Collection",
      slug: "royal-livingstone-collection",
      countryId: zambia.id,
      isDemo: true,
    },
  });

  const southLuangwaOrg = await prisma.organization.upsert({
    where: { slug: "south-luangwa-safaris" },
    update: {},
    create: {
      type: OrganizationType.SUPPLIER,
      name: "South Luangwa Safaris",
      slug: "south-luangwa-safaris",
      countryId: zambia.id,
      isDemo: true,
    },
  });

  // ── Users ────────────────────────────────────────────────────
  const agentUser = await prisma.user.upsert({
    where: { email: "agent@zambezitravel.demo" },
    update: {},
    create: {
      email: "agent@zambezitravel.demo",
      name: "Chanda Mwansa",
      passwordHash,
      isDemo: true,
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@zambezitravel.demo" },
    update: {},
    create: {
      email: "owner@zambezitravel.demo",
      name: "Bwalya Chileshe",
      passwordHash,
      isDemo: true,
    },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: "manager@royallivingstone.demo" },
    update: {},
    create: {
      email: "manager@royallivingstone.demo",
      name: "Mutale Banda",
      passwordHash,
      isDemo: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@travelbudy.demo" },
    update: {},
    create: {
      email: "admin@travelbudy.demo",
      name: "Platform Admin",
      passwordHash,
      isDemo: true,
    },
  });

  const travellerUser = await prisma.user.upsert({
    where: { email: "traveller@demo.com" },
    update: {},
    create: {
      email: "traveller@demo.com",
      name: "Sarah Johnson",
      passwordHash,
      isDemo: true,
    },
  });

  const ownerMember = await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: zambeziAgency.id, userId: ownerUser.id } },
    update: {},
    create: { organizationId: zambeziAgency.id, userId: ownerUser.id, isOwner: true, title: "Agency Owner" },
  });
  const agentMember = await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: zambeziAgency.id, userId: agentUser.id } },
    update: {},
    create: { organizationId: zambeziAgency.id, userId: agentUser.id, title: "Senior Travel Agent" },
  });

  async function assignRole(userId: string, roleKey: string, organizationMemberId?: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId: role.id, organizationMemberId: organizationMemberId ?? null },
    });
    if (!existing) {
      await prisma.userRole.create({ data: { userId, roleId: role.id, organizationMemberId } });
    }
  }

  await assignRole(ownerUser.id, "agency_owner", ownerMember.id);
  await assignRole(agentUser.id, "agent", agentMember.id);
  await assignRole(adminUser.id, "super_admin");
  await assignRole(travellerUser.id, "traveller");

  // ── Destinations ─────────────────────────────────────────────
  const destinationData = [
    { name: "Victoria Falls", slug: "victoria-falls", categories: ["adventure", "wildlife", "honeymoon"], img: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&q=80" },
    { name: "Livingstone", slug: "livingstone", categories: ["adventure", "cultural"], img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80" },
    { name: "South Luangwa", slug: "south-luangwa", categories: ["safari", "wildlife", "luxury"], img: "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=1200&q=80" },
    { name: "Lower Zambezi", slug: "lower-zambezi", categories: ["safari", "adventure"], img: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80" },
    { name: "Kafue", slug: "kafue", categories: ["safari", "wildlife"], img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80" },
    { name: "Lusaka", slug: "lusaka", categories: ["business", "cultural"], img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80" },
    { name: "Lake Kariba", slug: "lake-kariba", categories: ["beach", "family", "weekend getaways"], img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80" },
  ];

  const destinations = [];
  for (const [i, d] of destinationData.entries()) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        countryId: zambia.id,
        name: d.name,
        slug: d.slug,
        description: `Discover ${d.name}, one of Zambia's most celebrated travel destinations.`,
        heroImageUrl: d.img,
        categories: d.categories,
        isFeatured: i < 6,
        isDemo: true,
      },
    });
    destinations.push(dest);
  }

  // ── Suppliers ────────────────────────────────────────────────
  const royalLivingstone = await prisma.supplier.upsert({
    where: { slug: "royal-livingstone-hotel" },
    update: {},
    create: {
      organizationId: royalLivingstoneOrg.id,
      countryId: zambia.id,
      type: SupplierType.HOTEL,
      businessName: "Royal Livingstone Victoria Falls Hotel",
      slug: "royal-livingstone-hotel",
      logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
      about: "A five-star riverside hotel overlooking Victoria Falls, blending colonial elegance with modern luxury.",
      location: "Livingstone, Zambia",
      yearsOperating: 24,
      verificationStatus: VerificationStatus.APPROVED,
      badges: ["verified", "preferred_partner"],
      trustScore: 96,
      isDemo: true,
    },
  });

  const southLuangwaSafaris = await prisma.supplier.upsert({
    where: { slug: "south-luangwa-safaris" },
    update: {},
    create: {
      organizationId: southLuangwaOrg.id,
      countryId: zambia.id,
      type: SupplierType.SAFARI_OPERATOR,
      businessName: "South Luangwa Safaris",
      slug: "south-luangwa-safaris",
      logoUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1200&q=80",
      about: "Award-winning walking safari operator running licensed camps across South Luangwa National Park.",
      location: "South Luangwa, Zambia",
      yearsOperating: 15,
      verificationStatus: VerificationStatus.APPROVED,
      badges: ["verified", "licensed"],
      trustScore: 91,
      isDemo: true,
    },
  });

  await prisma.supplierStaff.upsert({
    where: { supplierId_userId: { supplierId: royalLivingstone.id, userId: supplierUser.id } },
    update: {},
    create: { supplierId: royalLivingstone.id, userId: supplierUser.id, permissionsGroup: "manager" },
  });
  await assignRole(supplierUser.id, "supplier_manager");

  // ── Products / Packages ──────────────────────────────────────
  const victoriaFalls = destinations.find((d) => d.slug === "victoria-falls")!;
  const southLuangwaDest = destinations.find((d) => d.slug === "south-luangwa")!;
  const lowerZambezi = destinations.find((d) => d.slug === "lower-zambezi")!;

  const packagesData = [
    {
      supplierId: royalLivingstone.id,
      destinationId: victoriaFalls.id,
      type: ProductType.PACKAGE,
      title: "Victoria Falls Luxury Escape — 4 Days",
      slug: "victoria-falls-luxury-escape-4-days",
      summary: "Riverside luxury, sunset cruises and guided falls tours in one unforgettable itinerary.",
      basePrice: 1850,
      durationDays: 4,
      categories: ["luxury", "honeymoon", "wildlife"],
      media: ["https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&q=80"],
      rating: 4.8,
    },
    {
      supplierId: southLuangwaSafaris.id,
      destinationId: southLuangwaDest.id,
      type: ProductType.SAFARI,
      title: "South Luangwa Walking Safari — 5 Days",
      slug: "south-luangwa-walking-safari-5-days",
      summary: "Classic walking safaris pioneered in the Luangwa Valley, with expert guides and remote bush camps.",
      basePrice: 2400,
      durationDays: 5,
      categories: ["safari", "wildlife", "adventure"],
      media: ["https://images.unsplash.com/photo-1516934024742-b461fba47600?w=1200&q=80"],
      rating: 4.9,
    },
    {
      supplierId: southLuangwaSafaris.id,
      destinationId: lowerZambezi.id,
      type: ProductType.SAFARI,
      title: "Lower Zambezi Canoe & Safari — 3 Days",
      slug: "lower-zambezi-canoe-safari-3-days",
      summary: "Paddle alongside elephants and hippos, with game drives and riverside camping.",
      basePrice: 1350,
      durationDays: 3,
      categories: ["safari", "adventure", "family"],
      media: ["https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80"],
      rating: 4.7,
    },
  ];

  const products = [];
  for (const p of packagesData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        supplierId: p.supplierId,
        destinationId: p.destinationId,
        type: p.type,
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        description: `${p.summary} Includes accommodation, meals as specified, guided activities and transfers.`,
        categories: p.categories,
        media: p.media,
        itinerary: [
          { day: 1, title: "Arrival & welcome briefing", details: "Airport transfer, check-in, orientation." },
          { day: 2, title: "Full-day guided experience", details: "Signature activity with expert local guides." },
          { day: p.durationDays, title: "Departure", details: "Breakfast and transfer to airport." },
        ],
        inclusions: ["Accommodation", "Daily breakfast", "Guided activities", "Airport transfers"],
        exclusions: ["International flights", "Travel insurance", "Personal expenses"],
        cancellationPolicy: "Free cancellation up to 14 days before arrival. 50% charge within 7 days.",
        termsAndConditions: "Standard TravelBudy marketplace booking terms apply.",
        status: ProductStatus.PUBLISHED,
        basePrice: p.basePrice,
        currencyCode: "ZMW",
        durationDays: p.durationDays,
        ratingAverage: p.rating,
        ratingCount: 24,
        isDemo: true,
      },
    });
    products.push(product);
  }

  // ── Commission rule (global default) ──────────────────────────
  await prisma.commissionRule.upsert({
    where: { id: "global-default-commission" },
    update: {},
    create: {
      id: "global-default-commission",
      name: "Global default commission",
      scope: "global",
      type: "percentage",
      value: 8,
    },
  });

  // ── CRM: customer, lead, quote, proposal, booking (demo workflow) ──
  const customer = await prisma.customer.upsert({
    where: { userId: travellerUser.id },
    update: {},
    create: {
      organizationId: zambeziAgency.id,
      userId: travellerUser.id,
      fullName: "Sarah Johnson",
      email: "traveller@demo.com",
      nationality: "United Kingdom",
      isDemo: true,
    },
  });

  const lead = await prisma.lead.create({
    data: {
      organizationId: zambeziAgency.id,
      customerId: customer.id,
      name: "Sarah Johnson",
      contact: "traveller@demo.com",
      destination: "Victoria Falls",
      travellerCount: 2,
      budget: 4000,
      travelType: "Honeymoon",
      source: "website",
      assignedAgentId: agentUser.id,
      status: "QUALIFIED",
      isDemo: true,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      organizationId: zambeziAgency.id,
      leadId: lead.id,
      customerId: customer.id,
      agentUserId: agentUser.id,
      currencyCode: "ZMW",
      subtotal: 3700,
      taxAmount: 296,
      totalAmount: 3996,
      status: "accepted",
      isDemo: true,
      lineItems: {
        create: [
          {
            productId: products[0].id,
            description: products[0].title,
            quantity: 2,
            unitPrice: 1850,
            subtotal: 3700,
          },
        ],
      },
    },
  });

  const proposal = await prisma.proposal.create({
    data: {
      organizationId: zambeziAgency.id,
      quoteId: quote.id,
      customerId: customer.id,
      title: "Sarah & Partner — Victoria Falls Honeymoon",
      coverImageUrl: packagesData[0].media[0],
      status: "accepted",
      acceptedAt: new Date(),
      sentAt: new Date(),
      viewedAt: new Date(),
    },
  });

  const booking = await prisma.booking.create({
    data: {
      reference: "TRV-2026-000001",
      organizationId: zambeziAgency.id,
      customerId: customer.id,
      proposalId: proposal.id,
      status: BookingStatus.CONFIRMED,
      currencyCode: "ZMW",
      totalAmount: 3996,
      paidAmount: 3996,
      isDemo: true,
      items: {
        create: [
          {
            productId: products[0].id,
            description: products[0].title,
            quantity: 2,
            unitPrice: 1850,
            subtotal: 3700,
          },
        ],
      },
      statusEvents: {
        create: [
          { status: BookingStatus.INQUIRY, note: "Lead qualified" },
          { status: BookingStatus.QUOTE, note: "Quote sent" },
          { status: BookingStatus.CONFIRMED, note: "Payment received in full" },
        ],
      },
    },
  });

  await prisma.commission.create({
    data: {
      bookingId: booking.id,
      organizationId: zambeziAgency.id,
      commissionRuleId: "global-default-commission",
      amount: 319.68,
      status: "available",
    },
  });

  console.log("Seed complete:", {
    destinations: destinations.length,
    products: products.length,
    booking: booking.reference,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
