import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ease-out",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
        "active:scale-[0.98]",
        variant === "primary" &&
          "bg-brand text-white shadow-soft hover:bg-brand/90 hover:shadow-lift hover:-translate-y-0.5",
        variant === "secondary" &&
          "bg-white text-ink border border-gray-200 hover:border-brand/40 hover:bg-surface-muted",
        variant === "ghost" &&
          "bg-transparent text-ink-soft hover:bg-surface-muted hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
