import {
  Bell,
  BookCopy,
  Boxes,
  ClipboardCheck,
  FileStack,
  Gauge,
  LayoutGrid,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench
} from "lucide-react";

import type {
  ChildModuleConfig,
  LookupOption,
  ModuleConfig,
  NavItem
} from "@/types/app";
import type { ModuleSlug, TableName } from "@/types/database";

const profileRelation = { table: "profiles" as TableName, labelKey: "full_name" };
const roleRelation = { table: "roles" as TableName, labelKey: "name" };
const departmentRelation = { table: "departments" as TableName, labelKey: "name" };
const categoryRelation = { table: "document_categories" as TableName, labelKey: "name" };
const nonConformityRelation = {
  table: "non_conformities" as TableName,
  labelKey: "title"
};

export const lookupSelectMap: Record<TableName, string> = {
  roles: "id,name,slug,description,created_at,updated_at,created_by",
  departments: "id,name,description,created_at,updated_at,created_by",
  document_categories: "id,name,description,created_at,updated_at,created_by",
  profiles:
    "id,email,full_name,job_title,phone,role_id,department_id,avatar_url,supplier_company,is_active,created_at,updated_at,created_by",
  documents:
    "id,document_code,title,summary,category_id,owner_id,department_id,status,version_current,effective_date,review_date,file_path,created_at,updated_at,created_by",
  document_versions:
    "id,document_id,version_number,status,change_summary,approval_date,file_path,created_at,updated_at,created_by",
  workflows:
    "id,title,description,status,due_date,responsible_user_id,approval_required,created_at,updated_at,created_by",
  workflow_steps:
    "id,workflow_id,step_name,description,responsible_user_id,due_date,status,approval_state,created_at,updated_at,created_by",
  non_conformities:
    "id,title,description,severity,source,department_id,status,responsible_user_id,root_cause,due_date,created_at,updated_at,created_by",
  capa_actions:
    "id,title,action_type,non_conformity_id,description,responsible_user_id,deadline,priority,status,effectiveness_check,created_at,updated_at,created_by",
  audits:
    "id,title,audit_type,scope,auditor_id,planned_date,follow_up_date,status,report_path,created_at,updated_at,created_by",
  audit_checklists:
    "id,audit_id,item_text,is_required,response_status,notes,created_at,updated_at,created_by",
  audit_findings:
    "id,audit_id,title,description,severity,owner_id,status,created_at,updated_at,created_by",
  risks:
    "id,title,description,probability,impact,risk_score,risk_level,mitigation_plan,owner_id,review_date,created_at,updated_at,created_by",
  trainings:
    "id,title,employee_id,role_required,status,expiry_date,certificate_path,notes,created_at,updated_at,created_by",
  equipment:
    "id,name,serial_number,location,maintenance_date,calibration_date,status,notes,created_at,updated_at,created_by",
  suppliers:
    "id,name,contact_name,email,phone,evaluation_score,status,audit_history,notes,created_at,updated_at,created_by",
  notifications:
    "id,title,message,status,due_date,category,user_id,action_url,created_at,updated_at,created_by",
  audit_trail:
    "id,table_name,record_id,action_type,user_id,before_data,after_data,created_at,updated_at,created_by",
  comments:
    "id,table_name,record_id,body,created_at,updated_at,created_by",
  attachments:
    "id,table_name,record_id,file_name,file_path,file_size,mime_type,note,created_at,updated_at,created_by",
  app_settings:
    "id,setting_key,setting_value,created_at,updated_at,created_by"
};

function commentModule(
  label: string,
  tableName: string,
  writeRoles: ChildModuleConfig["writeRoles"]
): ChildModuleConfig {
  return {
    key: `comments-${tableName}`,
    label: "Discussion",
    description: `Track working notes and follow-up on ${label.toLowerCase()}.`,
    table: "comments",
    parentField: "record_id",
    searchableFields: ["body"],
    fixedValues: {
      table_name: tableName
    },
    columns: [
      { key: "body", label: "Comment" },
      { key: "created_at", label: "Added", variant: "date" }
    ],
    fields: [
      {
        key: "body",
        label: "Comment",
        type: "textarea",
        required: true,
        placeholder: "Add a note, escalation detail, or follow-up."
      }
    ],
    writeRoles
  };
}

function attachmentModule(
  label: string,
  tableName: string,
  writeRoles: ChildModuleConfig["writeRoles"]
): ChildModuleConfig {
  return {
    key: `attachments-${tableName}`,
    label: "Attachments",
    description: `Upload evidence and related files for ${label.toLowerCase()}.`,
    table: "attachments",
    parentField: "record_id",
    searchableFields: ["file_name", "note"],
    fixedValues: {
      table_name: tableName
    },
    columns: [
      { key: "file_name", label: "File" },
      { key: "note", label: "Note" },
      { key: "created_at", label: "Uploaded", variant: "date" }
    ],
    fields: [
      {
        key: "file_name",
        label: "File name",
        type: "text",
        required: true,
        placeholder: "Auto-populated when uploading."
      },
      {
        key: "file_path",
        label: "Storage path",
        type: "text",
        required: true,
        placeholder: "Generated after upload."
      },
      {
        key: "mime_type",
        label: "MIME type",
        type: "text",
        placeholder: "application/pdf"
      },
      {
        key: "file_size",
        label: "File size (bytes)",
        type: "number"
      },
      {
        key: "note",
        label: "Note",
        type: "textarea",
        placeholder: "Context for this attachment."
      }
    ],
    writeRoles
  };
}

export const moduleConfigs: Record<ModuleSlug, ModuleConfig> = {
  documents: {
    slug: "documents",
    label: "Documents",
    singular: "Document",
    icon: FileStack,
    table: "documents",
    description: "Controlled records with ownership, review dates, and approval state.",
    accentClass: "from-sky-500/20 via-cyan-500/10 to-transparent",
    searchableFields: ["title", "document_code", "summary"],
    columns: [
      { key: "document_code", label: "Code" },
      { key: "title", label: "Title" },
      { key: "category_id", label: "Category", variant: "relation" },
      { key: "status", label: "Status", variant: "status" },
      { key: "owner_id", label: "Owner", variant: "relation" },
      { key: "review_date", label: "Review date", variant: "date" }
    ],
    fields: [
      {
        key: "document_code",
        label: "Document code",
        type: "text",
        required: true,
        placeholder: "DOC-001"
      },
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
        placeholder: "Quality handbook"
      },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        placeholder: "Short purpose and scope."
      },
      {
        key: "category_id",
        label: "Category",
        type: "select",
        relation: categoryRelation,
        required: true
      },
      {
        key: "owner_id",
        label: "Owner",
        type: "select",
        relation: profileRelation,
        required: true
      },
      {
        key: "department_id",
        label: "Department",
        type: "select",
        relation: departmentRelation
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Under Review", value: "Under Review" },
          { label: "Approved", value: "Approved" },
          { label: "Archived", value: "Archived" }
        ]
      },
      {
        key: "version_current",
        label: "Current version",
        type: "text",
        required: true,
        placeholder: "1.0"
      },
      {
        key: "effective_date",
        label: "Effective date",
        type: "date"
      },
      {
        key: "review_date",
        label: "Review date",
        type: "date"
      },
      {
        key: "file_path",
        label: "Primary file path",
        type: "text",
        placeholder: "qms-files/documents/...",
        storageFolder: "documents/primary",
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      }
    ],
    detailFields: [
      "document_code",
      "title",
      "summary",
      "status",
      "version_current",
      "review_date",
      "owner_id"
    ],
    emptyState: "Start your controlled document library with a handbook, SOP, or policy.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [
      {
        key: "document-versions",
        label: "Version history",
        description: "Track revisions, approval dates, and stored file paths.",
        table: "document_versions",
        parentField: "document_id",
        searchableFields: ["version_number", "change_summary"],
        columns: [
          { key: "version_number", label: "Version" },
          { key: "status", label: "Status", variant: "status" },
          { key: "approval_date", label: "Approved", variant: "date" },
          { key: "change_summary", label: "Change summary" }
        ],
        fields: [
          {
            key: "version_number",
            label: "Version number",
            type: "text",
            required: true,
            placeholder: "1.1"
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { label: "Draft", value: "Draft" },
              { label: "Under Review", value: "Under Review" },
              { label: "Approved", value: "Approved" },
              { label: "Archived", value: "Archived" }
            ]
          },
          {
            key: "approval_date",
            label: "Approval date",
            type: "date"
          },
          {
            key: "file_path",
            label: "Version file path",
            type: "text",
            placeholder: "qms-files/documents/versions/...",
            storageFolder: "documents/versions",
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          },
          {
            key: "change_summary",
            label: "Change summary",
            type: "textarea",
            placeholder: "Explain the revision in a sentence or two."
          }
        ],
        writeRoles: ["admin", "quality_manager"]
      },
      attachmentModule("Documents", "documents", ["admin", "quality_manager"]),
      commentModule("Documents", "documents", ["admin", "quality_manager", "auditor"])
    ]
  },
  workflows: {
    slug: "workflows",
    label: "Workflows",
    singular: "Workflow",
    icon: Sparkles,
    table: "workflows",
    description: "Structured review and approval flows with due dates and accountability.",
    accentClass: "from-emerald-500/20 via-teal-400/10 to-transparent",
    searchableFields: ["title", "description"],
    columns: [
      { key: "title", label: "Workflow" },
      { key: "status", label: "Status", variant: "status" },
      { key: "due_date", label: "Due date", variant: "date" },
      { key: "responsible_user_id", label: "Responsible", variant: "relation" },
      { key: "approval_required", label: "Approval", variant: "boolean" }
    ],
    fields: [
      {
        key: "title",
        label: "Workflow name",
        type: "text",
        required: true,
        placeholder: "Supplier onboarding approval"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "How this workflow should move through review."
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Draft", value: "Draft" },
          { label: "In Progress", value: "In Progress" },
          { label: "Awaiting Approval", value: "Awaiting Approval" },
          { label: "Approved", value: "Approved" },
          { label: "Rejected", value: "Rejected" },
          { label: "Completed", value: "Completed" }
        ]
      },
      {
        key: "due_date",
        label: "Due date",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Responsible user",
        type: "select",
        relation: profileRelation
      },
      {
        key: "approval_required",
        label: "Approval required",
        type: "checkbox"
      }
    ],
    detailFields: ["title", "description", "status", "due_date", "responsible_user_id"],
    emptyState: "Map recurring approval flows so teams know what happens next.",
    writeRoles: ["admin", "quality_manager", "employee"],
    childModules: [
      {
        key: "workflow-steps",
        label: "Workflow steps",
        description: "Assign accountable users and step-level due dates.",
        table: "workflow_steps",
        parentField: "workflow_id",
        searchableFields: ["step_name", "description"],
        columns: [
          { key: "step_name", label: "Step" },
          { key: "responsible_user_id", label: "Owner", variant: "relation" },
          { key: "due_date", label: "Due", variant: "date" },
          { key: "status", label: "Status", variant: "status" }
        ],
        fields: [
          {
            key: "step_name",
            label: "Step name",
            type: "text",
            required: true,
            placeholder: "Manager review"
          },
          {
            key: "description",
            label: "Description",
            type: "textarea"
          },
          {
            key: "responsible_user_id",
            label: "Responsible user",
            type: "select",
            relation: profileRelation
          },
          {
            key: "due_date",
            label: "Due date",
            type: "date"
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Draft", value: "Draft" },
              { label: "In Progress", value: "In Progress" },
              { label: "Awaiting Approval", value: "Awaiting Approval" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
              { label: "Completed", value: "Completed" }
            ]
          },
          {
            key: "approval_state",
            label: "Approval state",
            type: "select",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" }
            ]
          }
        ],
        writeRoles: ["admin", "quality_manager", "employee"]
      },
      commentModule("Workflows", "workflows", ["admin", "quality_manager", "employee"])
    ]
  },
  "non-conformities": {
    slug: "non-conformities",
    label: "Non-Conformities",
    singular: "Non-conformity",
    icon: ShieldAlert,
    table: "non_conformities",
    description: "Capture issues, assign ownership, and drive root-cause closure.",
    accentClass: "from-rose-500/20 via-orange-400/10 to-transparent",
    searchableFields: ["title", "description", "source", "root_cause"],
    columns: [
      { key: "title", label: "Issue" },
      { key: "severity", label: "Severity", variant: "status" },
      { key: "status", label: "Status", variant: "status" },
      { key: "department_id", label: "Department", variant: "relation" },
      { key: "responsible_user_id", label: "Responsible", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
        placeholder: "Temperature log not completed"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Describe what happened."
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        required: true,
        options: [
          { label: "Low", value: "Low" },
          { label: "Medium", value: "Medium" },
          { label: "High", value: "High" },
          { label: "Critical", value: "Critical" }
        ]
      },
      {
        key: "source",
        label: "Source",
        type: "text",
        placeholder: "Audit, complaint, internal review..."
      },
      {
        key: "department_id",
        label: "Department",
        type: "select",
        relation: departmentRelation
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Open", value: "Open" },
          { label: "In Progress", value: "In Progress" },
          { label: "Closed", value: "Closed" }
        ]
      },
      {
        key: "responsible_user_id",
        label: "Responsible person",
        type: "select",
        relation: profileRelation
      },
      {
        key: "root_cause",
        label: "Root cause",
        type: "textarea"
      },
      {
        key: "due_date",
        label: "Target closure date",
        type: "date"
      }
    ],
    detailFields: [
      "title",
      "severity",
      "status",
      "source",
      "department_id",
      "responsible_user_id",
      "root_cause"
    ],
    emptyState: "Log the first issue so CAPA and audit follow-up have a single source of truth.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      {
        key: "linked-capa",
        label: "Linked CAPA actions",
        description: "Corrective and preventive actions tied directly to this issue.",
        table: "capa_actions",
        parentField: "non_conformity_id",
        searchableFields: ["title", "description", "effectiveness_check"],
        columns: [
          { key: "title", label: "Action" },
          { key: "action_type", label: "Type" },
          { key: "priority", label: "Priority", variant: "status" },
          { key: "status", label: "Status", variant: "status" },
          { key: "deadline", label: "Deadline", variant: "date" }
        ],
        fields: [
          {
            key: "title",
            label: "Action title",
            type: "text",
            required: true
          },
          {
            key: "action_type",
            label: "Action type",
            type: "select",
            options: [
              { label: "Corrective", value: "Corrective" },
              { label: "Preventive", value: "Preventive" }
            ],
            required: true
          },
          {
            key: "description",
            label: "Description",
            type: "textarea"
          },
          {
            key: "responsible_user_id",
            label: "Responsible user",
            type: "select",
            relation: profileRelation
          },
          {
            key: "deadline",
            label: "Deadline",
            type: "date"
          },
          {
            key: "priority",
            label: "Priority",
            type: "select",
            options: [
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
              { label: "Critical", value: "Critical" }
            ]
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Open", value: "Open" },
              { label: "In Progress", value: "In Progress" },
              { label: "Verification", value: "Verification" },
              { label: "Closed", value: "Closed" }
            ]
          },
          {
            key: "effectiveness_check",
            label: "Effectiveness check",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      attachmentModule("Non-conformities", "non_conformities", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Non-conformities", "non_conformities", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  "capa-actions": {
    slug: "capa-actions",
    label: "CAPA",
    singular: "CAPA action",
    icon: ShieldCheck,
    table: "capa_actions",
    description: "Manage corrective and preventive actions from intake to effectiveness check.",
    accentClass: "from-amber-500/20 via-yellow-500/10 to-transparent",
    searchableFields: ["title", "description", "effectiveness_check"],
    columns: [
      { key: "title", label: "Action" },
      { key: "action_type", label: "Type" },
      { key: "priority", label: "Priority", variant: "status" },
      { key: "status", label: "Status", variant: "status" },
      { key: "deadline", label: "Deadline", variant: "date" }
    ],
    fields: [
      {
        key: "title",
        label: "Action title",
        type: "text",
        required: true
      },
      {
        key: "action_type",
        label: "Action type",
        type: "select",
        required: true,
        options: [
          { label: "Corrective", value: "Corrective" },
          { label: "Preventive", value: "Preventive" }
        ]
      },
      {
        key: "non_conformity_id",
        label: "Linked non-conformity",
        type: "select",
        relation: nonConformityRelation
      },
      {
        key: "description",
        label: "Description",
        type: "textarea"
      },
      {
        key: "responsible_user_id",
        label: "Responsible person",
        type: "select",
        relation: profileRelation
      },
      {
        key: "deadline",
        label: "Deadline",
        type: "date"
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Low", value: "Low" },
          { label: "Medium", value: "Medium" },
          { label: "High", value: "High" },
          { label: "Critical", value: "Critical" }
        ]
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "Open" },
          { label: "In Progress", value: "In Progress" },
          { label: "Verification", value: "Verification" },
          { label: "Closed", value: "Closed" }
        ]
      },
      {
        key: "effectiveness_check",
        label: "Effectiveness check",
        type: "textarea"
      }
    ],
    detailFields: [
      "title",
      "action_type",
      "priority",
      "status",
      "deadline",
      "responsible_user_id"
    ],
    emptyState: "Create the actions that close the loop after an issue or preventive review.",
    writeRoles: ["admin", "quality_manager", "auditor"],
    childModules: [
      attachmentModule("CAPA", "capa_actions", ["admin", "quality_manager", "auditor"]),
      commentModule("CAPA", "capa_actions", ["admin", "quality_manager", "auditor"])
    ]
  },
  audits: {
    slug: "audits",
    label: "Audits",
    singular: "Audit",
    icon: ClipboardCheck,
    table: "audits",
    description: "Plan audits, capture findings, and keep follow-up visible.",
    accentClass: "from-indigo-500/20 via-sky-500/10 to-transparent",
    searchableFields: ["title", "scope"],
    columns: [
      { key: "title", label: "Audit" },
      { key: "audit_type", label: "Type" },
      { key: "status", label: "Status", variant: "status" },
      { key: "planned_date", label: "Planned", variant: "date" },
      { key: "auditor_id", label: "Auditor", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Audit title",
        type: "text",
        required: true,
        placeholder: "Internal GMP audit - packaging"
      },
      {
        key: "audit_type",
        label: "Audit type",
        type: "select",
        required: true,
        options: [
          { label: "Internal", value: "Internal" },
          { label: "External", value: "External" }
        ]
      },
      {
        key: "scope",
        label: "Scope",
        type: "textarea"
      },
      {
        key: "auditor_id",
        label: "Assigned auditor",
        type: "select",
        relation: profileRelation
      },
      {
        key: "planned_date",
        label: "Planned date",
        type: "date"
      },
      {
        key: "follow_up_date",
        label: "Follow-up date",
        type: "date"
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Planned", value: "Planned" },
          { label: "In Progress", value: "In Progress" },
          { label: "Completed", value: "Completed" },
          { label: "Closed", value: "Closed" }
        ],
        required: true
      },
      {
        key: "report_path",
        label: "Report path",
        type: "text",
        placeholder: "qms-files/audits/reports/...",
        storageFolder: "audits/reports",
        accept: ".pdf,.doc,.docx"
      }
    ],
    detailFields: ["title", "audit_type", "scope", "status", "planned_date", "auditor_id"],
    emptyState: "Schedule your next audit so findings and follow-up do not live in email threads.",
    writeRoles: ["admin", "quality_manager", "auditor"],
    childModules: [
      {
        key: "audit-checklist",
        label: "Checklist",
        description: "Build and complete the audit question set.",
        table: "audit_checklists",
        parentField: "audit_id",
        searchableFields: ["item_text", "notes"],
        columns: [
          { key: "item_text", label: "Checklist item" },
          { key: "response_status", label: "Response", variant: "status" },
          { key: "is_required", label: "Required", variant: "boolean" }
        ],
        fields: [
          {
            key: "item_text",
            label: "Checklist item",
            type: "textarea",
            required: true
          },
          {
            key: "is_required",
            label: "Required item",
            type: "checkbox"
          },
          {
            key: "response_status",
            label: "Response",
            type: "select",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "Pass", value: "Pass" },
              { label: "Fail", value: "Fail" },
              { label: "N/A", value: "N/A" }
            ]
          },
          {
            key: "notes",
            label: "Notes",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      {
        key: "audit-findings",
        label: "Findings",
        description: "Capture findings that require corrective action or closure evidence.",
        table: "audit_findings",
        parentField: "audit_id",
        searchableFields: ["title", "description"],
        columns: [
          { key: "title", label: "Finding" },
          { key: "severity", label: "Severity", variant: "status" },
          { key: "status", label: "Status", variant: "status" },
          { key: "owner_id", label: "Owner", variant: "relation" }
        ],
        fields: [
          {
            key: "title",
            label: "Finding title",
            type: "text",
            required: true
          },
          {
            key: "description",
            label: "Description",
            type: "textarea"
          },
          {
            key: "severity",
            label: "Severity",
            type: "select",
            options: [
              { label: "Minor", value: "Minor" },
              { label: "Major", value: "Major" },
              { label: "Critical", value: "Critical" }
            ]
          },
          {
            key: "owner_id",
            label: "Owner",
            type: "select",
            relation: profileRelation
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Open", value: "Open" },
              { label: "Action Planned", value: "Action Planned" },
              { label: "Closed", value: "Closed" }
            ]
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      attachmentModule("Audits", "audits", ["admin", "quality_manager", "auditor"])
    ]
  },
  risks: {
    slug: "risks",
    label: "Risk Register",
    singular: "Risk",
    icon: Gauge,
    table: "risks",
    description: "Score risk consistently and keep mitigation ownership visible.",
    accentClass: "from-fuchsia-500/20 via-pink-500/10 to-transparent",
    searchableFields: ["title", "description", "mitigation_plan"],
    columns: [
      { key: "title", label: "Risk" },
      { key: "probability", label: "Probability", variant: "number" },
      { key: "impact", label: "Impact", variant: "number" },
      { key: "risk_level", label: "Level", variant: "status" },
      { key: "review_date", label: "Review", variant: "date" }
    ],
    fields: [
      {
        key: "title",
        label: "Risk title",
        type: "text",
        required: true
      },
      {
        key: "description",
        label: "Description",
        type: "textarea"
      },
      {
        key: "probability",
        label: "Probability (1-5)",
        type: "number",
        min: 1,
        max: 5,
        required: true
      },
      {
        key: "impact",
        label: "Impact (1-5)",
        type: "number",
        min: 1,
        max: 5,
        required: true
      },
      {
        key: "mitigation_plan",
        label: "Mitigation plan",
        type: "textarea"
      },
      {
        key: "owner_id",
        label: "Owner",
        type: "select",
        relation: profileRelation
      },
      {
        key: "review_date",
        label: "Review date",
        type: "date"
      }
    ],
    detailFields: [
      "title",
      "description",
      "probability",
      "impact",
      "risk_score",
      "risk_level",
      "owner_id",
      "mitigation_plan"
    ],
    emptyState: "Start the register with the most material operational or compliance risk.",
    writeRoles: ["admin", "quality_manager", "auditor"],
    childModules: [commentModule("Risks", "risks", ["admin", "quality_manager", "auditor"])]
  },
  trainings: {
    slug: "trainings",
    label: "Training",
    singular: "Training record",
    icon: BookCopy,
    table: "trainings",
    description: "Track competence, assignment, certificate evidence, and expiry.",
    accentClass: "from-violet-500/20 via-cyan-400/10 to-transparent",
    searchableFields: ["title", "role_required", "notes"],
    columns: [
      { key: "title", label: "Training" },
      { key: "employee_id", label: "Employee", variant: "relation" },
      { key: "status", label: "Status", variant: "status" },
      { key: "expiry_date", label: "Expiry", variant: "date" },
      { key: "role_required", label: "Required role" }
    ],
    fields: [
      {
        key: "title",
        label: "Training title",
        type: "text",
        required: true
      },
      {
        key: "employee_id",
        label: "Employee",
        type: "select",
        relation: profileRelation
      },
      {
        key: "role_required",
        label: "Required by role",
        type: "text",
        placeholder: "Operator, Auditor, Supervisor..."
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Planned", value: "Planned" },
          { label: "In Progress", value: "In Progress" },
          { label: "Completed", value: "Completed" },
          { label: "Expired", value: "Expired" }
        ],
        required: true
      },
      {
        key: "expiry_date",
        label: "Expiry date",
        type: "date"
      },
      {
        key: "certificate_path",
        label: "Certificate path",
        type: "text",
        placeholder: "qms-files/trainings/certificates/...",
        storageFolder: "trainings/certificates",
        accept: ".pdf,.jpg,.jpeg,.png"
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea"
      }
    ],
    detailFields: ["title", "employee_id", "status", "expiry_date", "role_required", "notes"],
    emptyState: "Add required training records so competence and expiry stop living in spreadsheets.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [attachmentModule("Training", "trainings", ["admin", "quality_manager"])]
  },
  equipment: {
    slug: "equipment",
    label: "Equipment",
    singular: "Equipment item",
    icon: Wrench,
    table: "equipment",
    description: "Keep maintenance, calibration, and status visible in one place.",
    accentClass: "from-slate-500/20 via-sky-400/10 to-transparent",
    searchableFields: ["name", "serial_number", "location", "notes"],
    columns: [
      { key: "name", label: "Equipment" },
      { key: "serial_number", label: "Serial no." },
      { key: "location", label: "Location" },
      { key: "status", label: "Status", variant: "status" },
      { key: "calibration_date", label: "Calibration", variant: "date" }
    ],
    fields: [
      {
        key: "name",
        label: "Equipment name",
        type: "text",
        required: true
      },
      {
        key: "serial_number",
        label: "Serial number",
        type: "text"
      },
      {
        key: "location",
        label: "Location",
        type: "text"
      },
      {
        key: "maintenance_date",
        label: "Maintenance date",
        type: "date"
      },
      {
        key: "calibration_date",
        label: "Calibration date",
        type: "date"
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "Active" },
          { label: "Maintenance", value: "Maintenance" },
          { label: "Calibration Due", value: "Calibration Due" },
          { label: "Retired", value: "Retired" }
        ],
        required: true
      },
      {
        key: "notes",
        label: "Maintenance history / notes",
        type: "textarea"
      }
    ],
    detailFields: [
      "name",
      "serial_number",
      "location",
      "maintenance_date",
      "calibration_date",
      "status",
      "notes"
    ],
    emptyState: "Create the equipment list so preventive upkeep and calibration dates are visible.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [commentModule("Equipment", "equipment", ["admin", "quality_manager"])]
  },
  suppliers: {
    slug: "suppliers",
    label: "Suppliers",
    singular: "Supplier",
    icon: UsersRound,
    table: "suppliers",
    description: "Centralize supplier profiles, evaluation score, documents, and audit context.",
    accentClass: "from-lime-500/20 via-emerald-500/10 to-transparent",
    searchableFields: ["name", "contact_name", "email", "notes"],
    columns: [
      { key: "name", label: "Supplier" },
      { key: "contact_name", label: "Contact" },
      { key: "evaluation_score", label: "Score", variant: "number" },
      { key: "status", label: "Status", variant: "status" },
      { key: "email", label: "Email" }
    ],
    fields: [
      {
        key: "name",
        label: "Supplier name",
        type: "text",
        required: true
      },
      {
        key: "contact_name",
        label: "Contact name",
        type: "text"
      },
      {
        key: "email",
        label: "Email",
        type: "email"
      },
      {
        key: "phone",
        label: "Phone",
        type: "tel"
      },
      {
        key: "evaluation_score",
        label: "Evaluation score",
        type: "number",
        min: 0,
        max: 100
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Approved", value: "Approved" },
          { label: "Under Review", value: "Under Review" },
          { label: "Blocked", value: "Blocked" }
        ],
        required: true
      },
      {
        key: "audit_history",
        label: "Audit history",
        type: "textarea"
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea"
      }
    ],
    detailFields: [
      "name",
      "contact_name",
      "status",
      "evaluation_score",
      "email",
      "phone",
      "audit_history",
      "notes"
    ],
    emptyState: "Add approved and in-review suppliers so evaluations and evidence stay linked.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [
      attachmentModule("Suppliers", "suppliers", ["admin", "quality_manager"]),
      commentModule("Suppliers", "suppliers", ["admin", "quality_manager"])
    ]
  },
  notifications: {
    slug: "notifications",
    label: "Notifications",
    singular: "Notification",
    icon: Bell,
    table: "notifications",
    description: "Track reminders, due date follow-up, and read status in-app.",
    accentClass: "from-cyan-500/20 via-sky-500/10 to-transparent",
    searchableFields: ["title", "message", "category"],
    columns: [
      { key: "title", label: "Notification" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status", variant: "status" },
      { key: "due_date", label: "Due", variant: "date" },
      { key: "user_id", label: "Recipient", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true
      },
      {
        key: "message",
        label: "Message",
        type: "textarea",
        required: true
      },
      {
        key: "category",
        label: "Category",
        type: "text",
        placeholder: "Due date, approval, audit..."
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Unread", value: "Unread" },
          { label: "Read", value: "Read" }
        ]
      },
      {
        key: "due_date",
        label: "Due date",
        type: "date"
      },
      {
        key: "user_id",
        label: "Recipient",
        type: "select",
        relation: profileRelation
      },
      {
        key: "action_url",
        label: "Action URL",
        type: "url",
        placeholder: "/audits/..."
      }
    ],
    detailFields: ["title", "message", "category", "status", "due_date", "user_id"],
    emptyState: "Create reminders for approvals, audits, and approaching due dates.",
    writeRoles: [
      "admin",
      "quality_manager",
      "auditor",
      "employee",
      "supplier_viewer"
    ]
  }
};

export const moduleOrder: ModuleSlug[] = [
  "documents",
  "workflows",
  "non-conformities",
  "capa-actions",
  "audits",
  "risks",
  "trainings",
  "equipment",
  "suppliers",
  "notifications"
];

export const appNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  ...moduleOrder.map((slug) => ({
    href: `/${slug}`,
    label: moduleConfigs[slug].label,
    icon: moduleConfigs[slug].icon,
    module: slug
  })),
  { href: "/settings", label: "Settings", icon: Boxes }
];

export const settingsTableConfigs = {
  roles: {
    label: "Roles",
    table: "roles" as TableName,
    columns: [
      { key: "name", label: "Role" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { key: "name", label: "Role name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  departments: {
    label: "Departments",
    table: "departments" as TableName,
    columns: [
      { key: "name", label: "Department" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { key: "name", label: "Department name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  document_categories: {
    label: "Document categories",
    table: "document_categories" as TableName,
    columns: [
      { key: "name", label: "Category" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { key: "name", label: "Category name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  profiles: {
    label: "Users",
    table: "profiles" as TableName,
    columns: [
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role_id", label: "Role", variant: "relation" },
      { key: "department_id", label: "Department", variant: "relation" },
      { key: "is_active", label: "Active", variant: "boolean" }
    ],
    fields: [
      { key: "full_name", label: "Full name", type: "text", required: true },
      { key: "email", label: "Email", type: "email", readOnly: true },
      { key: "job_title", label: "Job title", type: "text" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "role_id", label: "Role", type: "select", relation: roleRelation },
      {
        key: "department_id",
        label: "Department",
        type: "select",
        relation: departmentRelation
      },
      { key: "supplier_company", label: "Supplier company", type: "text" },
      { key: "is_active", label: "Active user", type: "checkbox" }
    ]
  },
  app_settings: {
    label: "App configuration",
    table: "app_settings" as TableName,
    columns: [
      { key: "setting_key", label: "Key" },
      { key: "updated_at", label: "Updated", variant: "date" }
    ],
    fields: [
      { key: "setting_key", label: "Setting key", type: "text", required: true },
      {
        key: "setting_value",
        label: "Setting value (JSON)",
        type: "textarea",
        required: true,
        placeholder: "{\"theme\":\"coastal\"}"
      }
    ]
  }
} as const;

export function getModuleConfig(slug: string) {
  return moduleConfigs[slug as ModuleSlug];
}

export function getLookupLabel(
  lookups: Record<string, LookupOption[]>,
  table: string,
  id?: string | null
) {
  if (!id) return "Unassigned";
  return lookups[table]?.find((option) => option.id === id)?.label ?? id;
}
