import type { ModuleSlug, RoleSlug } from "@/types/database";

const WRITE_MATRIX: Record<ModuleSlug, RoleSlug[]> = {
  documents: ["admin", "quality_manager"],
  forms: ["admin", "quality_manager"],
  workflows: ["admin", "quality_manager", "employee"],
  "non-conformities": ["admin", "quality_manager", "auditor", "employee"],
  "capa-actions": ["admin", "quality_manager", "auditor"],
  audits: ["admin", "quality_manager", "auditor"],
  risks: ["admin", "quality_manager", "auditor"],
  trainings: ["admin", "quality_manager"],
  equipment: ["admin", "quality_manager"],
  suppliers: ["admin", "quality_manager"],
  notifications: ["admin", "quality_manager", "auditor", "employee", "supplier_viewer"]
};

export function canWriteModule(role: RoleSlug, module: ModuleSlug) {
  return WRITE_MATRIX[module].includes(role);
}

export function canManageSettings(role: RoleSlug) {
  return role === "admin" || role === "quality_manager";
}

export function canInviteUsers(role: RoleSlug) {
  return role === "admin";
}

export function canViewAuditTrail(role: RoleSlug) {
  return role === "admin" || role === "quality_manager" || role === "auditor";
}
