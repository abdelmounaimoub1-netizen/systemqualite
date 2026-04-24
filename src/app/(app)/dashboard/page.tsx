import {
  BellRing,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  ShieldAlert,
  Sparkles
} from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { RiskBarChart } from "@/components/dashboard/risk-bar-chart";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/modules/queries";
import { formatDate, formatRelative } from "@/lib/utils";

export default async function DashboardPage() {
  const { context, metrics, recentActivity, recentNotifications } = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vue operationnelle"
        title={`Bonjour, ${context.profile?.full_name?.split(" ")[0] ?? "equipe"}`}
        description="Suivez le systeme qualite, les actions a traiter et la preparation audit de chaque equipe."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Documents"
          value={metrics.documents}
          hint="Documents maitrises"
          icon={FileStack}
        />
        <KpiCard
          title="Formulaires actifs"
          value={metrics.forms}
          hint="Modeles qualite configures"
          icon={ClipboardList}
        />
        <KpiCard
          title="Non-conformites"
          value={metrics.openNonConformities}
          hint="Dossiers non clos"
          icon={ShieldAlert}
        />
        <KpiCard
          title="Pending CAPA"
          value={metrics.pendingCapa}
          hint="Actions encore en cours"
          icon={Sparkles}
        />
        <KpiCard
          title="Audits a venir"
          value={metrics.upcomingAudits}
          hint="Planifies dans 30 jours"
          icon={ClipboardCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Synthese des risques</h2>
              <p className="mt-1 text-sm text-slate-500">Score automatique: probabilite x impact.</p>
            </div>
            <StatusBadge value="Live" />
          </div>
          <RiskBarChart data={metrics.riskSummary} />
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Alertes recentes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Validations, rappels et echeances assignees dans le portail.
            </p>
          </div>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                Aucune alerte pour le moment.
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div key={String(notification.id)} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">
                        {String(notification.title ?? "Notification")}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {String(notification.message ?? "")}
                      </div>
                    </div>
                    <BellRing className="mt-1 h-4 w-4 text-brand" />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>{String(notification.category ?? "General")}</span>
                    <span>{formatDate(String(notification.due_date ?? ""))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Activite recente</h2>
          <p className="mt-1 text-sm text-slate-500">
            Journalisee dans le registre audit pour garder la tracabilite.
          </p>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              Les actions utilisateurs apparaitront ici au fil des usages.
            </div>
          ) : (
            recentActivity.map((entry) => (
              <div
                key={String(entry.id)}
                className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold text-ink">
                    {String(entry.action_type ?? "UPDATE")} on{" "}
                    {String(entry.table_name ?? "record")}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Record {String(entry.record_id ?? "")} -{" "}
                    {formatRelative(String(entry.created_at ?? ""))}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {formatDate(String(entry.created_at ?? ""))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
