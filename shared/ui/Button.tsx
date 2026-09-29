import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

const variants = {
  primary: "border-transparent bg-[#C6462F] text-white hover:bg-[#AC3C29]",
  secondary: "border-[#171512]/20 bg-white text-[#171512] hover:bg-[#F6F3EE]",
  ghost: "border-transparent text-[#C6462F] hover:bg-[#C6462F]/5",
};

export function Button({
  variant = "secondary",
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6462F] disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
        />
      )}
      {children}
    </button>
  );
}
