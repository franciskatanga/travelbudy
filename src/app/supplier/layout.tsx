import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "@/components/nav/dashboard-shell";

const SUPPLIER_NAV: NavItem[] = [
  { href: "/supplier", label: "Dashboard" },
  { href: "/supplier/products", label: "Products" },
  { href: "/supplier/packages", label: "Packages" },
  { href: "/supplier/availability", label: "Availability" },
  { href: "/supplier/bookings", label: "Bookings" },
  { href: "/supplier/customers", label: "Customers" },
  { href: "/supplier/messages", label: "Messages" },
  { href: "/supplier/reviews", label: "Reviews" },
  { href: "/supplier/finance", label: "Finance" },
  { href: "/supplier/verification", label: "Verification" },
];

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="Supplier Portal" navItems={SUPPLIER_NAV}>
      {children}
    </DashboardShell>
  );
}
