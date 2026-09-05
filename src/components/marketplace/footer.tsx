import Link from "next/link";

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-border bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">TravelBudy</p>
            <p className="mt-2 text-sm text-white/60">
              The operating system for modern travel commerce.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="/destinations">Destinations</Link></li>
              <li><Link href="/packages">Packages</Link></li>
              <li><Link href="/deals">Deals</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Partners</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="/for-agents">For Travel Agents</Link></li>
              <li><Link href="/for-suppliers">For Suppliers</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/trust">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} TravelBudy. Built in Zambia, designed for the world.
        </div>
      </div>
    </footer>
  );
}
