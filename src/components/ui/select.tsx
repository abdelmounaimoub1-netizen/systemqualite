import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded border border-[#b9def4] bg-white px-2 py-1 text-sm text-ink shadow-sm outline-none transition focus:border-[#00a9da] focus:ring-2 focus:ring-[#00a9da]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
