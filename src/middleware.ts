import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe instance: built only from authConfig (no providers, no Prisma,
// no bcrypt) so this bundles cleanly for Vercel's Edge Runtime.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/agent/:path*", "/supplier/:path*", "/admin/:path*", "/account/:path*"],
};
