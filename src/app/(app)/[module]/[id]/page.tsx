import { notFound } from "next/navigation";

import { RecordDetailClient } from "@/components/modules/record-detail-client";
import { getModuleDetailData } from "@/lib/modules/queries";
import type { ModuleSlug } from "@/types/database";

export default async function ModuleDetailPage({
  params
}: {
  params: Promise<{ module: string; id: string }>;
}) {
  const { module, id } = await params;
  const data = await getModuleDetailData(module as ModuleSlug, id);

  if (!data) {
    notFound();
  }

  return (
    <RecordDetailClient
      context={data.context}
      config={data.config}
      record={data.record}
      lookups={data.lookups}
      childrenData={data.children}
    />
  );
}
