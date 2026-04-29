import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
