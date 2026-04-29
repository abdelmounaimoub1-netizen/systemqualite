"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-teal-800 bg-teal-700 text-white hover:bg-teal-800 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-white",
  secondary:
    "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 disabled:text-slate-400",
  danger:
    "border-rose-700 bg-danger text-white hover:bg-rose-700 disabled:border-rose-300 disabled:bg-rose-300 disabled:text-white"
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
        "inline-flex min-h-9 items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-700/25 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
