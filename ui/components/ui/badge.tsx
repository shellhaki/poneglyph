import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export function Badge({
  className,
  accent = false,
  ...props
}: ComponentProps<"span"> & { accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium",
        accent
          ? "border-accent/25 bg-accent-soft text-accent"
          : "border-border bg-surface-2 text-muted",
        className,
      )}
      {...props}
    />
  );
}
