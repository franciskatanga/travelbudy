import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = ["/agent", "/supplier", "/admin", "/account"];

/**
 * Edge-safe NextAuth config: no providers, no Prisma, no bcrypt. This is the
 * only config middleware may import — Vercel's Edge Runtime cannot bundle
 * Node-only modules (Prisma's query engine, bcrypt's native binding), so
 * pulling those into middleware breaks the build. The full config with the
 * Credentials provider lives in auth.ts and is only used by Node.js routes.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected = PROTECTED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
      return isProtected ? Boolean(auth?.user) : true;
    },
  },
};
