import { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-gray-100 bg-white p-5 shadow-soft transition-all duration-200",
        interactive && "hover:shadow-lift hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
