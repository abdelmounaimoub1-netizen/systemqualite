"use client";

import { useMemo, useState } from "react";
import { Plus, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { openStorageFile, uploadFileToStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { RecordForm } from "@/components/modules/record-form";
import { RecordTable } from "@/components/modules/record-table";
import type { ChildModuleConfig, LookupCollection } from "@/types/app";
import type { RoleSlug } from "@/types/database";

type ChildRecordsSectionProps = {
  config: ChildModuleConfig;
  records: Array<Record<string, unknown>>;
  lookups: LookupCollection;
  role: RoleSlug;
  parentId: string;
};

export function ChildRecordsSection({
  config,
  records,
  lookups,
  role,
  parentId
}: ChildRecordsSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [uploading, setUploading] = useState(false);

  const canWrite = config.writeRoles.includes(role);
  const isAttachmentModule = config.table === "attachments";

  const defaults = useMemo(
    () => ({
      [config.parentField]: parentId,
      ...(config.fixedValues ?? {})
    }),
    [config.fixedValues, config.parentField, parentId]
  );

  async function saveRecord(values: Record<string, unknown>) {
    const response = await fetch(`/api/records/${config.table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: editing?.id,
        values: {
          ...defaults,
          ...values
        }
      })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "Unable to save record.");
      return;
    }

    toast.success(`${config.label} updated.`);
    setEditing(null);
    setOpen(false);
    router.refresh();
  }

  async function deleteRecord(record: Record<string, unknown>) {
    if (!window.confirm(`Delete this ${config.label.toLowerCase()} item?`)) return;

    const response = await fetch(`/api/records/${config.table}/${record.id}`, {
      method: "DELETE"
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to delete record.");
      return;
    }

    toast.success(`${config.label} item deleted.`);
    router.refresh();
  }

  async function uploadAttachment(file: File) {
    const tableName = String(config.fixedValues?.table_name ?? "");

    if (!tableName) {
      toast.error("Missing attachment table mapping.");
      return;
    }

    setUploading(true);

    try {
      const filePath = await uploadFileToStorage({
        file,
        folder: `${tableName}/${parentId}`
      });

      const response = await fetch(`/api/records/${config.table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: {
            ...defaults,
            file_name: file.name,
            file_path: filePath,
            mime_type: file.type,
            file_size: file.size,
            note: ""
          }
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save attachment.");
      }

      toast.success("Attachment uploaded.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function downloadAttachment(record: Record<string, unknown>) {
    try {
      await openStorageFile(String(record.file_path ?? ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download file.");
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">{config.label}</h3>
          <p className="mt-1 text-sm text-muted">{config.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAttachmentModule && canWrite ? (
            <label
              title="Joindre un fichier"
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded border border-[#b9def4] bg-[#f8fcff] px-3 py-2 text-sm font-semibold text-[#2749a0] hover:bg-[#fff4b8]"
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Upload..." : "Fichier joint"}
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadAttachment(file);
                    event.target.value = "";
                  }
                }}
                disabled={uploading}
              />
            </label>
          ) : null}
          {canWrite ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          ) : null}
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title={`No ${config.label.toLowerCase()} yet`}
          description={config.description}
          ctaLabel={canWrite ? "Add first item" : undefined}
          onCta={canWrite ? () => setOpen(true) : undefined}
        />
      ) : (
        <RecordTable
          columns={config.columns}
          records={records}
          lookups={lookups}
          onEdit={
            canWrite
              ? (record) => {
                  setEditing(record);
                  setOpen(true);
                }
              : undefined
          }
          onDelete={canWrite ? deleteRecord : undefined}
          onDownload={isAttachmentModule ? downloadAttachment : undefined}
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? `Edit ${config.label}` : `Add ${config.label}`}
        description="Linked to the current parent record."
      >
        <RecordForm
          key={editing ? String(editing.id ?? "edit") : `new-${parentId}`}
          fields={config.fields}
          lookups={lookups}
          initialValues={{ ...defaults, ...(editing ?? {}) }}
          onSubmit={saveRecord}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
          submitLabel={editing ? "Save changes" : "Create item"}
        />
      </Modal>
    </Card>
  );
}
