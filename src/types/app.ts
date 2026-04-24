import type { LucideIcon } from "lucide-react";

import type {
  ModuleSlug,
  Role,
  RoleSlug,
  TableName,
  Department,
  Profile
} from "@/types/database";

export interface LookupOption {
  id: string;
  label: string;
  meta?: Record<string, string | null>;
}

export interface LookupCollection {
  [table: string]: LookupOption[];
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "url"
  | "select"
  | "checkbox";

export interface RelationConfig {
  table: TableName;
  labelKey?: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  relation?: RelationConfig;
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
  storageFolder?: string;
  accept?: string;
}

export interface ListColumnConfig {
  key: string;
  label: string;
  variant?: "text" | "status" | "date" | "number" | "relation" | "boolean";
}

export interface ChildModuleConfig {
  key: string;
  label: string;
  description: string;
  table: TableName;
  parentField: string;
  searchableFields: string[];
  fields: FormFieldConfig[];
  columns: ListColumnConfig[];
  defaultValues?: Record<string, string | number | boolean | null>;
  fixedValues?: Record<string, string | number | boolean | null>;
  writeRoles: RoleSlug[];
}

export interface ModuleConfig {
  slug: ModuleSlug;
  label: string;
  singular: string;
  icon: LucideIcon;
  table: TableName;
  description: string;
  accentClass: string;
  searchableFields: string[];
  columns: ListColumnConfig[];
  fields: FormFieldConfig[];
  detailFields: string[];
  emptyState: string;
  writeRoles: RoleSlug[];
  childModules?: ChildModuleConfig[];
}

export type SerializableModuleConfig = Omit<ModuleConfig, "icon">;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module?: ModuleSlug;
}

export interface UserContext {
  userId: string;
  email: string;
  profile: Profile | null;
  role: RoleSlug;
}

export interface SettingsData {
  roles: Role[];
  departments: Department[];
  categories: Array<{ id: string; name: string; description: string | null }>;
  profiles: Profile[];
}
