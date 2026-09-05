import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "@/components/nav/dashboard-shell";

const ACCOUNT_NAV: NavItem[] = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/trips", label: "My Trips" },
  { href: "/account/bookings", label: "Bookings" },
  { href: "/account/messages", label: "Messages" },
  { href: "/account/documents", label: "Documents" },
  { href: "/account/payments", label: "Payments" },
  { href: "/account/profile", label: "Profile" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="My Account" navItems={ACCOUNT_NAV}>
      {children}
    </DashboardShell>
  );
}
