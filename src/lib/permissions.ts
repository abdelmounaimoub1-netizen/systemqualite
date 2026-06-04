import { appNavItems } from "@/lib/modules/config";
import type { ModuleSlug, RoleSlug } from "@/types/database";

const READ_MATRIX: Record<RoleSlug, ModuleSlug[] | "*"> = {
  admin: "*",
  quality_manager: "*",
  auditor: "*",
  employee: "*",
  supplier_viewer: ["documents", "supplier-complaints", "suppliers"]
};

const WRITE_MATRIX: Record<ModuleSlug, RoleSlug[]> = {
  documents: ["admin", "quality_manager"],
  forms: ["admin", "quality_manager"],
  workflows: ["admin", "quality_manager", "employee"],
  "customer-complaints": ["admin", "quality_manager", "auditor", "employee"],
  "supplier-complaints": ["admin", "quality_manager", "auditor", "employee", "supplier_viewer"],
  "non-conformities": ["admin", "quality_manager", "auditor", "employee"],
  constats: ["admin", "quality_manager", "auditor", "employee"],
  complaints: ["admin", "quality_manager", "auditor", "employee"],
  "capa-actions": ["admin", "quality_manager", "auditor"],
  audits: ["admin", "quality_manager", "auditor"],
  risks: ["admin", "quality_manager", "auditor"],
  trainings: ["admin", "quality_manager"],
  equipment: ["admin", "quality_manager"],
  suppliers: ["admin", "quality_manager"],
  notifications: ["admin", "quality_manager", "auditor", "employee"]
};

export function canReadModule(role: RoleSlug, module: ModuleSlug) {
  const allowed = READ_MATRIX[role];
  return allowed === "*" || allowed.includes(module);
}

export function canWriteModule(role: RoleSlug, module: ModuleSlug) {
  return WRITE_MATRIX[module].includes(role);
}

export function getNavItemsForRole(role: RoleSlug) {
  const items = appNavItems.filter((item) => {
    if (item.href === "/settings") {
      return role !== "supplier_viewer";
    }

    if (item.href === "/dashboard") {
      return true;
    }

    const moduleSlug = item.module;
    if (!moduleSlug) return true;

    return canReadModule(role, moduleSlug);
  });

  if (role === "supplier_viewer") {
    return items;
  }

  return items;
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
