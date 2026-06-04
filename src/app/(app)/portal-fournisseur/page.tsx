import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, FileStack, MessageSquareWarning } from "lucide-react";

import {
  SupplierPortalAckBanner,
  SupplierPortalNewComplaint
} from "@/components/portal/supplier-portal-client";
import { getMyPendingAcknowledgments } from "@/lib/modules/queries";
import { getCurrentUserContext, createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SupplierPortalPage() {
  const context = await getCurrentUserContext();

  if (!context) {
    redirect("/auth/sign-in");
  }

  if (context.role !== "supplier_viewer") {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: documents }, { data: complaints }, ackResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id,document_code,title,status,effective_date,confidentiality_level")
      .eq("status", "Approved")
      .in("confidentiality_level", ["Fournisseur", "Public portail"])
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("supplier_complaints")
      .select("id,reference,supplier_name,issue_type,status,created_at,description")
      .order("updated_at", { ascending: false })
      .limit(20),
    getMyPendingAcknowledgments()
  ]);

  const pendingAcks = ackResult.items;

  return (
    <section className="space-y-4">
      <header className="overflow-hidden border border-[#8bd7ee] bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-4 py-3 text-white shadow-[inset_0_-2px_0_#ffcd12]">
        <div className="flex items-center gap-2 text-[#fff4b8]">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase">Portail fournisseur</span>
        </div>
        <h1 className="text-lg font-semibold">Espace extranet Qualios</h1>
        <p className="text-sm text-white/90">
          Documents approuves partages et suivi des reclamations fournisseur.
        </p>
      </header>

      <SupplierPortalAckBanner pendingAckCount={pendingAcks.length} />

      <SupplierPortalNewComplaint />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-[#b9def4] bg-white shadow-sm">
          <div className="border-b border-[#d5edf8] bg-[#f8fcff] px-3 py-2 text-sm font-semibold text-[#2749a0]">
            <FileStack className="mr-2 inline h-4 w-4" />
            Documents partages
          </div>
          <div className="divide-y divide-[#d5edf8]">
            {(documents ?? []).length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">Aucun document disponible.</p>
            ) : (
              (documents ?? []).map((doc) => (
                <Link
                  key={String(doc.id)}
                  href={`/documents/${doc.id}`}
                  className="block px-3 py-2 text-sm hover:bg-[#fff4b8]"
                >
                  <div className="font-semibold text-ink">
                    {String(doc.document_code)} — {String(doc.title)}
                  </div>
                  <div className="text-xs text-muted">
                    {String(doc.confidentiality_level)} · {formatDate(String(doc.effective_date ?? ""))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="border border-[#b9def4] bg-white shadow-sm">
          <div className="border-b border-[#d5edf8] bg-[#f8fcff] px-3 py-2 text-sm font-semibold text-[#2749a0]">
            <MessageSquareWarning className="mr-2 inline h-4 w-4" />
            Reclamations fournisseur
          </div>
          <div className="divide-y divide-[#d5edf8]">
            {(complaints ?? []).length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">Aucune reclamation.</p>
            ) : (
              (complaints ?? []).map((row) => (
                <Link
                  key={String(row.id)}
                  href={`/supplier-complaints/${row.id}`}
                  className="block px-3 py-2 text-sm hover:bg-[#fff4b8]"
                >
                  <div className="font-semibold text-ink">
                    {String(row.reference ?? "")} — {String(row.supplier_name ?? "Fournisseur")}
                  </div>
                  <div className="line-clamp-1 text-xs text-muted">
                    {String(row.issue_type ?? "")} · {String(row.status)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
