import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "@/components/nav/dashboard-shell";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/travellers", label: "Travellers" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/commissions", label: "Commissions" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/roles", label: "Roles & Permissions" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="Admin Control Tower" navItems={ADMIN_NAV}>
      {children}
    </DashboardShell>
  );
}
