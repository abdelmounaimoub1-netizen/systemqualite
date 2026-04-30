import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded border border-[#b9def4] bg-white px-2 py-2 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#00a9da] focus:ring-2 focus:ring-[#00a9da]/20",
        className
      )}
      {...props}
    />
  );
}
