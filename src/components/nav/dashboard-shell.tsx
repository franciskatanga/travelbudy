"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

export interface NavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const activePath = usePathname();

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-navy-900 text-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-navy-900">
            T
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">TravelBudy</p>
            <p className="text-xs text-white/50">{title}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-0.5 border-t border-white/10 p-3">
          <Link href="/" className="block rounded-md px-3 py-2 text-sm text-white/50 hover:text-white">
            ← Back to marketplace
          </Link>
          <SignOutButton className="block w-full rounded-md px-3 py-2 text-left text-sm text-white/50 hover:bg-white/5 hover:text-white" />
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
