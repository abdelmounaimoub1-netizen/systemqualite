import { notFound } from "next/navigation";

import { CustomerComplaintWorkflowClient } from "@/components/modules/customer-complaint-workflow-client";
import { DocumentWorkflowClient } from "@/components/modules/document-workflow-client";
import { RecordDetailClient } from "@/components/modules/record-detail-client";
import { SupplierComplaintWorkflowClient } from "@/components/modules/supplier-complaint-workflow-client";
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

  if (module === "documents") {
    return (
      <DocumentWorkflowClient
        context={data.context}
        config={data.config}
        record={data.record}
        lookups={data.lookups}
        childrenData={data.children}
      />
    );
  }

  if (module === "supplier-complaints") {
    return (
      <SupplierComplaintWorkflowClient
        context={data.context}
        config={data.config}
        record={data.record}
        lookups={data.lookups}
        childrenData={data.children}
      />
    );
  }

  if (module === "customer-complaints") {
    return (
      <CustomerComplaintWorkflowClient
        context={data.context}
        config={data.config}
        record={data.record}
        lookups={data.lookups}
        childrenData={data.children}
      />
    );
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
