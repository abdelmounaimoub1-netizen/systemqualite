"use client";

import { useState } from "react";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ChildRecordsSection } from "@/components/modules/child-records-section";
import { RecordForm } from "@/components/modules/record-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getLookupLabel } from "@/lib/modules/config";
import { canWriteModule } from "@/lib/permissions";
import { getStorageFieldKey, openStorageFile } from "@/lib/storage";
import type { LookupCollection, ModuleConfig, UserContext } from "@/types/app";

type RecordDetailClientProps = {
  context: UserContext;
  config: ModuleConfig;
  record: Record<string, unknown>;
  lookups: LookupCollection;
  childrenData: Record<string, Array<Record<string, unknown>>>;
};

const relationKeyToTable: Record<string, string> = {
  owner_id: "profiles",
  responsible_user_id: "profiles",
  auditor_id: "profiles",
  employee_id: "profiles",
  user_id: "profiles",
  role_id: "roles",
  department_id: "departments",
  category_id: "document_categories",
  non_conformity_id: "non_conformities"
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

export function RecordDetailClient({
  context,
  config,
  record,
  lookups,
  childrenData
}: RecordDetailClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const canWrite = canWriteModule(context.role, config.slug);
  const storageFieldKey = getStorageFieldKey(config.fields);
  const hasDownloadableFile = Boolean(
    storageFieldKey && String(record[storageFieldKey] ?? "").length > 0
  );

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
      await openStorageFile(String(record[storageFieldKey] ?? ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download file.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Record detail"
        title={String(record.title ?? record.name ?? record.document_code ?? config.singular)}
        description={config.description}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/${config.slug}`}>
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            {hasDownloadableFile ? (
              <Button variant="secondary" onClick={() => void downloadRecordFile()}>
                <Download className="h-4 w-4" />
                Download file
              </Button>
            ) : null}
            {canWrite ? (
              <Button variant="secondary" onClick={() => setOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="space-y-5">
        <div className="flex items-center gap-3">
          <StatusBadge value={String(record.status ?? record.risk_level ?? "Active")} />
          <span className="text-sm text-slate-500">
            Last updated {formatDate(String(record.updated_at ?? ""))}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.detailFields.map((field) => (
            <div key={field} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {field.replace(/_/g, " ")}
              </div>
              <div className="mt-2 text-sm leading-6 text-ink">
                {renderDetailValue(field, record[field], lookups)}
              </div>
            </div>
          ))}
        </div>
      </Card>

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
        title={`Edit ${config.singular}`}
        description={config.description}
      >
        <RecordForm
          key={String(record.id)}
          fields={config.fields}
          lookups={lookups}
          initialValues={record}
          onSubmit={saveRecord}
          onCancel={() => setOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>
    </div>
  );
}
