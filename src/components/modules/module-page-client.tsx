"use client";

import { useMemo, useState } from "react";
import { Funnel, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { RecordForm } from "@/components/modules/record-form";
import { RecordTable } from "@/components/modules/record-table";
import { canWriteModule } from "@/lib/permissions";
import { getStorageFieldKey, openStorageFile } from "@/lib/storage";
import type { LookupCollection, ModuleConfig, UserContext } from "@/types/app";

type ModulePageClientProps = {
  context: UserContext;
  config: ModuleConfig;
  records: Array<Record<string, unknown>>;
  lookups: LookupCollection;
};

export function ModulePageClient({
  context,
  config,
  records,
  lookups
}: ModulePageClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const canWrite = canWriteModule(context.role, config.slug);
  const statusField = config.fields.find((field) => field.key === "status");
  const storageFieldKey = useMemo(() => getStorageFieldKey(config.fields), [config.fields]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          query.length === 0 ||
          config.searchableFields.some((field) =>
            String(record[field] ?? "")
              .toLowerCase()
              .includes(query.toLowerCase())
          );

        const matchesStatus =
          status.length === 0 || String(record.status ?? record.risk_level ?? "") === status;

        return matchesSearch && matchesStatus;
      }),
    [config.searchableFields, query, records, status]
  );

  const summary = useMemo(() => {
    const openCount = records.filter((record) =>
      ["Open", "In Progress", "Draft", "Planned"].includes(String(record.status ?? ""))
    ).length;

    return {
      total: records.length,
      active: openCount,
      closed: records.length - openCount
    };
  }, [records]);

  async function saveRecord(values: Record<string, unknown>) {
    const response = await fetch(`/api/records/${config.table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: editing?.id,
        values
      })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to save record.");
      return;
    }

    toast.success(`${config.singular} saved.`);
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function deleteRecord(record: Record<string, unknown>) {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;

    const response = await fetch(`/api/records/${config.table}/${record.id}`, {
      method: "DELETE"
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to delete record.");
      return;
    }

    toast.success(`${config.singular} deleted.`);
    router.refresh();
  }

  async function downloadRecord(record: Record<string, unknown>) {
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
        eyebrow="Module QMS"
        title={config.label}
        description={config.description}
        actions={
          canWrite ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau {config.singular}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-sm text-slate-500">Total</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{summary.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">En cours</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{summary.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Termines ou clos</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{summary.closed}</div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-11"
              placeholder={`Rechercher ${config.label.toLowerCase()}...`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {statusField ? (
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4 text-slate-400" />
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Tous les statuts</option>
                {statusField.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            title={`Aucun resultat dans ${config.label.toLowerCase()}`}
            description={config.emptyState}
            ctaLabel={canWrite ? `Creer ${config.singular}` : undefined}
            onCta={canWrite ? () => setOpen(true) : undefined}
          />
        ) : (
          <RecordTable
            columns={config.columns}
            records={filteredRecords}
            lookups={lookups}
            detailBasePath={`/${config.slug}`}
            onDownload={storageFieldKey ? downloadRecord : undefined}
            onEdit={
              canWrite
                ? (record) => {
                    setEditing(record);
                    setOpen(true);
                  }
                : undefined
            }
            onDelete={canWrite ? deleteRecord : undefined}
          />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
        description={config.description}
      >
        <RecordForm
          key={editing ? String(editing.id ?? "edit") : "new"}
          fields={config.fields}
          lookups={lookups}
          initialValues={editing ?? {}}
          onSubmit={saveRecord}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
          submitLabel={editing ? "Enregistrer" : `Creer ${config.singular}`}
        />
      </Modal>
    </div>
  );
}
