import { notFound } from "next/navigation";

import { ModulePageClient } from "@/components/modules/module-page-client";
import { getModulePageData } from "@/lib/modules/queries";
import { getModuleConfig, toSerializableModuleConfig } from "@/lib/modules/config";
import type { ModuleSlug } from "@/types/database";

export default async function ModulePage({
  params
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const config = getModuleConfig(module);

  if (!config) {
    notFound();
  }

  const data = await getModulePageData(module as ModuleSlug);

  return (
    <ModulePageClient
      context={data.context}
      config={toSerializableModuleConfig(config)}
      records={data.records}
      lookups={data.lookups}
    />
  );
}
