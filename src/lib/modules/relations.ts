import type { TableName } from "@/types/database";

export const RELATION_KEY_TO_TABLE: Record<string, TableName | string> = {
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
  agent_id: "profiles",
  role_id: "roles",
  department_id: "departments",
  category_id: "document_categories",
  form_id: "forms",
  non_conformity_id: "non_conformities",
  supplier_id: "suppliers",
  customer_complaint_id: "customer_complaints"
};

export function getRelationTableForKey(key: string) {
  return RELATION_KEY_TO_TABLE[key] ?? "";
}
