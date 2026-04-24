import { addDays, formatISO } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";

import { getCurrentUserContext, createSupabaseServerClient } from "@/lib/supabase/server";
import { getModuleConfig, lookupSelectMap, moduleConfigs } from "@/lib/modules/config";
import type { LookupCollection, LookupOption, SettingsData, UserContext } from "@/types/app";
import type { ModuleSlug, TableName } from "@/types/database";

const COMMON_LOOKUP_TABLES: TableName[] = [
  "profiles",
  "roles",
  "departments",
  "document_categories",
  "non_conformities"
];

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
      const { data } = await supabase.from(table).select(select).order("created_at", {
        ascending: false
      });

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

  const [
    docs,
    nonConformities,
    capaActions,
    audits,
    risks,
    recentActivity,
    notifications
  ] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("non_conformities")
      .select("id", { count: "exact", head: true })
      .neq("status", "Closed"),
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
      openNonConformities: nonConformities.count ?? 0,
      pendingCapa: capaActions.count ?? 0,
      upcomingAudits: audits.count ?? 0,
      riskSummary
    },
    recentActivity: (recentActivity.data as Array<Record<string, unknown>>) ?? [],
    recentNotifications: (notifications.data as Array<Record<string, unknown>>) ?? []
  };
}

export async function getModulePageData(
  slug: ModuleSlug,
  filters?: { q?: string; status?: string }
) {
  noStore();
  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups()
  ]);

  const config = moduleConfigs[slug];
  let query = supabase.from(config.table).select("*").order("updated_at", { ascending: false });

  if (filters?.q) {
    const search = config.searchableFields
      .map((field) => `${field}.ilike.%${filters.q}%`)
      .join(",");
    query = query.or(search);
  }

  if (filters?.status) {
    if (config.fields.some((field) => field.key === "status")) {
      query = query.eq("status", filters.status);
    } else if (config.fields.some((field) => field.key === "risk_level")) {
      query = query.eq("risk_level", filters.status);
    }
  }

  const { data } = await query;

  return {
    context: context as UserContext,
    config,
    lookups,
    records: (data as Array<Record<string, unknown>>) ?? []
  };
}

export async function getModuleDetailData(slug: ModuleSlug, recordId: string) {
  noStore();
  const [context, supabase, lookups] = await Promise.all([
    getCurrentUserContext(),
    createSupabaseServerClient(),
    getLookups()
  ]);

  const config = getModuleConfig(slug);

  if (!config) {
    return null;
  }

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
    config,
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
