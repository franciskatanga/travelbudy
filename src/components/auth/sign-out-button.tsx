import { logoutAction } from "@/lib/actions/auth-actions";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        Log out
      </button>
    </form>
  );
}
