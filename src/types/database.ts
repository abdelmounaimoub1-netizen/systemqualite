export type RoleSlug =
  | "admin"
  | "quality_manager"
  | "auditor"
  | "employee"
  | "supplier_viewer";

export type DocumentStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Archived";

export type WorkflowStatus =
  | "Draft"
  | "In Progress"
  | "Awaiting Approval"
  | "Approved"
  | "Rejected"
  | "Completed";

export type NonConformityStatus = "Open" | "In Progress" | "Closed";
export type CapaStatus = "Open" | "In Progress" | "Verification" | "Closed";
export type AuditStatus = "Planned" | "In Progress" | "Completed" | "Closed";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type TrainingStatus = "Planned" | "In Progress" | "Completed" | "Expired";
export type EquipmentStatus = "Active" | "Maintenance" | "Calibration Due" | "Retired";
export type SupplierStatus = "Approved" | "Under Review" | "Blocked";
export type NotificationStatus = "Unread" | "Read";

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Role extends BaseRecord {
  name: string;
  slug: RoleSlug;
  description: string | null;
}

export interface Department extends BaseRecord {
  name: string;
  description: string | null;
}

export interface DocumentCategory extends BaseRecord {
  name: string;
  description: string | null;
}

export interface Profile extends BaseRecord {
  email: string;
  full_name: string;
  job_title: string | null;
  phone: string | null;
  role_id: string | null;
  department_id: string | null;
  avatar_url: string | null;
  supplier_company: string | null;
  is_active: boolean;
}

export interface Document extends BaseRecord {
  document_code: string;
  title: string;
  summary: string | null;
  category_id: string | null;
  owner_id: string | null;
  department_id: string | null;
  status: DocumentStatus;
  version_current: string;
  effective_date: string | null;
  review_date: string | null;
  file_path: string | null;
}

export interface DocumentVersion extends BaseRecord {
  document_id: string;
  version_number: string;
  status: DocumentStatus;
  change_summary: string | null;
  approval_date: string | null;
  file_path: string | null;
}

export interface Workflow extends BaseRecord {
  title: string;
  description: string | null;
  status: WorkflowStatus;
  due_date: string | null;
  responsible_user_id: string | null;
  approval_required: boolean;
}

export interface WorkflowStep extends BaseRecord {
  workflow_id: string;
  step_name: string;
  description: string | null;
  responsible_user_id: string | null;
  due_date: string | null;
  status: WorkflowStatus;
  approval_state: "Pending" | "Approved" | "Rejected";
}

export interface NonConformity extends BaseRecord {
  title: string;
  description: string | null;
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string | null;
  department_id: string | null;
  status: NonConformityStatus;
  responsible_user_id: string | null;
  root_cause: string | null;
  due_date: string | null;
}

export interface CapaAction extends BaseRecord {
  title: string;
  action_type: "Corrective" | "Preventive";
  non_conformity_id: string | null;
  description: string | null;
  responsible_user_id: string | null;
  deadline: string | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: CapaStatus;
  effectiveness_check: string | null;
}

export interface Audit extends BaseRecord {
  title: string;
  audit_type: "Internal" | "External";
  scope: string | null;
  auditor_id: string | null;
  planned_date: string | null;
  follow_up_date: string | null;
  status: AuditStatus;
  report_path: string | null;
}

export interface AuditChecklist extends BaseRecord {
  audit_id: string;
  item_text: string;
  is_required: boolean;
  response_status: "Pending" | "Pass" | "Fail" | "N/A";
  notes: string | null;
}

export interface AuditFinding extends BaseRecord {
  audit_id: string;
  title: string;
  description: string | null;
  severity: "Minor" | "Major" | "Critical";
  owner_id: string | null;
  status: "Open" | "Action Planned" | "Closed";
}

export interface Risk extends BaseRecord {
  title: string;
  description: string | null;
  probability: number;
  impact: number;
  risk_score: number;
  risk_level: RiskLevel;
  mitigation_plan: string | null;
  owner_id: string | null;
  review_date: string | null;
}

export interface Training extends BaseRecord {
  title: string;
  employee_id: string | null;
  role_required: string | null;
  status: TrainingStatus;
  expiry_date: string | null;
  certificate_path: string | null;
  notes: string | null;
}

export interface Equipment extends BaseRecord {
  name: string;
  serial_number: string | null;
  location: string | null;
  maintenance_date: string | null;
  calibration_date: string | null;
  status: EquipmentStatus;
  notes: string | null;
}

export interface Supplier extends BaseRecord {
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  evaluation_score: number | null;
  status: SupplierStatus;
  audit_history: string | null;
  notes: string | null;
}

export interface NotificationRecord extends BaseRecord {
  title: string;
  message: string;
  status: NotificationStatus;
  due_date: string | null;
  category: string | null;
  user_id: string | null;
  action_url: string | null;
}

export interface AuditTrailEntry extends BaseRecord {
  table_name: string;
  record_id: string;
  action_type: "INSERT" | "UPDATE" | "DELETE";
  user_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
}

export interface CommentRecord extends BaseRecord {
  table_name: string;
  record_id: string;
  body: string;
}

export interface AttachmentRecord extends BaseRecord {
  table_name: string;
  record_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  note: string | null;
}

export interface AppSetting extends BaseRecord {
  setting_key: string;
  setting_value: Record<string, unknown>;
}

export type ModuleSlug =
  | "documents"
  | "workflows"
  | "non-conformities"
  | "capa-actions"
  | "audits"
  | "risks"
  | "trainings"
  | "equipment"
  | "suppliers"
  | "notifications";

export type DatabaseRecordMap = {
  roles: Role;
  departments: Department;
  document_categories: DocumentCategory;
  profiles: Profile;
  documents: Document;
  document_versions: DocumentVersion;
  workflows: Workflow;
  workflow_steps: WorkflowStep;
  non_conformities: NonConformity;
  capa_actions: CapaAction;
  audits: Audit;
  audit_checklists: AuditChecklist;
  audit_findings: AuditFinding;
  risks: Risk;
  trainings: Training;
  equipment: Equipment;
  suppliers: Supplier;
  notifications: NotificationRecord;
  audit_trail: AuditTrailEntry;
  comments: CommentRecord;
  attachments: AttachmentRecord;
  app_settings: AppSetting;
};

export type TableName = keyof DatabaseRecordMap;
