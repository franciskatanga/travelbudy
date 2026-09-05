import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserPermissions, getUserOrganizationIds, getUserSupplierIds } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const requestedCallbackUrl = formData.get("callbackUrl") as string | null;

    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(requestedCallbackUrl ?? "/")}`);
    }

    // No explicit destination was requested — route the user to their own
    // dashboard based on role. Don't call auth() here: signIn() only sets the
    // session cookie on the outgoing response, so a same-request auth() read
    // would still see the pre-login (unauthenticated) request cookies.
    if (!requestedCallbackUrl || requestedCallbackUrl === "/") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const [permissions, organizationIds, supplierIds] = await Promise.all([
          getUserPermissions(user.id),
          getUserOrganizationIds(user.id),
          getUserSupplierIds(user.id),
        ]);
        if (permissions.includes("system.settings") || permissions.includes("dispute.manage")) {
          redirect("/admin");
        }
        if (supplierIds.length) {
          redirect("/supplier");
        }
        if (organizationIds.length) {
          redirect("/agent");
        }
      }
      redirect("/account");
    }

    redirect(requestedCallbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <h1 className="text-xl font-semibold text-ink">Log in to TravelBudy</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Traveller, agent, supplier and admin accounts all sign in here.
          </p>

          {params.error && (
            <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              Invalid email or password.
            </p>
          )}

          <form action={login} className="mt-6 space-y-4">
            <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? ""} />
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <Input name="email" type="email" required className="mt-1" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Password</label>
              <Input name="password" type="password" required className="mt-1" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>

          <div className="mt-6 rounded-md bg-surface p-3 text-xs text-ink-muted">
            <p className="font-medium text-ink">Demo accounts (password: Demo1234!)</p>
            <ul className="mt-1 space-y-0.5">
              <li>Agent — agent@zambezitravel.demo</li>
              <li>Agency owner — owner@zambezitravel.demo</li>
              <li>Supplier — manager@royallivingstone.demo</li>
              <li>Admin — admin@travelbudy.demo</li>
              <li>Traveller — traveller@demo.com</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
