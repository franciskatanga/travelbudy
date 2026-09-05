import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  brand: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  outline: "border border-border bg-surface-raised text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
  gold: "bg-gold-500 text-navy-900 hover:bg-gold-400",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}

export function Button({ variant = "primary", size = "md", className, href, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
