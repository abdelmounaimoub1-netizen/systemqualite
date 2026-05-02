import {
  Bell,
  BookCopy,
  Boxes,
  ClipboardCheck,
  ClipboardList,
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
  NavItem,
  SerializableModuleConfig
} from "@/types/app";
import type { ModuleSlug, TableName } from "@/types/database";

const profileRelation = { table: "profiles" as TableName, labelKey: "full_name" };
const roleRelation = { table: "roles" as TableName, labelKey: "name" };
const departmentRelation = { table: "departments" as TableName, labelKey: "name" };
const categoryRelation = { table: "document_categories" as TableName, labelKey: "name" };
const supplierRelation = { table: "suppliers" as TableName, labelKey: "name" };
const nonConformityRelation = {
  table: "non_conformities" as TableName,
  labelKey: "title"
};

const severityOptions = [
  { label: "Faible", value: "Low" },
  { label: "Moyen", value: "Medium" },
  { label: "Eleve", value: "High" },
  { label: "Critique", value: "Critical" }
];

const improvementStatusOptions = [
  { label: "Ouvert", value: "Open" },
  { label: "En cours", value: "In Progress" },
  { label: "Repondu", value: "Answered" },
  { label: "Clos", value: "Closed" }
];

const observationStatusOptions = [
  { label: "Ouvert", value: "Open" },
  { label: "Analyse", value: "Analyzed" },
  { label: "Action requise", value: "Action Required" },
  { label: "Clos", value: "Closed" }
];

const documentStatusOptions = [
  { label: "Brouillon", value: "Draft" },
  { label: "En validation", value: "Under Review" },
  { label: "Approuve", value: "Approved" },
  { label: "Archive", value: "Archived" }
];

const documentTypeOptions = [
  { label: "Procedure", value: "Procedure" },
  { label: "Processus", value: "Processus" },
  { label: "Politique", value: "Politique" },
  { label: "Formulaire", value: "Formulaire" },
  { label: "Instruction", value: "Instruction" },
  { label: "Enregistrement", value: "Enregistrement" },
  { label: "Document externe", value: "Externe" }
];

const processFamilyOptions = [
  { label: "Pilotage", value: "Pilotage" },
  { label: "Realisation", value: "Realisation" },
  { label: "Support", value: "Support" }
];

export const lookupSelectMap: Record<TableName, string> = {
  roles: "id,name,slug,description,created_at,updated_at,created_by",
  departments: "id,name,description,created_at,updated_at,created_by",
  document_categories: "id,name,description,created_at,updated_at,created_by",
  profiles:
    "id,email,full_name,job_title,phone,role_id,department_id,avatar_url,supplier_company,is_active,created_at,updated_at,created_by",
  documents:
    "id,document_code,title,summary,document_type,process_family,process_group,process_activity,confidentiality_level,category_id,owner_id,department_id,status,version_current,effective_date,review_date,review_frequency_months,validation_level,approval_mode,diffusion_scope,read_ack_required,archive_rule,retention_period_months,file_path,created_at,updated_at,created_by",
  document_versions:
    "id,document_id,version_number,status,change_summary,approval_date,file_path,created_at,updated_at,created_by",
  document_approvals:
    "id,document_id,step_order,approver_id,role_label,decision,due_date,signed_at,comment,created_at,updated_at,created_by",
  document_distributions:
    "id,document_id,recipient_id,recipient_group,channel,requires_ack,status,due_date,acknowledged_at,comment,created_at,updated_at,created_by",
  document_review_cycles:
    "id,document_id,reviewer_id,planned_review_date,status,conclusion,created_at,updated_at,created_by",
  document_suggestions:
    "id,document_id,suggested_by,suggestion,status,response,created_at,updated_at,created_by",
  document_consultations:
    "id,document_id,user_id,consulted_at,source,created_at,updated_at,created_by",
  forms:
    "id,code,name,description,process_area,owner_id,department_id,status,fields_schema,target_indicator,created_at,updated_at,created_by",
  form_entries:
    "id,form_id,record_code,title,submitted_by,workflow_state,due_date,content,created_at,updated_at,created_by",
  workflows:
    "id,title,description,status,due_date,responsible_user_id,approval_required,created_at,updated_at,created_by",
  workflow_steps:
    "id,workflow_id,step_name,description,responsible_user_id,due_date,status,approval_state,created_at,updated_at,created_by",
  non_conformities:
    "id,title,description,severity,source,department_id,status,responsible_user_id,root_cause,due_date,created_at,updated_at,created_by",
  capa_actions:
    "id,title,action_type,non_conformity_id,description,responsible_user_id,deadline,priority,status,effectiveness_check,created_at,updated_at,created_by",
  customer_complaints:
    "id,reference,affiliation,agent_id,declarant_name,customer_name,client_sector,client_typology,contact_name,contact_email,phone,country_city,distributor_channel,complaint_type,object_summary,complaint_category,origin,brand,product_reference,product_name,lot_number,production_date,expiry_date,purchase_delivery_date,quantity,description,immediate_actions,severity,status,received_date,due_date,responsible_user_id,orientation_recipient,information_recipients,orientation_decision,problem_origin,verification_recipient,closure_recipients,actions_effective,effectiveness_criteria,closure_date,estimated_cost_total,measurement_reason,measurement_deadline,ineffective_reason,response_summary,created_at,updated_at,created_by",
  customer_complaint_actions:
    "id,customer_complaint_id,pilot_id,action,deadline,completion_date,comment,progress_status,estimated_cost,attachment_path,created_at,updated_at,created_by",
  supplier_complaints:
    "id,reference,supplier_id,supplier_name,issue_type,description,severity,status,received_date,due_date,responsible_user_id,response_summary,created_at,updated_at,created_by",
  constats:
    "id,reference,title,description,process_area,department_id,severity,status,detected_date,responsible_user_id,action_summary,created_at,updated_at,created_by",
  complaints:
    "id,reference,complainant_name,channel,description,severity,status,received_date,due_date,responsible_user_id,response_summary,created_at,updated_at,created_by",
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
    description: `Suivre les notes de travail et les relances sur ${label.toLowerCase()}.`,
    table: "comments",
    parentField: "record_id",
    searchableFields: ["body"],
    fixedValues: {
      table_name: tableName
    },
    columns: [
      { key: "body", label: "Commentaire" },
      { key: "created_at", label: "Ajoute", variant: "date" }
    ],
    fields: [
      {
        key: "body",
        label: "Commentaire",
        type: "textarea",
        required: true,
        placeholder: "Ajouter une note, une relance ou un detail d'escalade."
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
    label: "Pieces jointes",
    description: `Importer les preuves et fichiers lies a ${label.toLowerCase()}.`,
    table: "attachments",
    parentField: "record_id",
    searchableFields: ["file_name", "note"],
    fixedValues: {
      table_name: tableName
    },
    columns: [
      { key: "file_name", label: "Fichier" },
      { key: "note", label: "Note" },
      { key: "created_at", label: "Importe", variant: "date" }
    ],
    fields: [
      {
        key: "file_name",
        label: "Nom du fichier",
        type: "text",
        required: true,
        placeholder: "Renseigne automatiquement a l'import."
      },
      {
        key: "file_path",
        label: "Chemin stockage",
        type: "text",
        required: true,
        placeholder: "Genere apres l'import."
      },
      {
        key: "mime_type",
        label: "Type MIME",
        type: "text",
        placeholder: "application/pdf"
      },
      {
        key: "file_size",
        label: "Taille fichier (octets)",
        type: "number"
      },
      {
        key: "note",
        label: "Note",
        type: "textarea",
        placeholder: "Contexte de cette piece jointe."
      }
    ],
    writeRoles
  };
}

export const moduleConfigs: Record<ModuleSlug, ModuleConfig> = {
  documents: {
    slug: "documents",
    label: "Documents GED",
    singular: "Document",
    icon: FileStack,
    table: "documents",
    description:
      "GED Qualios: creation, validation multi-niveaux, diffusion avec accuse, relecture et archivage.",
    accentClass: "from-brand/20 via-accent/10 to-transparent",
    searchableFields: [
      "title",
      "document_code",
      "summary",
      "process_family",
      "process_group",
      "process_activity"
    ],
    columns: [
      { key: "document_code", label: "Code" },
      { key: "title", label: "Titre" },
      { key: "process_family", label: "Processus" },
      { key: "category_id", label: "Categorie", variant: "relation" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "owner_id", label: "Pilote", variant: "relation" },
      { key: "review_date", label: "Date de revue", variant: "date" }
    ],
    fields: [
      {
        key: "document_code",
        label: "Code document",
        type: "text",
        section: "Creer la fiche documentaire",
        required: true,
        placeholder: "PR-LAB-001"
      },
      {
        key: "title",
        label: "Titre",
        type: "text",
        section: "Creer la fiche documentaire",
        required: true,
        placeholder: "Procedure gestion stocks et consommables"
      },
      {
        key: "summary",
        label: "Resume / objet",
        type: "textarea",
        section: "Creer la fiche documentaire",
        placeholder: "Objet, domaine d'application et remarques."
      },
      {
        key: "document_type",
        label: "Type documentaire",
        type: "select",
        section: "Creer la fiche documentaire",
        defaultValue: "Procedure",
        options: documentTypeOptions
      },
      {
        key: "category_id",
        label: "Categorie",
        type: "select",
        section: "Creer la fiche documentaire",
        relation: categoryRelation,
        required: true
      },
      {
        key: "owner_id",
        label: "Pilote / proprietaire",
        type: "select",
        section: "Creer la fiche documentaire",
        relation: profileRelation,
        required: true
      },
      {
        key: "department_id",
        label: "Departement",
        type: "select",
        section: "Creer la fiche documentaire",
        relation: departmentRelation
      },
      {
        key: "process_family",
        label: "Famille processus",
        type: "select",
        section: "Classer par processus",
        defaultValue: "Pilotage",
        options: processFamilyOptions,
        helperText: "Pilotage, Realisation ou Support comme dans le portail documentaire."
      },
      {
        key: "process_group",
        label: "Processus / chapitre",
        type: "text",
        section: "Classer par processus",
        placeholder: "Management de la qualite, Pre-Analytique, Gestion du personnel..."
      },
      {
        key: "process_activity",
        label: "Sous-processus / rubrique",
        type: "text",
        section: "Classer par processus",
        placeholder: "Analyse et suivi des indicateurs, Reception, Recrutement..."
      },
      {
        key: "confidentiality_level",
        label: "Niveau d'acces",
        type: "select",
        section: "Classer par processus",
        defaultValue: "Interne",
        options: [
          { label: "Public portail", value: "Public portail" },
          { label: "Interne", value: "Interne" },
          { label: "Confidentiel", value: "Confidentiel" },
          { label: "Fournisseur", value: "Fournisseur" }
        ]
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        section: "Valider et signer",
        required: true,
        defaultValue: "Draft",
        options: documentStatusOptions
      },
      {
        key: "version_current",
        label: "Version courante",
        type: "text",
        section: "Valider et signer",
        required: true,
        defaultValue: "1.0",
        placeholder: "1.0"
      },
      {
        key: "validation_level",
        label: "Nombre de niveaux de validation",
        type: "number",
        section: "Valider et signer",
        defaultValue: 2,
        min: 1,
        max: 5,
        helperText: "Les signataires sont geres ensuite dans le tableau Visa / signatures."
      },
      {
        key: "approval_mode",
        label: "Mode de signature",
        type: "select",
        section: "Valider et signer",
        defaultValue: "Sequential",
        options: [
          { label: "Sequentiel", value: "Sequential" },
          { label: "Parallele", value: "Parallel" }
        ]
      },
      {
        key: "effective_date",
        label: "Date d'application",
        type: "date",
        section: "Diffuser sur portail"
      },
      {
        key: "diffusion_scope",
        label: "Portail / population de diffusion",
        type: "text",
        section: "Diffuser sur portail",
        defaultValue: "Portail Qualite",
        placeholder: "Tous les utilisateurs, Laboratoire, Production, Fournisseurs..."
      },
      {
        key: "read_ack_required",
        label: "Accuse de reception obligatoire",
        type: "checkbox",
        section: "Diffuser sur portail",
        defaultValue: true
      },
      {
        key: "review_date",
        label: "Prochaine relecture",
        type: "date",
        section: "Reviser et archiver"
      },
      {
        key: "review_frequency_months",
        label: "Frequence de relecture (mois)",
        type: "number",
        section: "Reviser et archiver",
        defaultValue: 12,
        min: 1
      },
      {
        key: "archive_rule",
        label: "Regle d'archivage",
        type: "text",
        section: "Reviser et archiver",
        defaultValue: "Archivage automatique si nouvelle version"
      },
      {
        key: "retention_period_months",
        label: "Duree conservation archive (mois)",
        type: "number",
        section: "Reviser et archiver",
        defaultValue: 60,
        min: 1
      },
      {
        key: "file_path",
        label: "Fichier principal",
        type: "text",
        section: "Reviser et archiver",
        placeholder: "documents/primary/...",
        storageFolder: "documents/primary",
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      }
    ],
    detailFields: [
      "document_code",
      "title",
      "summary",
      "document_type",
      "process_family",
      "process_group",
      "process_activity",
      "status",
      "version_current",
      "effective_date",
      "review_date",
      "owner_id",
      "diffusion_scope",
      "read_ack_required",
      "archive_rule"
    ],
    emptyState: "Ajoute le premier document controle: procedure, processus, formulaire ou politique.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [
      {
        key: "document-versions",
        label: "Historique des versions",
        description: "Suivre les revisions, dates d'approbation et chemins des fichiers.",
        table: "document_versions",
        parentField: "document_id",
        searchableFields: ["version_number", "change_summary"],
        columns: [
          { key: "version_number", label: "Version" },
          { key: "status", label: "Statut", variant: "status" },
          { key: "approval_date", label: "Approbation", variant: "date" },
          { key: "change_summary", label: "Synthese changement" }
        ],
        fields: [
          {
            key: "version_number",
            label: "Numero de version",
            type: "text",
            required: true,
            placeholder: "1.1"
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            required: true,
            options: documentStatusOptions
          },
          {
            key: "approval_date",
            label: "Date d'approbation",
            type: "date"
          },
          {
            key: "file_path",
            label: "Fichier de version",
            type: "text",
            placeholder: "qms-files/documents/versions/...",
            storageFolder: "documents/versions",
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          },
          {
            key: "change_summary",
            label: "Synthese changement",
            type: "textarea",
            placeholder: "Expliquer la revision en une ou deux phrases."
          }
        ],
        writeRoles: ["admin", "quality_manager"]
      },
      {
        key: "document-approvals",
        label: "Visa / signatures",
        description: "Circuit de validation multi-niveaux avec delais, decision et commentaire.",
        table: "document_approvals",
        parentField: "document_id",
        searchableFields: ["role_label", "comment"],
        columns: [
          { key: "step_order", label: "Niveau", variant: "number" },
          { key: "approver_id", label: "Signataire", variant: "relation" },
          { key: "decision", label: "Decision", variant: "status" },
          { key: "due_date", label: "Echeance", variant: "date" },
          { key: "signed_at", label: "Signature", variant: "date" }
        ],
        fields: [
          {
            key: "step_order",
            label: "Niveau",
            type: "number",
            required: true,
            defaultValue: 1,
            min: 1
          },
          {
            key: "approver_id",
            label: "Signataire",
            type: "select",
            relation: profileRelation
          },
          {
            key: "role_label",
            label: "Role attendu",
            type: "text",
            placeholder: "Redacteur, Verificateur, Approbateur..."
          },
          {
            key: "decision",
            label: "Decision",
            type: "select",
            required: true,
            defaultValue: "Pending",
            options: [
              { label: "En attente", value: "Pending" },
              { label: "Approuve", value: "Approved" },
              { label: "Rejete", value: "Rejected" },
              { label: "Ignore", value: "Skipped" }
            ]
          },
          {
            key: "due_date",
            label: "Echeance signature",
            type: "date"
          },
          {
            key: "signed_at",
            label: "Date signature",
            type: "date"
          },
          {
            key: "comment",
            label: "Commentaire visa",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager"]
      },
      {
        key: "document-distributions",
        label: "Diffusion / accuse reception",
        description: "Destinataires portail, demandes d'accuse de reception et relances de lecture.",
        table: "document_distributions",
        parentField: "document_id",
        searchableFields: ["recipient_group", "channel", "comment"],
        columns: [
          { key: "recipient_group", label: "Groupe" },
          { key: "recipient_id", label: "Utilisateur", variant: "relation" },
          { key: "status", label: "Accuse", variant: "status" },
          { key: "due_date", label: "Echeance", variant: "date" },
          { key: "acknowledged_at", label: "Lu le", variant: "date" }
        ],
        fields: [
          {
            key: "recipient_group",
            label: "Groupe / service",
            type: "text",
            placeholder: "Tous les utilisateurs, Laboratoire, Support..."
          },
          {
            key: "recipient_id",
            label: "Utilisateur cible",
            type: "select",
            relation: profileRelation
          },
          {
            key: "channel",
            label: "Canal",
            type: "select",
            defaultValue: "Portail",
            options: [
              { label: "Portail", value: "Portail" },
              { label: "Email", value: "Email" },
              { label: "Extranet", value: "Extranet" }
            ]
          },
          {
            key: "requires_ack",
            label: "Accuse de reception demande",
            type: "checkbox",
            defaultValue: true
          },
          {
            key: "status",
            label: "Statut accuse",
            type: "select",
            required: true,
            defaultValue: "To Acknowledge",
            options: [
              { label: "A accuser", value: "To Acknowledge" },
              { label: "Accuse", value: "Acknowledged" },
              { label: "En retard", value: "Overdue" },
              { label: "Annule", value: "Cancelled" }
            ]
          },
          {
            key: "due_date",
            label: "Echeance lecture",
            type: "date"
          },
          {
            key: "acknowledged_at",
            label: "Date accuse",
            type: "date"
          },
          {
            key: "comment",
            label: "Commentaire diffusion",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager"]
      },
      {
        key: "document-review-cycles",
        label: "Relectures programmees",
        description: "Planifier les cycles de relecture et garder la conclusion de revision.",
        table: "document_review_cycles",
        parentField: "document_id",
        searchableFields: ["conclusion"],
        columns: [
          { key: "planned_review_date", label: "Date prevue", variant: "date" },
          { key: "reviewer_id", label: "Relecteur", variant: "relation" },
          { key: "status", label: "Statut", variant: "status" },
          { key: "conclusion", label: "Conclusion" }
        ],
        fields: [
          {
            key: "reviewer_id",
            label: "Relecteur",
            type: "select",
            relation: profileRelation
          },
          {
            key: "planned_review_date",
            label: "Date de relecture",
            type: "date",
            required: true
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            required: true,
            defaultValue: "Planned",
            options: [
              { label: "Planifiee", value: "Planned" },
              { label: "En relecture", value: "In Review" },
              { label: "Terminee", value: "Completed" },
              { label: "En retard", value: "Late" }
            ]
          },
          {
            key: "conclusion",
            label: "Conclusion",
            type: "textarea",
            placeholder: "A reconduire, a reviser, a archiver..."
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      {
        key: "document-suggestions",
        label: "Suggestions d'amelioration",
        description: "Canal Qualios pour proposer une modification ou une nouvelle version.",
        table: "document_suggestions",
        parentField: "document_id",
        searchableFields: ["suggestion", "response"],
        columns: [
          { key: "suggested_by", label: "Auteur", variant: "relation" },
          { key: "suggestion", label: "Suggestion" },
          { key: "status", label: "Statut", variant: "status" },
          { key: "response", label: "Reponse" }
        ],
        fields: [
          {
            key: "suggested_by",
            label: "Auteur",
            type: "select",
            relation: profileRelation
          },
          {
            key: "suggestion",
            label: "Suggestion",
            type: "textarea",
            required: true,
            placeholder: "Proposer une correction, simplification ou revision."
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            required: true,
            defaultValue: "Open",
            options: [
              { label: "Ouverte", value: "Open" },
              { label: "Acceptee", value: "Accepted" },
              { label: "Rejetee", value: "Rejected" },
              { label: "Convertie en revision", value: "Converted" }
            ]
          },
          {
            key: "response",
            label: "Reponse pilote",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor", "employee"]
      },
      {
        key: "document-consultations",
        label: "Statistiques consultation",
        description: "Historique de consultation pour suivre les documents lus et peu lus.",
        table: "document_consultations",
        parentField: "document_id",
        searchableFields: ["source"],
        columns: [
          { key: "user_id", label: "Utilisateur", variant: "relation" },
          { key: "consulted_at", label: "Consultation", variant: "date" },
          { key: "source", label: "Source" }
        ],
        fields: [
          {
            key: "user_id",
            label: "Utilisateur",
            type: "select",
            relation: profileRelation
          },
          {
            key: "consulted_at",
            label: "Date consultation",
            type: "date"
          },
          {
            key: "source",
            label: "Source",
            type: "text",
            defaultValue: "Portail documentaire"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      attachmentModule("Documents", "documents", ["admin", "quality_manager"]),
      commentModule("Documents", "documents", ["admin", "quality_manager", "auditor"])
    ]
  },
  forms: {
    slug: "forms",
    label: "Formulaires",
    singular: "Formulaire",
    icon: ClipboardList,
    table: "forms",
    description:
      "Modeles de formulaires qualite avec champs, proprietaire, indicateur cible et circuit de suivi.",
    accentClass: "from-accent/20 via-brand/10 to-transparent",
    searchableFields: ["code", "name", "description", "process_area", "target_indicator"],
    columns: [
      { key: "code", label: "Code" },
      { key: "name", label: "Formulaire" },
      { key: "process_area", label: "Processus" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "owner_id", label: "Pilote", variant: "relation" },
      { key: "target_indicator", label: "Indicateur" }
    ],
    fields: [
      {
        key: "code",
        label: "Code formulaire",
        type: "text",
        required: true,
        placeholder: "FRM-NC-001"
      },
      {
        key: "name",
        label: "Nom du formulaire",
        type: "text",
        required: true,
        placeholder: "Fiche de non-conformite"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Objectif, contexte et donnees attendues."
      },
      {
        key: "process_area",
        label: "Processus",
        type: "text",
        placeholder: "Qualite, achats, production, RH..."
      },
      {
        key: "owner_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "department_id",
        label: "Service",
        type: "select",
        relation: departmentRelation
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: [
          { label: "Brouillon", value: "Draft" },
          { label: "Actif", value: "Active" },
          { label: "Archive", value: "Archived" }
        ]
      },
      {
        key: "fields_schema",
        label: "Champs du formulaire",
        type: "textarea",
        placeholder:
          "Ex: Date, processus concerne, description, causes, action immediate, pieces jointes..."
      },
      {
        key: "target_indicator",
        label: "Indicateur cible",
        type: "text",
        placeholder: "Taux de cloture, delai moyen, nombre de NC..."
      }
    ],
    detailFields: [
      "code",
      "name",
      "description",
      "process_area",
      "status",
      "owner_id",
      "target_indicator"
    ],
    emptyState:
      "Creez votre premier formulaire pour suivre une non-conformite, une reclamation ou une action d'amelioration.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [
      {
        key: "form-entries",
        label: "Enregistrements",
        description: "Saisies et demandes rattachees a ce modele de formulaire.",
        table: "form_entries",
        parentField: "form_id",
        searchableFields: ["record_code", "title", "content"],
        columns: [
          { key: "record_code", label: "Reference" },
          { key: "title", label: "Objet" },
          { key: "workflow_state", label: "Etat", variant: "status" },
          { key: "due_date", label: "Echeance", variant: "date" },
          { key: "submitted_by", label: "Demandeur", variant: "relation" }
        ],
        fields: [
          {
            key: "record_code",
            label: "Reference",
            type: "text",
            required: true,
            placeholder: "NC-2026-004"
          },
          {
            key: "title",
            label: "Objet",
            type: "text",
            required: true,
            placeholder: "Incident detecte en production"
          },
          {
            key: "submitted_by",
            label: "Demandeur",
            type: "select",
            relation: profileRelation
          },
          {
            key: "workflow_state",
            label: "Etat workflow",
            type: "select",
            required: true,
            options: [
              { label: "Brouillon", value: "Draft" },
              { label: "Soumis", value: "Submitted" },
              { label: "En revue", value: "In Review" },
              { label: "Approuve", value: "Approved" },
              { label: "Rejete", value: "Rejected" }
            ]
          },
          {
            key: "due_date",
            label: "Echeance",
            type: "date"
          },
          {
            key: "content",
            label: "Contenu saisi",
            type: "textarea",
            placeholder: "Donnees principales, constats, pieces attendues, commentaires..."
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor", "employee"]
      },
      commentModule("Formulaires", "forms", ["admin", "quality_manager", "auditor", "employee"])
    ]
  },
  workflows: {
    slug: "workflows",
    label: "Circuits",
    singular: "Workflow",
    icon: Sparkles,
    table: "workflows",
    description: "Circuits de revue et d'approbation avec echeances et responsabilites.",
    accentClass: "from-accent/20 via-sun/10 to-transparent",
    searchableFields: ["title", "description"],
    columns: [
      { key: "title", label: "Circuit" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "due_date", label: "Echeance", variant: "date" },
      { key: "responsible_user_id", label: "Responsable", variant: "relation" },
      { key: "approval_required", label: "Approbation", variant: "boolean" }
    ],
    fields: [
      {
        key: "title",
        label: "Nom du circuit",
        type: "text",
        required: true,
        placeholder: "Validation onboarding fournisseur"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Decrire le deroulement du circuit de revue."
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: [
          { label: "Brouillon", value: "Draft" },
          { label: "En cours", value: "In Progress" },
          { label: "En attente approbation", value: "Awaiting Approval" },
          { label: "Approuve", value: "Approved" },
          { label: "Rejete", value: "Rejected" },
          { label: "Termine", value: "Completed" }
        ]
      },
      {
        key: "due_date",
        label: "Echeance",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Responsable",
        type: "select",
        relation: profileRelation
      },
      {
        key: "approval_required",
        label: "Approbation requise",
        type: "checkbox"
      }
    ],
    detailFields: ["title", "description", "status", "due_date", "responsible_user_id"],
    emptyState: "Cartographiez les circuits recurrents pour clarifier la suite des actions.",
    writeRoles: ["admin", "quality_manager", "employee"],
    childModules: [
      {
        key: "workflow-steps",
        label: "Etapes du circuit",
        description: "Affecter les responsables et echeances de chaque etape.",
        table: "workflow_steps",
        parentField: "workflow_id",
        searchableFields: ["step_name", "description"],
        columns: [
          { key: "step_name", label: "Etape" },
          { key: "responsible_user_id", label: "Pilote", variant: "relation" },
          { key: "due_date", label: "Echeance", variant: "date" },
          { key: "status", label: "Statut", variant: "status" }
        ],
        fields: [
          {
            key: "step_name",
            label: "Nom de l'etape",
            type: "text",
            required: true,
            placeholder: "Revue responsable"
          },
          {
            key: "description",
            label: "Description",
            type: "textarea"
          },
          {
            key: "responsible_user_id",
            label: "Responsable",
            type: "select",
            relation: profileRelation
          },
          {
            key: "due_date",
            label: "Echeance",
            type: "date"
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            options: [
              { label: "Brouillon", value: "Draft" },
              { label: "En cours", value: "In Progress" },
              { label: "En attente approbation", value: "Awaiting Approval" },
              { label: "Approuve", value: "Approved" },
              { label: "Rejete", value: "Rejected" },
              { label: "Termine", value: "Completed" }
            ]
          },
          {
            key: "approval_state",
            label: "Etat d'approbation",
            type: "select",
            options: [
              { label: "En attente", value: "Pending" },
              { label: "Approuve", value: "Approved" },
              { label: "Rejete", value: "Rejected" }
            ]
          }
        ],
        writeRoles: ["admin", "quality_manager", "employee"]
      },
      commentModule("Workflows", "workflows", ["admin", "quality_manager", "employee"])
    ]
  },
  "customer-complaints": {
    slug: "customer-complaints",
    label: "Reclamations client",
    singular: "Reclamation client",
    icon: Bell,
    table: "customer_complaints",
    description:
      "Enregistrer, suivre et historiser les reclamations client jusqu'a la reponse et la cloture.",
    accentClass: "from-sun/25 via-accent/10 to-transparent",
    searchableFields: ["reference", "customer_name", "product_reference", "description"],
    columns: [
      { key: "reference", label: "Reference" },
      { key: "customer_name", label: "Client" },
      { key: "severity", label: "Criticite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "due_date", label: "Echeance", variant: "date" },
      { key: "responsible_user_id", label: "Pilote", variant: "relation" }
    ],
    fields: [
      {
        key: "reference",
        label: "Reference",
        type: "text",
        required: true,
        placeholder: "RC-2026-001"
      },
      {
        key: "affiliation",
        label: "Affiliation",
        type: "text",
        placeholder: "RCC-000018"
      },
      {
        key: "agent_id",
        label: "Agent",
        type: "select",
        relation: profileRelation
      },
      {
        key: "declarant_name",
        label: "Declarant",
        type: "text",
        placeholder: "Personne ayant declare la reclamation"
      },
      {
        key: "customer_name",
        label: "Client",
        type: "text",
        required: true,
        placeholder: "Nom du client"
      },
      {
        key: "client_sector",
        label: "Secteur",
        type: "text",
        placeholder: "GMS, distribution, industriel..."
      },
      {
        key: "client_typology",
        label: "Typologie client",
        type: "text",
        placeholder: "Direct, distributeur, export..."
      },
      {
        key: "contact_name",
        label: "Contact",
        type: "text"
      },
      {
        key: "contact_email",
        label: "Email contact",
        type: "email",
        placeholder: "qualite@client.example"
      },
      {
        key: "phone",
        label: "Tel",
        type: "tel"
      },
      {
        key: "country_city",
        label: "Pays / Ville",
        type: "text"
      },
      {
        key: "distributor_channel",
        label: "Canal distributeur",
        type: "text"
      },
      {
        key: "complaint_type",
        label: "Type de reclamation",
        type: "select",
        required: true,
        options: [
          { label: "Produit", value: "Produit" },
          { label: "Service", value: "Service" },
          { label: "Autre", value: "Autre" }
        ]
      },
      {
        key: "object_summary",
        label: "Objet",
        type: "text",
        placeholder: "Objet de la reclamation"
      },
      {
        key: "complaint_category",
        label: "Categorie de RC",
        type: "text"
      },
      {
        key: "origin",
        label: "Origine",
        type: "text"
      },
      {
        key: "brand",
        label: "Marque produit",
        type: "text"
      },
      {
        key: "product_reference",
        label: "Reference produit",
        type: "text",
        placeholder: "Produit, lot, commande..."
      },
      {
        key: "product_name",
        label: "Produit concerne",
        type: "text"
      },
      {
        key: "lot_number",
        label: "Numero du lot",
        type: "text"
      },
      {
        key: "production_date",
        label: "Date de production",
        type: "date"
      },
      {
        key: "expiry_date",
        label: "Date d'expiration",
        type: "date"
      },
      {
        key: "purchase_delivery_date",
        label: "Date achat/livraison",
        type: "date"
      },
      {
        key: "quantity",
        label: "Quantite",
        type: "number",
        min: 0
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Motif de la reclamation, impact client, pieces recues..."
      },
      {
        key: "immediate_actions",
        label: "Actions immediates",
        type: "textarea"
      },
      {
        key: "severity",
        label: "Criticite",
        type: "select",
        required: true,
        options: severityOptions
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: improvementStatusOptions
      },
      {
        key: "received_date",
        label: "Date reception",
        type: "date"
      },
      {
        key: "due_date",
        label: "Echeance reponse",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "orientation_recipient",
        label: "Destinataire pour traitement",
        type: "text"
      },
      {
        key: "information_recipients",
        label: "Destinataires pour information",
        type: "text"
      },
      {
        key: "orientation_decision",
        label: "Decision orientation",
        type: "select",
        options: [
          { label: "Traiter", value: "Traiter" },
          { label: "Modifier", value: "Modifier" },
          { label: "Cloturer", value: "Cloturer" }
        ]
      },
      {
        key: "problem_origin",
        label: "Origine du probleme",
        type: "textarea"
      },
      {
        key: "verification_recipient",
        label: "Destinataire pour verification et cloture",
        type: "text"
      },
      {
        key: "closure_recipients",
        label: "Destinataires pour information cloture",
        type: "text"
      },
      {
        key: "actions_effective",
        label: "Actions efficaces",
        type: "select",
        options: [
          { label: "Oui", value: "Oui" },
          { label: "Non", value: "Non" },
          { label: "A mesurer", value: "A mesurer" }
        ]
      },
      {
        key: "effectiveness_criteria",
        label: "Criteres d'efficacite",
        type: "textarea"
      },
      {
        key: "closure_date",
        label: "Date de cloture",
        type: "date"
      },
      {
        key: "estimated_cost_total",
        label: "Cout total estime",
        type: "number",
        min: 0
      },
      {
        key: "measurement_reason",
        label: "Motif a mesurer",
        type: "textarea"
      },
      {
        key: "measurement_deadline",
        label: "Echeance mesure",
        type: "date"
      },
      {
        key: "ineffective_reason",
        label: "Motif actions non efficaces",
        type: "textarea"
      },
      {
        key: "response_summary",
        label: "Reponse / conclusion",
        type: "textarea",
        placeholder: "Synthese de l'analyse, reponse client, decision de cloture."
      }
    ],
    detailFields: [
      "reference",
      "customer_name",
      "product_reference",
      "severity",
      "status",
      "due_date",
      "responsible_user_id",
      "response_summary"
    ],
    emptyState: "Creez la premiere reclamation client pour suivre son analyse et sa reponse.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      {
        key: "customer-complaint-actions",
        label: "Plan d'actions",
        description: "Actions de traitement, delais, couts estimes et verification d'avancement.",
        table: "customer_complaint_actions",
        parentField: "customer_complaint_id",
        searchableFields: ["action", "comment"],
        columns: [
          { key: "pilot_id", label: "Pilote", variant: "relation" },
          { key: "action", label: "Action" },
          { key: "deadline", label: "Echeance", variant: "date" },
          { key: "completion_date", label: "Date realisation", variant: "date" },
          { key: "comment", label: "Commentaire" },
          { key: "progress_status", label: "% Avancement", variant: "status" }
        ],
        fields: [
          {
            key: "pilot_id",
            label: "Pilote",
            type: "select",
            relation: profileRelation
          },
          {
            key: "action",
            label: "Action",
            type: "textarea",
            required: true,
            placeholder: "Action a realiser"
          },
          {
            key: "deadline",
            label: "Echeance",
            type: "date"
          },
          {
            key: "completion_date",
            label: "Date realisation",
            type: "date"
          },
          {
            key: "comment",
            label: "Commentaire",
            type: "textarea"
          },
          {
            key: "progress_status",
            label: "Avancement",
            type: "select",
            required: true,
            options: [
              { label: "Ouvert", value: "Open" },
              { label: "En cours", value: "In Progress" },
              { label: "Realise", value: "Done" },
              { label: "Inefficace", value: "Ineffective" }
            ]
          },
          {
            key: "estimated_cost",
            label: "Cout estime",
            type: "number",
            min: 0
          },
          {
            key: "attachment_path",
            label: "Piece jointe",
            type: "text",
            placeholder: "qms-files/customer-complaints/actions/...",
            storageFolder: "customer-complaints/actions",
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor", "employee"]
      },
      attachmentModule("Reclamations client", "customer_complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Reclamations client", "customer_complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  "supplier-complaints": {
    slug: "supplier-complaints",
    label: "Reclamations fournisseur",
    singular: "Reclamation fournisseur",
    icon: UsersRound,
    table: "supplier_complaints",
    description:
      "Piloter les ecarts fournisseur, demandes de reponse, preuves et historique qualite.",
    accentClass: "from-sun/25 via-brand/10 to-transparent",
    searchableFields: ["reference", "supplier_name", "issue_type", "description"],
    columns: [
      { key: "reference", label: "Reference" },
      { key: "supplier_id", label: "Fournisseur", variant: "relation" },
      { key: "issue_type", label: "Type" },
      { key: "severity", label: "Criticite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "due_date", label: "Echeance", variant: "date" }
    ],
    fields: [
      {
        key: "reference",
        label: "Reference",
        type: "text",
        required: true,
        placeholder: "RF-2026-001"
      },
      {
        key: "supplier_id",
        label: "Fournisseur",
        type: "select",
        relation: supplierRelation
      },
      {
        key: "supplier_name",
        label: "Fournisseur libre",
        type: "text",
        placeholder: "Nom si fournisseur non reference"
      },
      {
        key: "issue_type",
        label: "Type d'ecart",
        type: "text",
        placeholder: "Retard, certificat, qualite produit..."
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Detail du probleme, lot, commande, preuves attendues..."
      },
      {
        key: "severity",
        label: "Criticite",
        type: "select",
        required: true,
        options: severityOptions
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: improvementStatusOptions
      },
      {
        key: "received_date",
        label: "Date reception",
        type: "date"
      },
      {
        key: "due_date",
        label: "Echeance reponse",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "response_summary",
        label: "Reponse / conclusion",
        type: "textarea"
      }
    ],
    detailFields: [
      "reference",
      "supplier_id",
      "supplier_name",
      "issue_type",
      "severity",
      "status",
      "due_date",
      "responsible_user_id"
    ],
    emptyState: "Ajoutez une reclamation fournisseur pour suivre les relances et les preuves.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      attachmentModule("Reclamations fournisseur", "supplier_complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Reclamations fournisseur", "supplier_complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  "non-conformities": {
    slug: "non-conformities",
    label: "Non-conformites Produit",
    singular: "Non-conformite",
    icon: ShieldAlert,
    table: "non_conformities",
    description: "Declarer les non-conformites produit, analyser la cause et piloter la cloture.",
    accentClass: "from-sun/25 via-accent/10 to-transparent",
    searchableFields: ["title", "description", "source", "root_cause"],
    columns: [
      { key: "title", label: "Ecart" },
      { key: "severity", label: "Criticite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "department_id", label: "Departement", variant: "relation" },
      { key: "responsible_user_id", label: "Responsable", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre",
        type: "text",
        required: true,
        placeholder: "Releve temperature non complete"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Decrire les faits constates."
      },
      {
        key: "severity",
        label: "Criticite",
        type: "select",
        required: true,
        options: [
          { label: "Faible", value: "Low" },
          { label: "Moyen", value: "Medium" },
          { label: "Eleve", value: "High" },
          { label: "Critique", value: "Critical" }
        ]
      },
      {
        key: "source",
        label: "Source",
        type: "text",
        placeholder: "Audit, reclamation, revue interne..."
      },
      {
        key: "department_id",
        label: "Departement",
        type: "select",
        relation: departmentRelation
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: [
          { label: "Ouvert", value: "Open" },
          { label: "En cours", value: "In Progress" },
          { label: "Clos", value: "Closed" }
        ]
      },
      {
        key: "responsible_user_id",
        label: "Responsable",
        type: "select",
        relation: profileRelation
      },
      {
        key: "root_cause",
        label: "Cause racine",
        type: "textarea"
      },
      {
        key: "due_date",
        label: "Date cible de cloture",
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
    emptyState: "Declarez le premier ecart pour centraliser le suivi CAPA et audit.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      {
        key: "linked-capa",
        label: "Actions CAPA liees",
        description: "Actions correctives et preventives directement liees a cet ecart.",
        table: "capa_actions",
        parentField: "non_conformity_id",
        searchableFields: ["title", "description", "effectiveness_check"],
        columns: [
          { key: "title", label: "Action" },
          { key: "action_type", label: "Type" },
          { key: "priority", label: "Priorite", variant: "status" },
          { key: "status", label: "Statut", variant: "status" },
          { key: "deadline", label: "Echeance", variant: "date" }
        ],
        fields: [
          {
            key: "title",
            label: "Titre de l'action",
            type: "text",
            required: true
          },
          {
            key: "action_type",
            label: "Type d'action",
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
            label: "Responsable",
            type: "select",
            relation: profileRelation
          },
          {
            key: "deadline",
            label: "Echeance",
            type: "date"
          },
          {
            key: "priority",
            label: "Priorite",
            type: "select",
            options: [
              { label: "Faible", value: "Low" },
              { label: "Moyen", value: "Medium" },
              { label: "Eleve", value: "High" },
              { label: "Critique", value: "Critical" }
            ]
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            options: [
              { label: "Ouvert", value: "Open" },
              { label: "En cours", value: "In Progress" },
              { label: "Verification", value: "Verification" },
              { label: "Clos", value: "Closed" }
            ]
          },
          {
            key: "effectiveness_check",
            label: "Verification d'efficacite",
            type: "textarea"
          }
        ],
        writeRoles: ["admin", "quality_manager", "auditor"]
      },
      attachmentModule("Non-conformites", "non_conformities", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Non-conformites", "non_conformities", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  constats: {
    slug: "constats",
    label: "Constats",
    singular: "Constat",
    icon: ClipboardCheck,
    table: "constats",
    description:
      "Tracer les constats terrain ou audit, leur analyse et les actions attendues.",
    accentClass: "from-brand/20 via-accent/10 to-transparent",
    searchableFields: ["reference", "title", "description", "process_area", "action_summary"],
    columns: [
      { key: "reference", label: "Reference" },
      { key: "title", label: "Constat" },
      { key: "process_area", label: "Processus" },
      { key: "severity", label: "Criticite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "responsible_user_id", label: "Pilote", variant: "relation" }
    ],
    fields: [
      {
        key: "reference",
        label: "Reference",
        type: "text",
        required: true,
        placeholder: "CST-2026-001"
      },
      {
        key: "title",
        label: "Titre",
        type: "text",
        required: true,
        placeholder: "Constat observe"
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Description factuelle du constat."
      },
      {
        key: "process_area",
        label: "Processus",
        type: "text",
        placeholder: "Achats, production, commercial..."
      },
      {
        key: "department_id",
        label: "Service",
        type: "select",
        relation: departmentRelation
      },
      {
        key: "severity",
        label: "Criticite",
        type: "select",
        required: true,
        options: severityOptions
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: observationStatusOptions
      },
      {
        key: "detected_date",
        label: "Date detection",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "action_summary",
        label: "Analyse / action attendue",
        type: "textarea"
      }
    ],
    detailFields: [
      "reference",
      "title",
      "process_area",
      "department_id",
      "severity",
      "status",
      "responsible_user_id",
      "action_summary"
    ],
    emptyState: "Creez un constat pour transformer une observation en action suivie.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      attachmentModule("Constats", "constats", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Constats", "constats", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  complaints: {
    slug: "complaints",
    label: "Plaintes",
    singular: "Plainte",
    icon: ShieldAlert,
    table: "complaints",
    description:
      "Centraliser les plaintes internes ou externes avec traitement, reponse et preuves.",
    accentClass: "from-sun/25 via-brand/10 to-transparent",
    searchableFields: ["reference", "complainant_name", "channel", "description"],
    columns: [
      { key: "reference", label: "Reference" },
      { key: "complainant_name", label: "Emetteur" },
      { key: "channel", label: "Canal" },
      { key: "severity", label: "Criticite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "due_date", label: "Echeance", variant: "date" }
    ],
    fields: [
      {
        key: "reference",
        label: "Reference",
        type: "text",
        required: true,
        placeholder: "PL-2026-001"
      },
      {
        key: "complainant_name",
        label: "Emetteur",
        type: "text",
        required: true,
        placeholder: "Nom, service ou organisation"
      },
      {
        key: "channel",
        label: "Canal",
        type: "select",
        options: [
          { label: "Email", value: "Email" },
          { label: "Telephone", value: "Telephone" },
          { label: "Portail", value: "Portail" },
          { label: "Interne", value: "Interne" }
        ]
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true
      },
      {
        key: "severity",
        label: "Criticite",
        type: "select",
        required: true,
        options: severityOptions
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: improvementStatusOptions
      },
      {
        key: "received_date",
        label: "Date reception",
        type: "date"
      },
      {
        key: "due_date",
        label: "Echeance",
        type: "date"
      },
      {
        key: "responsible_user_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "response_summary",
        label: "Reponse / conclusion",
        type: "textarea"
      }
    ],
    detailFields: [
      "reference",
      "complainant_name",
      "channel",
      "severity",
      "status",
      "due_date",
      "responsible_user_id",
      "response_summary"
    ],
    emptyState: "Ajoutez une plainte pour suivre son traitement jusqu'a la cloture.",
    writeRoles: ["admin", "quality_manager", "auditor", "employee"],
    childModules: [
      attachmentModule("Plaintes", "complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ]),
      commentModule("Plaintes", "complaints", [
        "admin",
        "quality_manager",
        "auditor",
        "employee"
      ])
    ]
  },
  "capa-actions": {
    slug: "capa-actions",
    label: "Actions correctives",
    singular: "Action corrective",
    icon: ShieldCheck,
    table: "capa_actions",
    description: "Gerer les actions correctives et preventives jusqu'a la verification d'efficacite.",
    accentClass: "from-sun/25 via-accent/10 to-transparent",
    searchableFields: ["title", "description", "effectiveness_check"],
    columns: [
      { key: "title", label: "Action" },
      { key: "action_type", label: "Type" },
      { key: "priority", label: "Priorite", variant: "status" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "deadline", label: "Echeance", variant: "date" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre de l'action",
        type: "text",
        required: true
      },
      {
        key: "action_type",
        label: "Type d'action",
        type: "select",
        required: true,
        options: [
          { label: "Corrective", value: "Corrective" },
          { label: "Preventive", value: "Preventive" }
        ]
      },
      {
        key: "non_conformity_id",
        label: "Non-conformite liee",
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
        label: "Responsable",
        type: "select",
        relation: profileRelation
      },
      {
        key: "deadline",
        label: "Echeance",
        type: "date"
      },
      {
        key: "priority",
        label: "Priorite",
        type: "select",
        options: [
          { label: "Faible", value: "Low" },
          { label: "Moyen", value: "Medium" },
          { label: "Eleve", value: "High" },
          { label: "Critique", value: "Critical" }
        ]
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Ouvert", value: "Open" },
          { label: "En cours", value: "In Progress" },
          { label: "Verification", value: "Verification" },
          { label: "Clos", value: "Closed" }
        ]
      },
      {
        key: "effectiveness_check",
        label: "Verification d'efficacite",
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
    emptyState: "Creez les actions qui cloturent un ecart ou une revue preventive.",
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
    description: "Planifier les audits, saisir les constats et garder le suivi visible.",
    accentClass: "from-brand/20 via-accent/10 to-transparent",
    searchableFields: ["title", "scope"],
    columns: [
      { key: "title", label: "Audit" },
      { key: "audit_type", label: "Type" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "planned_date", label: "Planifie", variant: "date" },
      { key: "auditor_id", label: "Auditeur", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre audit",
        type: "text",
        required: true,
        placeholder: "Audit interne BPF - conditionnement"
      },
      {
        key: "audit_type",
        label: "Type audit",
        type: "select",
        required: true,
        options: [
          { label: "Interne", value: "Internal" },
          { label: "Externe", value: "External" }
        ]
      },
      {
        key: "scope",
        label: "Perimetre",
        type: "textarea"
      },
      {
        key: "auditor_id",
        label: "Auditeur affecte",
        type: "select",
        relation: profileRelation
      },
      {
        key: "planned_date",
        label: "Date planifiee",
        type: "date"
      },
      {
        key: "follow_up_date",
        label: "Date de suivi",
        type: "date"
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Planifie", value: "Planned" },
          { label: "En cours", value: "In Progress" },
          { label: "Termine", value: "Completed" },
          { label: "Clos", value: "Closed" }
        ],
        required: true
      },
      {
        key: "report_path",
        label: "Rapport",
        type: "text",
        placeholder: "qms-files/audits/reports/...",
        storageFolder: "audits/reports",
        accept: ".pdf,.doc,.docx"
      }
    ],
    detailFields: ["title", "audit_type", "scope", "status", "planned_date", "auditor_id"],
    emptyState: "Planifiez le prochain audit pour sortir les constats et suivis des emails.",
    writeRoles: ["admin", "quality_manager", "auditor"],
    childModules: [
      {
        key: "audit-checklist",
        label: "Checklist",
        description: "Construire et renseigner la grille de questions audit.",
        table: "audit_checklists",
        parentField: "audit_id",
        searchableFields: ["item_text", "notes"],
        columns: [
          { key: "item_text", label: "Point de controle" },
          { key: "response_status", label: "Reponse", variant: "status" },
          { key: "is_required", label: "Obligatoire", variant: "boolean" }
        ],
        fields: [
          {
            key: "item_text",
            label: "Point de controle",
            type: "textarea",
            required: true
          },
          {
            key: "is_required",
            label: "Point obligatoire",
            type: "checkbox"
          },
          {
            key: "response_status",
            label: "Reponse",
            type: "select",
            options: [
              { label: "En attente", value: "Pending" },
              { label: "Conforme", value: "Pass" },
              { label: "Non conforme", value: "Fail" },
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
        label: "Constats audit",
        description: "Saisir les constats necessitant action corrective ou preuve de cloture.",
        table: "audit_findings",
        parentField: "audit_id",
        searchableFields: ["title", "description"],
        columns: [
          { key: "title", label: "Constat" },
          { key: "severity", label: "Criticite", variant: "status" },
          { key: "status", label: "Statut", variant: "status" },
          { key: "owner_id", label: "Pilote", variant: "relation" }
        ],
        fields: [
          {
            key: "title",
            label: "Titre du constat",
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
            label: "Criticite",
            type: "select",
            options: [
              { label: "Mineur", value: "Minor" },
              { label: "Majeur", value: "Major" },
              { label: "Critique", value: "Critical" }
            ]
          },
          {
            key: "owner_id",
            label: "Pilote",
            type: "select",
            relation: profileRelation
          },
          {
            key: "status",
            label: "Statut",
            type: "select",
            options: [
              { label: "Ouvert", value: "Open" },
              { label: "Action planifiee", value: "Action Planned" },
              { label: "Clos", value: "Closed" }
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
    label: "Risques",
    singular: "Risque",
    icon: Gauge,
    table: "risks",
    description: "Evaluer les risques de facon homogene et rendre les plans de maitrise visibles.",
    accentClass: "from-sun/25 via-brand/10 to-transparent",
    searchableFields: ["title", "description", "mitigation_plan"],
    columns: [
      { key: "title", label: "Risque" },
      { key: "probability", label: "Probabilite", variant: "number" },
      { key: "impact", label: "Impact", variant: "number" },
      { key: "risk_level", label: "Niveau", variant: "status" },
      { key: "review_date", label: "Revue", variant: "date" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre du risque",
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
        label: "Probabilite (1-5)",
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
        label: "Plan de maitrise",
        type: "textarea"
      },
      {
        key: "owner_id",
        label: "Pilote",
        type: "select",
        relation: profileRelation
      },
      {
        key: "review_date",
        label: "Date de revue",
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
    emptyState: "Demarrez le registre avec le risque operationnel ou conformite le plus significatif.",
    writeRoles: ["admin", "quality_manager", "auditor"],
    childModules: [commentModule("Risques", "risks", ["admin", "quality_manager", "auditor"])]
  },
  trainings: {
    slug: "trainings",
    label: "Formations",
    singular: "Formation",
    icon: BookCopy,
    table: "trainings",
    description: "Suivre les competences, affectations, preuves de certificat et expirations.",
    accentClass: "from-brand/20 via-accent/10 to-transparent",
    searchableFields: ["title", "role_required", "notes"],
    columns: [
      { key: "title", label: "Formation" },
      { key: "employee_id", label: "Collaborateur", variant: "relation" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "expiry_date", label: "Expiration", variant: "date" },
      { key: "role_required", label: "Role requis" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre de formation",
        type: "text",
        required: true
      },
      {
        key: "employee_id",
        label: "Collaborateur",
        type: "select",
        relation: profileRelation
      },
      {
        key: "role_required",
        label: "Requis par role",
        type: "text",
        placeholder: "Operateur, auditeur, superviseur..."
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Planifie", value: "Planned" },
          { label: "En cours", value: "In Progress" },
          { label: "Termine", value: "Completed" },
          { label: "Expire", value: "Expired" }
        ],
        required: true
      },
      {
        key: "expiry_date",
        label: "Date d'expiration",
        type: "date"
      },
      {
        key: "certificate_path",
        label: "Certificat",
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
    emptyState: "Ajoutez les formations requises pour sortir competences et expirations des tableurs.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [attachmentModule("Formations", "trainings", ["admin", "quality_manager"])]
  },
  equipment: {
    slug: "equipment",
    label: "Equipements",
    singular: "Equipement",
    icon: Wrench,
    table: "equipment",
    description: "Garder maintenance, etalonnage et statut visibles au meme endroit.",
    accentClass: "from-brand/15 via-accent/10 to-transparent",
    searchableFields: ["name", "serial_number", "location", "notes"],
    columns: [
      { key: "name", label: "Equipement" },
      { key: "serial_number", label: "N serie" },
      { key: "location", label: "Location" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "calibration_date", label: "Etalonnage", variant: "date" }
    ],
    fields: [
      {
        key: "name",
        label: "Nom equipement",
        type: "text",
        required: true
      },
      {
        key: "serial_number",
        label: "Numero de serie",
        type: "text"
      },
      {
        key: "location",
        label: "Location",
        type: "text"
      },
      {
        key: "maintenance_date",
        label: "Date maintenance",
        type: "date"
      },
      {
        key: "calibration_date",
        label: "Date etalonnage",
        type: "date"
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Actif", value: "Active" },
          { label: "Maintenance", value: "Maintenance" },
          { label: "Etalonnage du", value: "Calibration Due" },
          { label: "Retire", value: "Retired" }
        ],
        required: true
      },
      {
        key: "notes",
        label: "Historique maintenance / notes",
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
    emptyState: "Creez la liste des equipements pour rendre visibles maintenance preventive et etalonnage.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [commentModule("Equipements", "equipment", ["admin", "quality_manager"])]
  },
  suppliers: {
    slug: "suppliers",
    label: "Fournisseurs",
    singular: "Fournisseur",
    icon: UsersRound,
    table: "suppliers",
    description: "Centraliser les fiches fournisseurs, scores, documents et contexte audit.",
    accentClass: "from-accent/20 via-sun/10 to-transparent",
    searchableFields: ["name", "contact_name", "email", "notes"],
    columns: [
      { key: "name", label: "Fournisseur" },
      { key: "contact_name", label: "Contact" },
      { key: "evaluation_score", label: "Score", variant: "number" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "email", label: "Email" }
    ],
    fields: [
      {
        key: "name",
        label: "Nom fournisseur",
        type: "text",
        required: true
      },
      {
        key: "contact_name",
        label: "Nom contact",
        type: "text"
      },
      {
        key: "email",
        label: "Email",
        type: "email"
      },
      {
        key: "phone",
        label: "Telephone",
        type: "tel"
      },
      {
        key: "evaluation_score",
        label: "Score evaluation",
        type: "number",
        min: 0,
        max: 100
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Approuve", value: "Approved" },
          { label: "En revue", value: "Under Review" },
          { label: "Bloque", value: "Blocked" }
        ],
        required: true
      },
      {
        key: "audit_history",
        label: "Historique audit",
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
    emptyState: "Ajoutez les fournisseurs approuves ou en revue pour lier evaluations et preuves.",
    writeRoles: ["admin", "quality_manager"],
    childModules: [
      attachmentModule("Fournisseurs", "suppliers", ["admin", "quality_manager"]),
      commentModule("Fournisseurs", "suppliers", ["admin", "quality_manager"])
    ]
  },
  notifications: {
    slug: "notifications",
    label: "Alertes",
    singular: "Alerte",
    icon: Bell,
    table: "notifications",
    description: "Suivre les rappels, echeances et statuts de lecture dans l'application.",
    accentClass: "from-accent/20 via-brand/10 to-transparent",
    searchableFields: ["title", "message", "category"],
    columns: [
      { key: "title", label: "Notification" },
      { key: "category", label: "Categorie" },
      { key: "status", label: "Statut", variant: "status" },
      { key: "due_date", label: "Echeance", variant: "date" },
      { key: "user_id", label: "Destinataire", variant: "relation" }
    ],
    fields: [
      {
        key: "title",
        label: "Titre",
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
        label: "Categorie",
        type: "text",
        placeholder: "Echeance, approbation, audit..."
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        required: true,
        options: [
          { label: "Non lue", value: "Unread" },
          { label: "Lue", value: "Read" }
        ]
      },
      {
        key: "due_date",
        label: "Echeance",
        type: "date"
      },
      {
        key: "user_id",
        label: "Destinataire",
        type: "select",
        relation: profileRelation
      },
      {
        key: "action_url",
        label: "Lien d'action",
        type: "url",
        placeholder: "/audits/..."
      }
    ],
    detailFields: ["title", "message", "category", "status", "due_date", "user_id"],
    emptyState: "Creez des rappels pour les approbations, audits et echeances proches.",
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
  "forms",
  "workflows",
  "customer-complaints",
  "supplier-complaints",
  "non-conformities",
  "constats",
  "complaints",
  "capa-actions",
  "audits",
  "risks",
  "trainings",
  "equipment",
  "suppliers",
  "notifications"
];

export const appNavItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutGrid },
  ...moduleOrder.map((slug) => ({
    href: `/${slug}`,
    label: moduleConfigs[slug].label,
    icon: moduleConfigs[slug].icon,
    module: slug
  })),
  { href: "/settings", label: "Parametres", icon: Boxes }
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
      { key: "name", label: "Nom du role", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  departments: {
    label: "Departements",
    table: "departments" as TableName,
    columns: [
      { key: "name", label: "Departement" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { key: "name", label: "Nom du departement", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  document_categories: {
    label: "Categories documentaires",
    table: "document_categories" as TableName,
    columns: [
      { key: "name", label: "Categorie" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { key: "name", label: "Nom de categorie", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  profiles: {
    label: "Utilisateurs",
    table: "profiles" as TableName,
    columns: [
      { key: "full_name", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "role_id", label: "Role", variant: "relation" },
      { key: "department_id", label: "Departement", variant: "relation" },
      { key: "is_active", label: "Actif", variant: "boolean" }
    ],
    fields: [
      { key: "full_name", label: "Nom complet", type: "text", required: true },
      { key: "email", label: "Email", type: "email", readOnly: true },
      { key: "job_title", label: "Fonction", type: "text" },
      { key: "phone", label: "Telephone", type: "tel" },
      { key: "role_id", label: "Role", type: "select", relation: roleRelation },
      {
        key: "department_id",
        label: "Departement",
        type: "select",
        relation: departmentRelation
      },
      { key: "supplier_company", label: "Societe fournisseur", type: "text" },
      { key: "is_active", label: "Utilisateur actif", type: "checkbox" }
    ]
  },
  app_settings: {
    label: "Configuration application",
    table: "app_settings" as TableName,
    columns: [
      { key: "setting_key", label: "Cle" },
      { key: "updated_at", label: "Mis a jour", variant: "date" }
    ],
    fields: [
      { key: "setting_key", label: "Cle de reglage", type: "text", required: true },
      {
        key: "setting_value",
        label: "Valeur du reglage (JSON)",
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

export function toSerializableModuleConfig(
  config: ModuleConfig
): SerializableModuleConfig {
  const { icon, ...serializableConfig } = config;
  return serializableConfig;
}

export function getLookupLabel(
  lookups: Record<string, LookupOption[]>,
  table: string,
  id?: string | null
) {
  if (!id) return "Non affecte";
  return lookups[table]?.find((option) => option.id === id)?.label ?? id;
}
