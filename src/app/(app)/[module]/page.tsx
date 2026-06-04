import { notFound } from "next/navigation";

import { ModulePageClient } from "@/components/modules/module-page-client";
import { getModulePageData } from "@/lib/modules/queries";
import { getModuleConfig, toSerializableModuleConfig } from "@/lib/modules/config";
import type { ModuleSlug } from "@/types/database";

type ModuleSearchParams = {
  q?: string | string[];
  status?: string | string[];
  view?: string | string[];
  mine?: string | string[];
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ModulePage({
  params,
  searchParams
}: {
  params: Promise<{ module: string }>;
  searchParams?: Promise<ModuleSearchParams>;
}) {
  const { module } = await params;
  const filters = searchParams ? await searchParams : {};
  const view = firstSearchParam(filters.view) ?? "";
  const pageKey = [
    module,
    firstSearchParam(filters.q) ?? "",
    firstSearchParam(filters.status) ?? "",
    view,
    firstSearchParam(filters.mine) ?? ""
  ].join(":");
  const config = getModuleConfig(module);

  if (!config) {
    notFound();
  }

  const initialQuery = firstSearchParam(filters.q) ?? "";
  const initialStatus = firstSearchParam(filters.status) ?? "";

  const data = await getModulePageData(module as ModuleSlug, {
    q: initialQuery || undefined,
    status: initialStatus || undefined,
    view: view || undefined,
    mine: firstSearchParam(filters.mine) === "1"
  });

  const viewLabels: Record<string, string> = {
    follow: "Suivi — dossiers en cours",
    history: "Historique QM — dossiers clos",
    mine: "Mes dossiers assignes"
  };

  return (
    <ModulePageClient
      key={pageKey}
      context={data.context}
      config={toSerializableModuleConfig(config)}
      records={data.records}
      lookups={data.lookups}
      initialQuery={initialQuery}
      initialStatus={initialStatus}
      viewLabel={view ? viewLabels[view] : undefined}
    />
  );
}
