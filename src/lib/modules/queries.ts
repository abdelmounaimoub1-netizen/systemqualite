import { addDays, formatISO } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";

import { escapePostgrestFilter } from "@/lib/utils";
import { getCurrentUserContext, createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getModuleConfig,
  lookupSelectMap,
  moduleConfigs,
  toSerializableModuleConfig
} from "@/lib/modules/config";
import type {
  LookupCollection,
  LookupOption,
  ModuleConfig,
  SettingsData,
  UserContext
} from "@/types/app";
import type { ModuleSlug, TableName } from "@/types/database";

const COMMON_LOOKUP_TABLES: TableName[] = [
  "profiles",
  "roles",
  "departments",
  "document_categories",
  "non_conformities"
];

function getRelationTables(config?: ModuleConfig) {
  if (!config) return COMMON_LOOKUP_TABLES;

  const relationTables = [
    ...config.fields,
    ...(config.childModules ?? []).flatMap((child) => child.fields)
  ]
    .map((field) => field.relation?.table)
    .filter((table): table is TableName => Boolean(table));

  return Array.from(new Set([...COMMON_LOOKUP_TABLES, ...relationTables]));
}

function toLookupOptions(table: TableName, rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    let label = String(row.name ?? row.title ?? row.full_name ?? row.setting_key ?? row.id);

    if (table === "profiles") {
      const fullName = String(row.full_name ?? row.email ?? row.id);
      const jobTitle = row.job_title ? ` - ${row.job_title}` : "";
      label = `${fullName}${jobTitle}`;
    }

    return {
      id: String(row.id),
      label,
      meta: {
        email: typeof row.email === "string" ? row.email : null
      }
    } satisfies LookupOption;
  });
}

export async function getLookups(tables: TableName[] = COMMON_LOOKUP_TABLES) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const uniqueTables = Array.from(new Set(tables));

  const lookupEntries = await Promise.all(
    uniqueTables.map(async (table) => {
      const select = lookupSelectMap[table] ?? "id";
      const { data, error } = await supabase.from(table).select(select).order("created_at", {
        ascending: false
      });

      if (error) {
        console.error(`Lookup query failed for ${table}:`, error.message);
      }

      return [
        table,
        toLookupOptions(table, ((data as unknown as Array<Record<string, unknown>>) ?? []))
      ] as const;
    })
  );

  return Object.fromEntries(lookupEntries) as LookupCollection;
}

export async function getDashboardData() {
  noStore();
  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups()
  ]);

  const today = new Date();
  const inThirtyDays = addDays(today, 30);

  if (!context) {
    throw new Error("Utilisateur non authentifie.");
  }

  const userId = context.userId;

  const [
    docs,
    pendingDocumentApprovals,
    pendingDocumentDistributions,
    myPendingDocumentApprovals,
    myPendingDocumentDistributions,
    pendingDocumentReviews,
    openDocumentSuggestions,
    forms,
    customerComplaints,
    supplierComplaints,
    nonConformities,
    constats,
    complaints,
    capaActions,
    audits,
    risks,
    recentActivity,
    notifications
  ] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("document_approvals")
      .select("id", { count: "exact", head: true })
      .eq("decision", "Pending"),
    supabase
      .from("document_distributions")
      .select("id", { count: "exact", head: true })
      .eq("status", "To Acknowledge"),
    supabase
      .from("document_approvals")
      .select("id", { count: "exact", head: true })
      .eq("decision", "Pending")
      .eq("approver_id", userId),
    supabase
      .from("document_distributions")
      .select("id", { count: "exact", head: true })
      .eq("status", "To Acknowledge")
      .eq("recipient_id", userId),
    supabase
      .from("document_review_cycles")
      .select("id", { count: "exact", head: true })
      .in("status", ["Planned", "In Review", "Late"]),
    supabase
      .from("document_suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", "Open"),
    supabase.from("forms").select("id", { count: "exact", head: true }).eq("status", "Active"),
    supabase
      .from("customer_complaints")
      .select("id", { count: "exact", head: true })
      .neq("status", "Closed"),
    supabase
      .from("supplier_complaints")
      .select("id", { count: "exact", head: true })
      .neq("status", "Closed"),
    supabase
      .from("non_conformities")
      .select("id", { count: "exact", head: true })
      .neq("status", "Closed"),
    supabase.from("constats").select("id", { count: "exact", head: true }).neq("status", "Closed"),
    supabase.from("complaints").select("id", { count: "exact", head: true }).neq("status", "Closed"),
    supabase
      .from("capa_actions")
      .select("id", { count: "exact", head: true })
      .neq("status", "Closed"),
    supabase
      .from("audits")
      .select("id", { count: "exact", head: true })
      .gte("planned_date", formatISO(today, { representation: "date" }))
      .lte("planned_date", formatISO(inThirtyDays, { representation: "date" })),
    supabase.from("risks").select("risk_level, risk_score"),
    supabase
      .from("audit_trail")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  const riskRows = (risks.data as Array<Record<string, unknown>> | null) ?? [];
  const riskSummary = {
    low: riskRows.filter((risk) => risk.risk_level === "Low").length,
    medium: riskRows.filter((risk) => risk.risk_level === "Medium").length,
    high: riskRows.filter((risk) => risk.risk_level === "High").length,
    critical: riskRows.filter((risk) => risk.risk_level === "Critical").length
  };

  return {
    context: context as UserContext,
    lookups,
    metrics: {
      documents: docs.count ?? 0,
      pendingDocumentApprovals: pendingDocumentApprovals.count ?? 0,
      pendingDocumentDistributions: pendingDocumentDistributions.count ?? 0,
      myPendingDocumentApprovals: myPendingDocumentApprovals.count ?? 0,
      myPendingDocumentDistributions: myPendingDocumentDistributions.count ?? 0,
      pendingDocumentReviews: pendingDocumentReviews.count ?? 0,
      openDocumentSuggestions: openDocumentSuggestions.count ?? 0,
      forms: forms.count ?? 0,
      openCustomerComplaints: customerComplaints.count ?? 0,
      openSupplierComplaints: supplierComplaints.count ?? 0,
      openNonConformities: nonConformities.count ?? 0,
      openConstats: constats.count ?? 0,
      openComplaints: complaints.count ?? 0,
      pendingCapa: capaActions.count ?? 0,
      upcomingAudits: audits.count ?? 0,
      riskSummary
    },
    recentActivity: (recentActivity.data as Array<Record<string, unknown>>) ?? [],
    recentNotifications: (notifications.data as Array<Record<string, unknown>>) ?? []
  };
}

const FOLLOW_STATUSES = [
  "Open",
  "In Progress",
  "Draft",
  "Under Review",
  "Awaiting Approval",
  "Planned",
  "Unread",
  "To Acknowledge",
  "Overdue"
];

const HISTORY_STATUSES = ["Closed", "Archived", "Completed", "Read", "Acknowledged", "Cancelled"];

export async function getModulePageData(
  slug: ModuleSlug,
  filters?: { q?: string; status?: string; view?: string; mine?: boolean }
) {
  noStore();
  const config = moduleConfigs[slug];
  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups(getRelationTables(config))
  ]);

  if (!context) {
    throw new Error("Utilisateur non authentifie.");
  }

  let query = supabase.from(config.table).select("*").order("updated_at", { ascending: false });

  if (filters?.q) {
    const escaped = escapePostgrestFilter(filters.q);
    const search = config.searchableFields
      .map((field) => `${field}.ilike.%${escaped}%`)
      .join(",");
    query = query.or(search);
  }

  if (filters?.status) {
    if (config.fields.some((field) => field.key === "status")) {
      query = query.eq("status", filters.status);
    } else if (config.fields.some((field) => field.key === "risk_level")) {
      query = query.eq("risk_level", filters.status);
    }
  } else if (filters?.view === "follow" && config.fields.some((field) => field.key === "status")) {
    query = query.in("status", FOLLOW_STATUSES);
  } else if (filters?.view === "history" && config.fields.some((field) => field.key === "status")) {
    query = query.in("status", HISTORY_STATUSES);
  }

  if (filters?.mine && config.fields.some((field) => field.key === "responsible_user_id")) {
    query = query.eq("responsible_user_id", context.userId);
  }

  const { data } = await query;

  return {
    context: context as UserContext,
    config: toSerializableModuleConfig(config),
    lookups,
    records: (data as Array<Record<string, unknown>>) ?? []
  };
}

function documentMatchesLabel(document: Record<string, unknown>, label: string) {
  const needle = label.trim().toLowerCase();
  if (!needle) return false;

  const haystack = [
    document.title,
    document.process_family,
    document.process_group,
    document.process_activity
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .filter(Boolean);

  return haystack.some(
    (value) => value.includes(needle) || needle.includes(value) || value === needle
  );
}

export async function getProcessDocumentCounts(labels: string[]) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("documents")
    .select("id,title,process_family,process_group,process_activity");

  const documents = (data ?? []) as Array<Record<string, unknown>>;
  const uniqueLabels = Array.from(new Set(labels.map((label) => label.trim()).filter(Boolean)));
  const counts: Record<string, number> = {};

  uniqueLabels.forEach((label) => {
    counts[label.toLowerCase()] = documents.filter((document) =>
      documentMatchesLabel(document, label)
    ).length;
  });

  return counts;
}

export async function getMyPendingSignatures() {
  noStore();
  const context = await getCurrentUserContext();
  if (!context) throw new Error("Utilisateur non authentifie.");

  const supabase = await createSupabaseServerClient();
  const { data: approvals } = await supabase
    .from("document_approvals")
    .select("id,step_order,decision,due_date,document_id")
    .eq("decision", "Pending")
    .eq("approver_id", context.userId)
    .order("due_date", { ascending: true });

  const documentIds = Array.from(
    new Set((approvals ?? []).map((row) => String(row.document_id)).filter(Boolean))
  );

  if (documentIds.length === 0) {
    return { context, items: [] as Array<Record<string, unknown>> };
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id,document_code,title,status,version_current")
    .in("id", documentIds);

  const documentMap = Object.fromEntries(
    ((documents ?? []) as Array<Record<string, unknown>>).map((document) => [
      String(document.id),
      document
    ])
  );

  const items = (approvals ?? []).map((approval) => ({
    ...approval,
    document: documentMap[String(approval.document_id)] ?? null
  }));

  return { context, items };
}

export async function getMyPendingAcknowledgments() {
  noStore();
  const context = await getCurrentUserContext();
  if (!context) throw new Error("Utilisateur non authentifie.");

  const supabase = await createSupabaseServerClient();
  const { data: distributions } = await supabase
    .from("document_distributions")
    .select("id,status,due_date,document_id,recipient_group")
    .eq("recipient_id", context.userId)
    .in("status", ["To Acknowledge", "Overdue"])
    .order("due_date", { ascending: true });

  const documentIds = Array.from(
    new Set((distributions ?? []).map((row) => String(row.document_id)).filter(Boolean))
  );

  if (documentIds.length === 0) {
    return { context, items: [] as Array<Record<string, unknown>> };
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id,document_code,title,status")
    .in("id", documentIds);

  const documentMap = Object.fromEntries(
    ((documents ?? []) as Array<Record<string, unknown>>).map((document) => [
      String(document.id),
      document
    ])
  );

  const items = (distributions ?? []).map((distribution) => ({
    ...distribution,
    document: documentMap[String(distribution.document_id)] ?? null
  }));

  return { context, items };
}

export async function getModuleDetailData(slug: ModuleSlug, recordId: string) {
  noStore();
  const config = getModuleConfig(slug);

  if (!config) {
    return null;
  }

  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups(getRelationTables(config))
  ]);

  const { data: record } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (!record) {
    return null;
  }

  const childDataEntries = await Promise.all(
    (config.childModules ?? []).map(async (child) => {
      let query = supabase
        .from(child.table)
        .select("*")
        .eq(child.parentField, recordId)
        .order("created_at", { ascending: false });

      for (const [key, value] of Object.entries(child.fixedValues ?? {})) {
        query = query.eq(key, value as never);
      }

      const { data } = await query;
      return [child.key, (data as Array<Record<string, unknown>>) ?? []] as const;
    })
  );

  return {
    context: context as UserContext,
    config: toSerializableModuleConfig(config),
    lookups,
    record: record as Record<string, unknown>,
    children: Object.fromEntries(childDataEntries)
  };
}

export async function getSettingsPageData() {
  noStore();
  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups(["roles", "departments", "document_categories", "profiles"])
  ]);

  const [roles, departments, categories, profiles, appSettings, auditTrail] = await Promise.all([
    supabase.from("roles").select("*").order("created_at"),
    supabase.from("departments").select("*").order("created_at"),
    supabase.from("document_categories").select("*").order("created_at"),
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("app_settings").select("*").order("created_at"),
    supabase.from("audit_trail").select("*").order("created_at", { ascending: false }).limit(12)
  ]);

  return {
    context: context as UserContext,
    lookups,
    settings: {
      roles: roles.data ?? [],
      departments: departments.data ?? [],
      categories: categories.data ?? [],
      profiles: profiles.data ?? []
    } satisfies SettingsData,
    appSettings: appSettings.data ?? [],
    auditTrail: auditTrail.data ?? []
  };
}

export async function getProfilePageData() {
  noStore();
  const [context, lookups] = await Promise.all([
    getCurrentUserContext(),
    getLookups(["roles", "departments"])
  ]);

  return {
    context: context as UserContext,
    lookups
  };
}
