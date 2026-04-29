import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-slate-300 bg-white p-4 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
