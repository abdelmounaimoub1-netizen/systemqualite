import { notFound } from "next/navigation";

import { ModulePageClient } from "@/components/modules/module-page-client";
import { getModulePageData } from "@/lib/modules/queries";
import { getModuleConfig, toSerializableModuleConfig } from "@/lib/modules/config";
import type { ModuleSlug } from "@/types/database";

type ModuleSearchParams = {
  q?: string | string[];
  status?: string | string[];
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
  const pageKey = [
    module,
    firstSearchParam(filters.q) ?? "",
    firstSearchParam(filters.status) ?? ""
  ].join(":");
  const config = getModuleConfig(module);

  if (!config) {
    notFound();
  }

  const data = await getModulePageData(module as ModuleSlug);

  return (
    <ModulePageClient
      key={pageKey}
      context={data.context}
      config={toSerializableModuleConfig(config)}
      records={data.records}
      lookups={data.lookups}
    />
  );
}
