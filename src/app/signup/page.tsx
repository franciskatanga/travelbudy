import { signupTraveller } from "@/lib/actions/signup-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-white">T</span>
            <span className="text-lg font-semibold text-ink">TravelBudy</span>
          </div>
          <h1 className="mt-7 text-xl font-semibold text-ink">Create your traveller account</h1>
          <p className="mt-1 text-sm text-ink-muted">Save journeys, request quotes and manage every trip in one place.</p>

          {params.error && (
            <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{params.error}</p>
          )}

          <form action={signupTraveller} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Full name</label>
              <Input name="name" required className="mt-1" placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <Input name="email" type="email" required className="mt-1" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Password</label>
              <Input name="password" type="password" minLength={8} required className="mt-1" placeholder="At least 8 characters" />
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account? <a href="/login" className="font-medium text-brand-600 hover:text-brand-700">Log in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
