"use client";

import { Eye, FileText, Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getLookupLabel } from "@/lib/modules/config";
import type { ListColumnConfig, LookupCollection } from "@/types/app";

type RecordTableProps = {
  columns: ReadonlyArray<ListColumnConfig>;
  records: Array<Record<string, unknown>>;
  lookups: LookupCollection;
  detailBasePath?: string;
  onOpen?: (record: Record<string, unknown>) => void;
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (record: Record<string, unknown>) => void;
  onDownload?: (record: Record<string, unknown>) => void;
  canDownload?: (record: Record<string, unknown>) => boolean;
  compact?: boolean;
};

function renderCell(
  column: ListColumnConfig,
  record: Record<string, unknown>,
  lookups: LookupCollection,
  compact = false
) {
  const value = record[column.key];
  const textClass = compact ? "text-[11px] text-[#1f2c3a]" : "text-sm text-slate-600";

  if (column.variant === "status") {
    return <StatusBadge value={value as string | null | undefined} />;
  }

  if (column.variant === "date") {
    return <span className={textClass}>{formatDate(String(value ?? ""))}</span>;
  }

  if (column.variant === "boolean") {
    return <span className={textClass}>{value ? "Oui" : "Non"}</span>;
  }

  if (column.variant === "relation") {
    const tablesByKey: Record<string, string> = {
      owner_id: "profiles",
      responsible_user_id: "profiles",
      pilot_id: "profiles",
      approver_id: "profiles",
      recipient_id: "profiles",
      reviewer_id: "profiles",
      suggested_by: "profiles",
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

    return (
      <span className={textClass}>
        {getLookupLabel(lookups, tablesByKey[column.key] ?? "", String(value ?? ""))}
      </span>
    );
  }

  return (
    <span className={compact ? "text-[11px] text-[#1f2c3a]" : "text-sm text-slate-700"}>
      {value === null || value === undefined || value === "" ? "Non renseigne" : String(value)}
    </span>
  );
}

export function RecordTable({
  columns,
  records,
  lookups,
  detailBasePath,
  onOpen,
  onEdit,
  onDelete,
  onDownload,
  canDownload,
  compact = false
}: RecordTableProps) {
  return (
    <div className={compact ? "overflow-hidden border border-[#c7d1d7] bg-white" : "overflow-hidden rounded border border-[#b9def4] bg-white"}>
      <div className="overflow-x-auto">
        <table className={compact ? "min-w-full divide-y divide-[#d7e0e5]" : "min-w-full divide-y divide-[#d5edf8]"}>
          <thead className={compact ? "bg-[#2749a0]" : "bg-[linear-gradient(90deg,#2749a0,#00a9da)]"}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={compact ? "px-2 py-1 text-left text-[10px] font-bold text-white" : "px-4 py-2 text-left text-xs font-semibold text-white"}
                >
                  {column.label}
                </th>
              ))}
              <th className={compact ? "px-2 py-1 text-right text-[10px] font-bold text-white" : "px-4 py-2 text-right text-xs font-semibold text-white"}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={compact ? "divide-y divide-[#edf2f4]" : "divide-y divide-[#eef7fc]"}>
            {records.map((record) => (
              <tr key={String(record.id)} className="hover:bg-[#fff9d8]/70">
                {columns.map((column, index) => (
                  <td key={column.key} className={compact ? "px-2 py-1 align-top" : "px-4 py-3 align-top"}>
                    {detailBasePath && index === 0 ? (
                      <a
                        href={`${detailBasePath}/${record.id}`}
                        className="font-medium text-brand hover:text-[#00a9da]"
                      >
                        {renderCell(column, record, lookups, compact)}
                      </a>
                    ) : (
                      renderCell(column, record, lookups, compact)
                    )}
                  </td>
                ))}
                <td className={compact ? "px-2 py-1" : "px-4 py-3"}>
                  <div className="flex justify-end gap-2">
                    {onOpen ? (
                      <Button
                        variant="ghost"
                        title="Ouvrir"
                        aria-label="Ouvrir"
                        className={compact ? "h-6 min-h-0 w-6 px-0 py-0" : "h-8 min-h-0 w-8 px-0 py-0"}
                        onClick={() => onOpen(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDownload && (canDownload?.(record) ?? true) ? (
                      <Button
                        variant="ghost"
                        title="Ouvrir fichier"
                        aria-label="Ouvrir fichier"
                        className={compact ? "h-6 min-h-0 w-6 px-0 py-0" : "h-8 min-h-0 w-8 px-0 py-0"}
                        onClick={() => onDownload(record)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button
                        variant="ghost"
                        title="Modifier"
                        aria-label="Modifier"
                        className={compact ? "h-6 min-h-0 w-6 px-0 py-0" : "h-8 min-h-0 w-8 px-0 py-0"}
                        onClick={() => onEdit(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        variant="ghost"
                        title="Supprimer"
                        aria-label="Supprimer"
                        className={compact ? "h-6 min-h-0 w-6 px-0 py-0 text-danger hover:bg-danger/10 hover:text-danger" : "h-8 min-h-0 w-8 px-0 py-0 text-danger hover:bg-danger/10 hover:text-danger"}
                        onClick={() => onDelete(record)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
