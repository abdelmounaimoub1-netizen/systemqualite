import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
          No records yet
        </span>
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
        {ctaLabel && onCta ? (
          <Button className="mt-2" onClick={onCta}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
