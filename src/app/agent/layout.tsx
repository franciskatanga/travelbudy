import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "@/components/nav/dashboard-shell";

const AGENT_NAV: NavItem[] = [
  { href: "/agent", label: "Dashboard" },
  { href: "/agent/leads", label: "Leads" },
  { href: "/agent/customers", label: "Customers" },
  { href: "/agent/quotes", label: "Quotes" },
  { href: "/agent/proposals", label: "Proposals" },
  { href: "/agent/packages", label: "Packages" },
  { href: "/agent/bookings", label: "Bookings" },
  { href: "/agent/messages", label: "Messages" },
  { href: "/agent/tasks", label: "Tasks" },
  { href: "/agent/finance", label: "Finance" },
];

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="Agent CRM" navItems={AGENT_NAV}>
      {children}
    </DashboardShell>
  );
}
