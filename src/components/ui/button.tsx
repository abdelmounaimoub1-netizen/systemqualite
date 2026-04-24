"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-ink text-white shadow-glow hover:bg-slate-800 disabled:bg-slate-400 disabled:text-white",
  secondary:
    "bg-white/85 text-ink ring-1 ring-slate-200 hover:bg-white disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-600 hover:bg-white/70 hover:text-ink disabled:text-slate-400",
  danger:
    "bg-danger text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:text-white"
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
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
