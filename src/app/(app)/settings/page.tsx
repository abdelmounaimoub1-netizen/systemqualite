import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { getSettingsPageData } from "@/lib/modules/queries";

export default async function SettingsPage() {
  const { context, settings, lookups, appSettings, auditTrail } = await getSettingsPageData();

  return (
    <SettingsPageClient
      context={context}
      settings={settings}
      lookups={lookups}
      appSettings={appSettings as Array<Record<string, unknown>>}
      auditTrail={auditTrail as Array<Record<string, unknown>>}
    />
  );
}
