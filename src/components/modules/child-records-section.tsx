"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus, UploadCloud, XCircle } from "lucide-react";
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
  userId?: string;
  variant?: "default" | "qualios";
};

export function ChildRecordsSection({
  config,
  records,
  lookups,
  role,
  parentId,
  userId,
  variant = "default"
}: ChildRecordsSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [uploading, setUploading] = useState(false);

  const canWrite = config.writeRoles.includes(role);
  const isAttachmentModule = config.table === "attachments";
  const isDocumentApprovalModule = config.table === "document_approvals";

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
      toast.error(payload.error ?? "Impossible d'enregistrer la fiche.");
      return;
    }

    toast.success(`${config.label} mis a jour.`);
    setEditing(null);
    setOpen(false);
    router.refresh();
  }

  async function deleteRecord(record: Record<string, unknown>) {
    if (!window.confirm(`Supprimer cet element ${config.label.toLowerCase()} ?`)) return;

    const response = await fetch(`/api/records/${config.table}/${record.id}`, {
      method: "DELETE"
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Impossible de supprimer la fiche.");
      return;
    }

    toast.success(`Element ${config.label} supprime.`);
    router.refresh();
  }

  function canSignApproval(record: Record<string, unknown>) {
    return (
      isDocumentApprovalModule &&
      record.decision === "Pending" &&
      (canWrite || String(record.approver_id ?? "") === userId)
    );
  }

  async function signApproval(record: Record<string, unknown>, decision: "Approved" | "Rejected") {
    const response = await fetch(`/api/records/${config.table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: record.id,
        values: {
          decision,
          signed_at: new Date().toISOString()
        }
      })
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Signature impossible.");
      return;
    }

    toast.success(decision === "Approved" ? "Signature validee." : "Signature rejetee.");
    router.refresh();
  }

  function renderApprovalActions(record: Record<string, unknown>) {
    if (!canSignApproval(record)) return null;

    return (
      <>
        <Button
          variant="ghost"
          title="Valider la signature"
          aria-label="Valider la signature"
          className={variant === "qualios" ? "h-6 min-h-0 w-6 px-0 py-0 text-success" : "h-8 min-h-0 w-8 px-0 py-0 text-success"}
          onClick={() => void signApproval(record, "Approved")}
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          title="Rejeter la signature"
          aria-label="Rejeter la signature"
          className={variant === "qualios" ? "h-6 min-h-0 w-6 px-0 py-0 text-danger" : "h-8 min-h-0 w-8 px-0 py-0 text-danger"}
          onClick={() => void signApproval(record, "Rejected")}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </>
    );
  }

  async function uploadAttachment(file: File) {
    const tableName = String(config.fixedValues?.table_name ?? "");

    if (!tableName) {
      toast.error("Configuration de piece jointe manquante.");
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
        throw new Error(payload.error ?? "Impossible d'enregistrer la piece jointe.");
      }

      toast.success("Piece jointe importee.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import du fichier impossible.");
    } finally {
      setUploading(false);
    }
  }

  async function downloadAttachment(record: Record<string, unknown>) {
    try {
      await openStorageFile(String(record.file_path ?? ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'ouvrir le fichier.");
    }
  }

  if (variant === "qualios") {
    return (
      <section className="border border-[#c7d1d7] bg-white">
        <div className="flex flex-col gap-2 border-b border-[#d7e0e5] bg-[#eef3f6] px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[10px] font-bold text-[#2f3a43]">{config.label}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {isAttachmentModule && canWrite ? (
              <label
                title="Joindre un fichier"
                className="inline-flex min-h-6 cursor-pointer items-center gap-1 border border-[#9eb8c2] bg-white px-2 py-1 text-[10px] font-bold text-[#2749a0] hover:bg-[#fff4b8]"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {uploading ? "Import..." : "Fichier"}
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
                className="min-h-6 px-2 py-1 text-[10px]"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            ) : null}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="px-2 py-2 text-[11px] text-muted">Aucun element</div>
        ) : (
          <RecordTable
            columns={config.columns}
            records={records}
            lookups={lookups}
            compact
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
            extraActions={isDocumentApprovalModule ? renderApprovalActions : undefined}
          />
        )}

        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          title={editing ? `Modifier ${config.label}` : `Ajouter ${config.label}`}
          description="Lie a la fiche courante."
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
            submitLabel={editing ? "Enregistrer" : "Creer l'element"}
          />
        </Modal>
      </section>
    );
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
              {uploading ? "Import..." : "Fichier joint"}
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
          title={`Aucun element dans ${config.label.toLowerCase()}`}
          description={config.description}
          ctaLabel={canWrite ? "Ajouter le premier element" : undefined}
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
          extraActions={isDocumentApprovalModule ? renderApprovalActions : undefined}
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? `Modifier ${config.label}` : `Ajouter ${config.label}`}
        description="Lie a la fiche courante."
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
          submitLabel={editing ? "Enregistrer" : "Creer l'element"}
        />
      </Modal>
    </Card>
  );
}
