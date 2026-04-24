import { calculateRisk, compactObject, isTruthy } from "@/lib/utils";
import { moduleConfigs, settingsTableConfigs } from "@/lib/modules/config";
import type { FormFieldConfig } from "@/types/app";
import type { RoleSlug, TableName } from "@/types/database";

type TableRegistryEntry = {
  fields: FormFieldConfig[];
  writeRoles: RoleSlug[];
};

const moduleEntries = Object.values(moduleConfigs).map((module) => [
  module.table,
  {
    fields: module.fields,
    writeRoles: module.writeRoles
  }
]);

const childEntries = Object.values(moduleConfigs).flatMap((module) =>
  (module.childModules ?? []).map((child) => [
    child.table,
    {
      fields: child.fields,
      writeRoles: child.writeRoles
    }
  ])
);

const settingsEntries = Object.values(settingsTableConfigs).map((config) => [
  config.table,
  {
    fields: config.fields,
    writeRoles: ["admin", "quality_manager"] as RoleSlug[]
  }
]);

export const tableRegistry = new Map<TableName, TableRegistryEntry>([
  ...moduleEntries,
  ...childEntries,
  ...settingsEntries
] as Array<[TableName, TableRegistryEntry]>);

export function getTableFields(table: TableName) {
  return tableRegistry.get(table)?.fields ?? [];
}

export function getTableWriteRoles(table: TableName, values?: Record<string, unknown>) {
  if (table === "comments" || table === "attachments") {
    const tableName = String(values?.table_name ?? "");
    const matchingModule = Object.values(moduleConfigs).find(
      (module) => module.table === tableName
    );

    if (matchingModule) {
      const matchingChild = matchingModule.childModules?.find((child) => child.table === table);
      if (matchingChild) {
        return matchingChild.writeRoles;
      }
    }
  }

  return tableRegistry.get(table)?.writeRoles ?? [];
}

function normalizeFieldValue(field: FormFieldConfig, rawValue: unknown) {
  if (field.readOnly) return undefined;

  if (field.type === "checkbox") {
    return isTruthy(rawValue);
  }

  if (rawValue === "" || rawValue === undefined) {
    return field.required ? "" : null;
  }

  if (field.type === "number") {
    if (rawValue === null) return null;
    const numeric = Number(rawValue);
    return Number.isNaN(numeric) ? null : numeric;
  }

  return rawValue;
}

export function normalizeRecordPayload(table: TableName, values: Record<string, unknown>) {
  const fields = getTableFields(table);
  const payload = fields.reduce<Record<string, unknown>>((accumulator, field) => {
    if (!(field.key in values)) {
      return accumulator;
    }

    accumulator[field.key] = normalizeFieldValue(field, values[field.key]);
    return accumulator;
  }, {});

  if (table === "risks") {
    const probability = Number(payload.probability ?? values.probability ?? 0);
    const impact = Number(payload.impact ?? values.impact ?? 0);
    const { score, level } = calculateRisk(probability, impact);
    payload.risk_score = score;
    payload.risk_level = level;
  }

  if (table === "app_settings" && typeof values.setting_value === "string") {
    try {
      payload.setting_value = JSON.parse(values.setting_value);
    } catch {
      payload.setting_value = { raw: values.setting_value };
    }
  }

  return compactObject(payload);
}
