"use client";

import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileToStorage } from "@/lib/storage";
import type { FormFieldConfig, LookupCollection } from "@/types/app";

type RecordFormProps = {
  fields: ReadonlyArray<FormFieldConfig>;
  lookups: LookupCollection;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
};

function fieldValue(values: Record<string, unknown>, key: string, fallback = "") {
  const value = values[key];
  return value === null || value === undefined ? fallback : value;
}

export function RecordForm({
  fields,
  lookups,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel
}: RecordFormProps) {
  const initialDefaults = useMemo(
    () =>
      Object.fromEntries(
        fields
          .filter((field) => field.defaultValue !== undefined)
          .map((field) => [field.key, field.defaultValue])
      ),
    [fields]
  );
  const fieldGroups = useMemo(() => {
    const groups: Array<{ section: string | null; fields: ReadonlyArray<FormFieldConfig> }> = [];

    fields.forEach((field) => {
      const section = field.section ?? null;
      const current = groups[groups.length - 1];

      if (current?.section === section) {
        groups[groups.length - 1] = {
          ...current,
          fields: [...current.fields, field]
        };
        return;
      }

      groups.push({ section, fields: [field] });
    });

    return groups;
  }, [fields]);
  const hasSections = fieldGroups.some((group) => group.section);
  const [values, setValues] = useState<Record<string, unknown>>({
    ...initialDefaults,
    ...(initialValues ?? {})
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileUpload(field: FormFieldConfig, file: File) {
    if (!field.storageFolder) return;

    setUploadingField(field.key);

    try {
      const filePath = await uploadFileToStorage({
        file,
        folder: field.storageFolder
      });

      setValues((current) => ({ ...current, [field.key]: filePath }));
      toast.success(`${field.label} importe.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import du fichier impossible.");
    } finally {
      setUploadingField(null);
    }
  }

  function renderField(field: FormFieldConfig) {
          const containerClass =
            field.type === "textarea" || field.storageFolder ? "md:col-span-2" : "";
          const label = (
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor={field.key}>
              {field.label}
            </label>
          );

          if (field.type === "textarea") {
            return (
              <div key={field.key} className={containerClass}>
                {label}
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  value={String(fieldValue(values, field.key, ""))}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  readOnly={field.readOnly}
                  required={field.required}
                />
                {field.helperText ? (
                  <p className="mt-2 text-xs text-slate-400">{field.helperText}</p>
                ) : null}
              </div>
            );
          }

          if (field.type === "select") {
            const relationOptions = field.relation
              ? (lookups[field.relation.table] ?? []).map((option) => ({
                  label: option.label,
                  value: option.id
                }))
              : field.options ?? [];

            return (
              <div key={field.key}>
                {label}
                <Select
                  id={field.key}
                  value={String(fieldValue(values, field.key, ""))}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.key]: event.target.value || null }))
                  }
                  disabled={field.readOnly}
                  required={field.required}
                >
                  <option value="">Selectionner...</option>
                  {relationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <div
                key={field.key}
                className="rounded border border-[#b9def4] bg-[#f8fcff] px-3 py-2"
              >
                <label className="flex items-center gap-3 text-sm font-medium text-ink">
                  <input
                    id={field.key}
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#b9def4] text-brand focus:ring-[#00a9da]"
                    checked={Boolean(values[field.key] ?? false)}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.checked }))
                    }
                    disabled={field.readOnly}
                  />
                  {field.label}
                </label>
                {field.helperText ? (
                  <p className="mt-2 text-xs text-slate-400">{field.helperText}</p>
                ) : null}
              </div>
            );
          }

          if (field.storageFolder) {
            const isUploading = uploadingField === field.key;

            return (
              <div key={field.key} className={containerClass}>
                {label}
                <div className="space-y-3">
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={String(fieldValue(values, field.key, ""))}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    readOnly={field.readOnly}
                    required={field.required}
                  />
                  <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded border border-[#b9def4] bg-[#f8fcff] px-3 py-2 text-sm font-semibold text-[#2749a0] hover:bg-[#fff4b8]">
                    <UploadCloud className="h-4 w-4" />
                    {isUploading ? "Import..." : "Fichier joint"}
                    <input
                      type="file"
                      className="hidden"
                      accept={field.accept}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleFileUpload(field, file);
                          event.target.value = "";
                        }
                      }}
                      disabled={isUploading || field.readOnly}
                    />
                  </label>
                </div>
                {field.helperText ? (
                  <p className="mt-2 text-xs text-slate-400">{field.helperText}</p>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field.key}>
              {label}
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                value={String(fieldValue(values, field.key, ""))}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
                readOnly={field.readOnly}
                required={field.required}
              />
              {field.helperText ? <p className="mt-2 text-xs text-slate-400">{field.helperText}</p> : null}
            </div>
          );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {hasSections ? (
        <div className="space-y-4">
          {fieldGroups.map((group, index) => (
            <section
              key={`${group.section ?? "general"}-${index}`}
              className="border border-[#d5edf8] bg-[#f8fcff] p-3"
            >
              {group.section ? (
                <div className="mb-3 flex items-center gap-2 border-b border-[#d5edf8] pb-2">
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2749a0] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[#2749a0]">{group.section}</h3>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">{group.fields.map(renderField)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(renderField)}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
