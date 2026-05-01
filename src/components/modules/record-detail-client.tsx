"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ChildRecordsSection } from "@/components/modules/child-records-section";
import { RecordForm } from "@/components/modules/record-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getLookupLabel } from "@/lib/modules/config";
import { canWriteModule } from "@/lib/permissions";
import { getStorageFieldKey, getStorageSignedUrl, openStorageFile } from "@/lib/storage";
import type {
  LookupCollection,
  SerializableModuleConfig,
  UserContext
} from "@/types/app";

type RecordDetailClientProps = {
  context: UserContext;
  config: SerializableModuleConfig;
  record: Record<string, unknown>;
  lookups: LookupCollection;
  childrenData: Record<string, Array<Record<string, unknown>>>;
};

const relationKeyToTable: Record<string, string> = {
  owner_id: "profiles",
  responsible_user_id: "profiles",
  pilot_id: "profiles",
  auditor_id: "profiles",
  employee_id: "profiles",
  submitted_by: "profiles",
  user_id: "profiles",
  role_id: "roles",
  department_id: "departments",
  category_id: "document_categories",
  form_id: "forms",
  non_conformity_id: "non_conformities",
  supplier_id: "suppliers",
  customer_complaint_id: "customer_complaints"
};

function renderDetailValue(field: string, value: unknown, lookups: LookupCollection) {
  if (field.endsWith("_date") || field === "created_at" || field === "updated_at") {
    return formatDate(String(value ?? ""));
  }

  if (field in relationKeyToTable) {
    return getLookupLabel(lookups, relationKeyToTable[field], String(value ?? ""));
  }

  if (
    field === "status" ||
    field === "severity" ||
    field === "risk_level" ||
    field === "priority"
  ) {
    return <StatusBadge value={String(value ?? "")} />;
  }

  return value === null || value === undefined || value === "" ? "Not set" : String(value);
}

function canPreviewInline(filePath: string) {
  const extension = filePath.split("?")[0]?.split(".").pop()?.toLowerCase() ?? "";

  return ["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(extension);
}

export function RecordDetailClient({
  context,
  config,
  record,
  lookups,
  childrenData
}: RecordDetailClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filePreview, setFilePreview] = useState<{ path: string; url: string } | null>(null);
  const [fileError, setFileError] = useState<{ path: string; message: string } | null>(null);
  const canWrite = canWriteModule(context.role, config.slug);
  const storageFieldKey = getStorageFieldKey(config.fields);
  const filePath = storageFieldKey ? String(record[storageFieldKey] ?? "") : "";
  const hasDownloadableFile = Boolean(
    storageFieldKey && filePath.trim().length > 0
  );
  const showInlinePreview = useMemo(() => canPreviewInline(filePath), [filePath]);
  const currentFileUrl = filePreview?.path === filePath ? filePreview.url : null;
  const currentFileError = fileError?.path === filePath ? fileError.message : null;
  const fieldLabels = useMemo(
    () => Object.fromEntries(config.fields.map((field) => [field.key, field.label])),
    [config.fields]
  );

  useEffect(() => {
    let active = true;

    if (!hasDownloadableFile) return;

    getStorageSignedUrl(filePath)
      .then((signedUrl) => {
        if (active) setFilePreview({ path: filePath, url: signedUrl });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFileError({
          path: filePath,
          message: error instanceof Error ? error.message : "Unable to prepare file preview."
        });
      });

    return () => {
      active = false;
    };
  }, [filePath, hasDownloadableFile]);

  async function saveRecord(values: Record<string, unknown>) {
    const response = await fetch(`/api/records/${config.table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: record.id,
        values
      })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to update record.");
      return;
    }

    toast.success(`${config.singular} updated.`);
    setOpen(false);
    router.refresh();
  }

  async function downloadRecordFile() {
    if (!storageFieldKey) return;

    try {
      await openStorageFile(filePath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open file.");
    }
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden border border-[#8bd7ee] bg-[#f8fcff] shadow-sm">
        <div className="flex flex-col gap-2 bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-3 py-2 text-white shadow-[inset_0_-2px_0_#ffcd12] md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#fff4b8]">Fiche COSUMAR QMS</div>
            <h1 className="text-base font-semibold">
              {String(record.title ?? record.name ?? record.document_code ?? config.singular)}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${config.slug}`}>
              <Button className="border-white/40 bg-white text-[#2749a0] hover:bg-[#fff4b8]">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            {hasDownloadableFile ? (
              <Button className="border-white/40 bg-white text-[#2749a0] hover:bg-[#fff4b8]" onClick={() => void downloadRecordFile()}>
                <FileText className="h-4 w-4" />
                Ouvrir fichier
              </Button>
            ) : null}
            {canWrite ? (
              <Button className="border-white/40 bg-white text-[#2749a0] hover:bg-[#fff4b8]" onClick={() => setOpen(true)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            ) : null}
          </div>
        </div>
        <div className="px-3 py-2 text-xs text-ink">{config.description}</div>
      </section>

      <section className="space-y-4 border border-[#b9def4] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <StatusBadge value={String(record.status ?? record.risk_level ?? "Active")} />
          <span className="text-sm text-slate-500">
            Derniere mise a jour {formatDate(String(record.updated_at ?? ""))}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.detailFields.map((field) => (
            <div key={field} className="border border-[#d5edf8] bg-[#f8fcff] p-3">
              <div className="text-[10px] font-semibold uppercase text-[#2749a0]">
                {fieldLabels[field] ?? field.replace(/_/g, " ")}
              </div>
              <div className="mt-2 text-sm leading-6 text-ink">
                {renderDetailValue(field, record[field], lookups)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasDownloadableFile ? (
        <section className="overflow-hidden border border-[#b9def4] bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-[#d5edf8] bg-[#f8fcff] px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase text-[#2749a0]">
                Apercu document
              </div>
              <div className="text-sm font-semibold text-ink">{filePath}</div>
            </div>
            <Button variant="secondary" onClick={() => void downloadRecordFile()}>
              <FileText className="h-4 w-4" />
              Ouvrir dans un onglet
            </Button>
          </div>
          <div className="bg-[#eef9fd] p-3">
            {currentFileError ? (
              <div className="border border-[#f1c4c4] bg-[#fff7f7] px-3 py-4 text-sm text-danger">
                {currentFileError}
              </div>
            ) : currentFileUrl && showInlinePreview ? (
              <iframe
                title={`Apercu ${String(record.title ?? record.document_code ?? config.singular)}`}
                src={currentFileUrl}
                className="h-[70vh] min-h-[420px] w-full border border-[#b9def4] bg-white"
              />
            ) : currentFileUrl ? (
              <div className="border border-[#d5edf8] bg-white px-3 py-5 text-sm text-slate-600">
                Ce format ne peut pas etre affiche directement ici. Utilise le bouton
                {" "}
                <span className="font-semibold text-[#2749a0]">Ouvrir dans un onglet</span>
                {" "}
                pour le consulter.
              </div>
            ) : (
              <div className="border border-[#d5edf8] bg-white px-3 py-5 text-sm text-slate-500">
                Preparation de l&apos;apercu...
              </div>
            )}
          </div>
        </section>
      ) : null}

      {(config.childModules ?? []).map((child) => (
        <ChildRecordsSection
          key={child.key}
          config={child}
          records={childrenData[child.key] ?? []}
          lookups={lookups}
          role={context.role}
          parentId={String(record.id)}
        />
      ))}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Modifier ${config.singular}`}
        description={config.description}
      >
        <RecordForm
          key={String(record.id)}
          fields={config.fields}
          lookups={lookups}
          initialValues={record}
          onSubmit={saveRecord}
          onCancel={() => setOpen(false)}
          submitLabel="Enregistrer"
        />
      </Modal>
    </div>
  );
}
