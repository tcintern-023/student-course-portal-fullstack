import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-slate-950 text-white shadow-lg shadow-slate-200 hover:-translate-y-0.5 hover:bg-indigo-600",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600",
  ghost:
    "text-indigo-600 hover:text-indigo-700 px-0 py-0",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all";

interface SharedProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

interface LinkButtonProps extends SharedProps {
  href: string;
}

interface ClickButtonProps
  extends SharedProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

type ButtonProps = LinkButtonProps | ClickButtonProps;

/**
 * Reusable Button component.
 * - Pass `href` to render a navigable Next.js <Link>.
 * - Omit `href` to render a native <button> (e.g. for form submits, onClick handlers).
 */
export default function Button({
  variant = "primary",
  children,
  className = "",
  href,
  ...rest
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
