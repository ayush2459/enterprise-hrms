import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={clsx(
            "rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all duration-150",
            "placeholder:text-ink-faint",
            "focus:border-brand focus:shadow-glow",
            "hover:border-gray-300",
            error && "border-red-400 focus:border-red-500 focus:shadow-none focus:ring-2 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
