"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-[#2749a0] bg-[#2749a0] text-white hover:border-[#00a9da] hover:bg-[#00a9da] disabled:border-slate-300 disabled:bg-slate-300 disabled:text-white",
  secondary:
    "border-[#b9def4] bg-white text-[#2749a0] hover:bg-[#fff4b8] disabled:text-slate-400",
  ghost:
    "border-transparent bg-transparent text-[#2749a0] hover:border-[#b9def4] hover:bg-white hover:text-[#00a9da] disabled:text-slate-400",
  danger:
    "border-danger bg-danger text-white hover:brightness-95 disabled:border-danger/30 disabled:bg-danger/30 disabled:text-white"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#00a9da]/25 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
