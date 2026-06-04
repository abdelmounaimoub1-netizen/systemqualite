"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { ChildRecordsSection } from "@/components/modules/child-records-section";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { canWriteModule } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import type {
  ChildModuleConfig,
  LookupCollection,
  SerializableModuleConfig,
  UserContext
} from "@/types/app";

type SupplierComplaintWorkflowClientProps = {
  context: UserContext;
  config: SerializableModuleConfig;
  record: Record<string, unknown>;
  lookups: LookupCollection;
  childrenData: Record<string, Array<Record<string, unknown>>>;
};

const inputClass =
  "h-8 w-full border border-[#b8c4ca] bg-white px-2 text-sm text-[#1f2c3a] outline-none focus:border-[#008fc3]";

function fieldValue(values: Record<string, unknown>, key: string) {
  const value = values[key];
  return value === null || value === undefined ? "" : String(value);
}

export function SupplierComplaintWorkflowClient({
  context,
  config,
  record,
  lookups,
  childrenData
}: SupplierComplaintWorkflowClientProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(record);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteModule(context.role, config.slug);

  const commentConfig = config.childModules?.find((child) =>
    child.key.startsWith("comments-")
  ) as ChildModuleConfig | undefined;
  const attachmentConfig = config.childModules?.find((child) =>
    child.key.startsWith("attachments-")
  ) as ChildModuleConfig | undefined;

  function setField(key: string, value: string | null) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function saveRecord(message = "Reclamation fournisseur enregistree.") {
    if (!canWrite) return;
    setSaving(true);

    try {
      const response = await fetch("/api/records/supplier_complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, values })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Enregistrement impossible.");
      }
      toast.success(message);
      setValues((current) => ({ ...current, ...values }));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden border border-[#8bd7ee] bg-[#f8fcff] shadow-sm">
        <div className="flex items-center gap-3 bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-3 py-2 text-white shadow-[inset_0_-2px_0_#ffcd12]">
          <Link href="/supplier-complaints" className="inline-flex h-8 w-8 items-center justify-center rounded border border-white/30 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase text-[#fff4b8]">Reclamation fournisseur</div>
            <h1 className="text-base font-semibold">
              {fieldValue(values, "reference")} — {fieldValue(values, "supplier_name") || "Fournisseur"}
            </h1>
          </div>
          <StatusBadge value={fieldValue(values, "status")} />
        </div>
      </section>

      <section className="border border-[#c7d1d7] bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-[#2749a0]">1. Identification</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-[#2f3a43]">
            Reference
            <input className={inputClass} value={fieldValue(values, "reference")} onChange={(e) => setField("reference", e.target.value)} readOnly={!canWrite} />
          </label>
          <label className="text-xs font-semibold text-[#2f3a43]">
            Type d&apos;ecart
            <input className={inputClass} value={fieldValue(values, "issue_type")} onChange={(e) => setField("issue_type", e.target.value)} readOnly={!canWrite} />
          </label>
          <label className="text-xs font-semibold text-[#2f3a43] md:col-span-2">
            Description
            <textarea className={`${inputClass} min-h-20 py-2`} value={fieldValue(values, "description")} onChange={(e) => setField("description", e.target.value)} readOnly={!canWrite} />
          </label>
          <label className="text-xs font-semibold text-[#2f3a43]">
            Criticite
            <select className={inputClass} value={fieldValue(values, "severity")} onChange={(e) => setField("severity", e.target.value)} disabled={!canWrite}>
              <option value="Low">Faible</option>
              <option value="Medium">Moyenne</option>
              <option value="High">Elevee</option>
              <option value="Critical">Critique</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-[#2f3a43]">
            Statut
            <select className={inputClass} value={fieldValue(values, "status")} onChange={(e) => setField("status", e.target.value)} disabled={!canWrite}>
              <option value="Open">Ouvert</option>
              <option value="In Progress">En cours</option>
              <option value="Closed">Clos</option>
            </select>
          </label>
        </div>
      </section>

      <section className="border border-[#c7d1d7] bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-[#2749a0]">2. Suivi et echeances</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-[#2f3a43]">
            Date reception
            <input type="date" className={inputClass} value={fieldValue(values, "received_date")} onChange={(e) => setField("received_date", e.target.value || null)} readOnly={!canWrite} />
          </label>
          <label className="text-xs font-semibold text-[#2f3a43]">
            Echeance reponse
            <input type="date" className={inputClass} value={fieldValue(values, "due_date")} onChange={(e) => setField("due_date", e.target.value || null)} readOnly={!canWrite} />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Mis a jour: {formatDate(String(values.updated_at ?? ""))}
        </p>
      </section>

      {canWrite ? (
        <div className="flex justify-end">
          <Button disabled={saving} onClick={() => void saveRecord()}>
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      ) : null}

      {attachmentConfig ? (
        <ChildRecordsSection
          config={attachmentConfig}
          records={childrenData[attachmentConfig.key] ?? []}
          lookups={lookups}
          role={context.role}
          parentId={String(record.id)}
          userId={context.userId}
          variant="qualios"
        />
      ) : null}
      {commentConfig ? (
        <ChildRecordsSection
          config={commentConfig}
          records={childrenData[commentConfig.key] ?? []}
          lookups={lookups}
          role={context.role}
          parentId={String(record.id)}
          userId={context.userId}
          variant="qualios"
        />
      ) : null}
    </div>
  );
}
