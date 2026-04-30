import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border border-[#b9def4] bg-white px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-wide text-[#00a9da]">
            {eyebrow}
          </div>
        ) : null}
        <div>
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
