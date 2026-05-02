"use client";

import { useMemo, useState } from "react";
import { Funnel, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { RecordForm } from "@/components/modules/record-form";
import { RecordTable } from "@/components/modules/record-table";
import { canWriteModule } from "@/lib/permissions";
import { getStorageFieldKey, openStorageFile } from "@/lib/storage";
import type {
  LookupCollection,
  SerializableModuleConfig,
  UserContext
} from "@/types/app";

type ModulePageClientProps = {
  context: UserContext;
  config: SerializableModuleConfig;
  records: Array<Record<string, unknown>>;
  lookups: LookupCollection;
};

function statusFromView(
  searchParams: ReturnType<typeof useSearchParams>,
  statusField: SerializableModuleConfig["fields"][number] | undefined
) {
  const options = statusField?.options ?? [];
  const explicitStatus = searchParams.get("status");

  if (explicitStatus && options.some((option) => option.value === explicitStatus)) {
    return explicitStatus;
  }

  const view = searchParams.get("view");
  const preferred =
    view === "history"
      ? ["Closed", "Archived", "Completed", "Read"]
      : view === "follow"
        ? ["Open", "In Progress", "Under Review", "Awaiting Approval", "Planned", "Draft", "Unread"]
        : [];

  return preferred.find((value) => options.some((option) => option.value === value)) ?? "";
}

function getSearchSeedValues(config: SerializableModuleConfig, query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return {};

  const preferredKeys = ["title", "name", "reference", "document_code", "code", "record_code"];
  const seedField =
    config.fields.find(
      (field) =>
        preferredKeys.includes(field.key) &&
        config.searchableFields.includes(field.key) &&
        !field.readOnly &&
        (field.type === "text" || field.type === "textarea")
    ) ??
    config.fields.find(
      (field) =>
        config.searchableFields.includes(field.key) &&
        !field.readOnly &&
        (field.type === "text" || field.type === "textarea")
    );

  return seedField ? { [seedField.key]: trimmedQuery } : {};
}

export function ModulePageClient({
  context,
  config,
  records,
  lookups
}: ModulePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const canWrite = canWriteModule(context.role, config.slug);
  const statusField = config.fields.find((field) => field.key === "status");
  const query = searchParams.get("q") ?? "";
  const status = statusFromView(searchParams, statusField);
  const storageFieldKey = useMemo(() => getStorageFieldKey(config.fields), [config.fields]);
  const searchSeedValues = useMemo(() => getSearchSeedValues(config, query), [config, query]);
  const openFromQuery = searchParams.get("new") === "1" && canWrite;
  const modalOpen = open || openFromQuery;

  function clearNewParam() {
    if (!openFromQuery) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("new");
    const nextQuery = nextParams.toString();
    router.replace(`/${config.slug}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });
  }

  function closeEditor() {
    setOpen(false);
    setEditing(null);
    clearNewParam();
  }

  function updateSearchParam(key: "q" | "status", value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    if (key === "status") {
      nextParams.delete("view");
    }

    const nextQuery = nextParams.toString();
    router.replace(`/${config.slug}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });
  }

  const normalizedQuery = query.toLowerCase();
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      query.length === 0 ||
      config.searchableFields.some((field) =>
        String(record[field] ?? "")
          .toLowerCase()
          .includes(normalizedQuery)
      );

    const matchesStatus =
      status.length === 0 || String(record.status ?? record.risk_level ?? "") === status;

    return matchesSearch && matchesStatus;
  });

  const openCount = records.filter((record) =>
    ["Open", "In Progress", "Draft", "Under Review", "Awaiting Approval", "Planned", "Unread"].includes(
      String(record.status ?? "")
    )
  ).length;
  const summary = {
    total: records.length,
    active: openCount,
    closed: records.length - openCount
  };

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
      toast.error(payload.error ?? "Impossible d'enregistrer la fiche.");
      return;
    }

    toast.success(`${config.singular} enregistre.`);
    closeEditor();
    router.refresh();
  }

  async function deleteRecord(record: Record<string, unknown>) {
    if (!window.confirm(`Supprimer ce ${config.singular.toLowerCase()} ?`)) return;

    const response = await fetch(`/api/records/${config.table}/${record.id}`, {
      method: "DELETE"
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(payload.error ?? "Impossible de supprimer la fiche.");
      return;
    }

    toast.success(`${config.singular} supprime.`);
    router.refresh();
  }

  async function downloadRecord(record: Record<string, unknown>) {
    if (!storageFieldKey) return;

    try {
      await openStorageFile(String(record[storageFieldKey] ?? ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'ouvrir le fichier.");
    }
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden border border-[#8bd7ee] bg-[#f8fcff] shadow-sm">
        <div className="flex flex-col gap-2 bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-3 py-2 text-white shadow-[inset_0_-2px_0_#ffcd12] md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#fff4b8]">Module COSUMAR QMS</div>
            <h1 className="text-base font-semibold">{config.label}</h1>
          </div>
          {canWrite ? (
            <Button
              className="border-white/40 bg-white text-[#2749a0] hover:bg-[#fff4b8]"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau {config.singular}
            </Button>
          ) : null}
        </div>
        <div className="px-3 py-2 text-xs text-ink">{config.description}</div>
      </section>

      <div className="grid gap-2 md:grid-cols-3">
        {[
          ["Total", summary.total],
          ["En cours", summary.active],
          ["Termines ou clos", summary.closed]
        ].map(([label, value]) => (
          <div key={label} className="border border-[#8bd7ee] bg-[#d7f8ff] px-3 py-2 shadow-sm">
            <div className="text-[10px] font-semibold uppercase text-[#2749a0]">{label}</div>
            <div className="mt-1 text-xl font-bold text-ink">{value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3 border border-[#b9def4] bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder={`Rechercher ${config.label.toLowerCase()}...`}
              value={query}
              onChange={(event) => updateSearchParam("q", event.target.value)}
            />
          </div>

          {statusField ? (
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4 text-slate-400" />
              <Select
                value={status}
                onChange={(event) => updateSearchParam("status", event.target.value)}
              >
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
            onOpen={(record) => router.push(`/${config.slug}/${record.id}`)}
            onDownload={storageFieldKey ? downloadRecord : undefined}
            canDownload={
              storageFieldKey
                ? (record) => String(record[storageFieldKey] ?? "").trim().length > 0
                : undefined
            }
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
      </section>

      <Modal
        open={modalOpen}
        onClose={closeEditor}
        title={editing ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
        description={config.description}
      >
        <RecordForm
          key={editing ? String(editing.id ?? "edit") : "new"}
          fields={config.fields}
          lookups={lookups}
          initialValues={editing ?? searchSeedValues}
          onSubmit={saveRecord}
          onCancel={closeEditor}
          submitLabel={editing ? "Enregistrer" : `Creer ${config.singular}`}
        />
      </Modal>
    </div>
  );
}
