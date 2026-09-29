import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        tone === "accent"
          ? "bg-[#C6462F]/10 text-[#A63825]"
          : "bg-[#171512]/5 text-[#171512]/75"
      }`}
    >
      {children}
    </span>
  );
}
