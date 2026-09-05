import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/hotels", label: "Hotels" },
  { href: "/tours", label: "Tours" },
  { href: "/activities", label: "Activities" },
  { href: "/packages", label: "Packages" },
  { href: "/deals", label: "Deals" },
];

export async function MarketplaceHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-white">
            T
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">TravelBudy</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <SignOutButton className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface-raised px-3 text-sm font-medium text-ink hover:bg-surface" />
          ) : (
            <>
              <Button href="/login" variant="outline" size="sm">
                Log in
              </Button>
              <Button href="/signup" variant="primary" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
