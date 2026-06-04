import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { StatusBadge } from "@/components/ui/badge";
import { getMyPendingAcknowledgments } from "@/lib/modules/queries";
import { formatDate } from "@/lib/utils";

export default async function MyAcknowledgmentsPage() {
  const { items } = await getMyPendingAcknowledgments();

  return (
    <section className="space-y-4">
      <header className="border border-[#8bd7ee] bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-4 py-3 text-white shadow-[inset_0_-2px_0_#ffcd12]">
        <div className="flex items-center gap-2 text-[#fff4b8]">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase">GED — Accuse de lecture</span>
        </div>
        <h1 className="text-lg font-semibold">Mes accuses de reception en attente</h1>
        <p className="text-sm text-white/90">
          Documents diffuses qui necessitent votre accusé de lecture.
        </p>
      </header>

      <div className="overflow-hidden border border-[#b9def4] bg-white shadow-sm">
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">Aucun accuse en attente.</p>
        ) : (
          <div className="divide-y divide-[#d5edf8]">
            {items.map((item) => {
              const document = item.document as Record<string, unknown> | null;
              if (!document) return null;

              return (
                <Link
                  key={String(item.id)}
                  href={`/documents/${document.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-[#fff4b8] md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-semibold text-ink">
                      {String(document.document_code)} — {String(document.title)}
                    </div>
                    <div className="text-xs text-muted">
                      {String(item.recipient_group ?? "Portail")} · Echeance{" "}
                      {formatDate(String(item.due_date ?? ""))}
                    </div>
                  </div>
                  <StatusBadge value={String(item.status ?? "To Acknowledge")} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
