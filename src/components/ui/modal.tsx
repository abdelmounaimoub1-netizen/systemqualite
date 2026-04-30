"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17306b]/45 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded border border-[#b9def4] bg-white p-5 shadow-2xl",
          className
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            title="Fermer"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded border border-[#b9def4] bg-[#edf7ff] p-2 text-[#2749a0] transition hover:bg-[#fff4b8] hover:text-[#17306b]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
