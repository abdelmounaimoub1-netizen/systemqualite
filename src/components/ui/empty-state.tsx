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
    <div className="rounded border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="rounded bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
          Aucun resultat
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
