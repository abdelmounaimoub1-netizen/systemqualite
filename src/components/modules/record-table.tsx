"use client";

import { Download, Pencil, Trash2 } from "lucide-react";

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
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (record: Record<string, unknown>) => void;
  onDownload?: (record: Record<string, unknown>) => void;
};

function renderCell(
  column: ListColumnConfig,
  record: Record<string, unknown>,
  lookups: LookupCollection
) {
  const value = record[column.key];

  if (column.variant === "status") {
    return <StatusBadge value={value as string | null | undefined} />;
  }

  if (column.variant === "date") {
    return <span className="text-sm text-slate-600">{formatDate(String(value ?? ""))}</span>;
  }

  if (column.variant === "boolean") {
    return <span className="text-sm font-medium text-slate-600">{value ? "Yes" : "No"}</span>;
  }

  if (column.variant === "relation") {
    const tablesByKey: Record<string, string> = {
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

    return (
      <span className="text-sm text-slate-600">
        {getLookupLabel(lookups, tablesByKey[column.key] ?? "", String(value ?? ""))}
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-700">
      {value === null || value === undefined || value === "" ? "Not set" : String(value)}
    </span>
  );
}

export function RecordTable({
  columns,
  records,
  lookups,
  detailBasePath,
  onEdit,
  onDelete,
  onDownload
}: RecordTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={String(record.id)} className="hover:bg-slate-50/80">
                {columns.map((column, index) => (
                  <td key={column.key} className="px-4 py-3 align-top">
                    {detailBasePath && index === 0 ? (
                      <a
                        href={`${detailBasePath}/${record.id}`}
                        className="font-medium text-brand hover:text-sky-700"
                      >
                        {renderCell(column, record, lookups)}
                      </a>
                    ) : (
                      renderCell(column, record, lookups)
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {onDownload ? (
                      <Button variant="ghost" className="px-3" onClick={() => onDownload(record)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button variant="ghost" className="px-3" onClick={() => onEdit(record)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        variant="ghost"
                        className="px-3 text-danger hover:bg-rose-50 hover:text-danger"
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
