import type { ReactNode } from "react";
import { MarketplaceHeader } from "@/components/marketplace/header";
import { MarketplaceFooter } from "@/components/marketplace/footer";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketplaceHeader />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </>
  );
}
