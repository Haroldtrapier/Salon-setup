"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && "bg-black text-white hover:bg-gray-800",
          variant === "outline" &&
            "border border-black text-black hover:bg-black hover:text-white",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-8 text-base",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
