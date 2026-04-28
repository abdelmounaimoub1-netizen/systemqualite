import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  Gauge,
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

const documentTree = [
  {
    label: "Pilotage",
    children: [
      "Pilotage strategique",
      "Pilotage de la performance",
      "Audit interne & Risk management",
      "Controle interne",
      "Qualite, securite des aliments et environnement",
      "Sante et securite au travail"
    ]
  },
  {
    label: "Realisation",
    children: [
      "Achats",
      "Operations industrielles",
      "Commercial",
      "Marketing et innovation",
      "Supply chain",
      "Trading"
    ]
  },
  {
    label: "Support",
    children: [
      "Ressources humaines",
      "Communication externe",
      "Juridique",
      "Finance",
      "Systeme d'information"
    ]
  }
];

const processLanes = [
  {
    title: "Management",
    blocks: ["Pilotage strategique", "Pilotage performance", "Audit interne & Risk", "Controle interne"]
  },
  {
    title: "Realisation",
    blocks: ["Achats", "Amont agricole", "Operations industrielles", "Commercial"]
  },
  {
    title: "Support",
    blocks: ["Supply chain", "Ressources humaines", "Juridique", "Finance", "Systeme d'information"]
  }
];

function ProcessMap() {
  return (
    <div className="overflow-hidden rounded-lg border border-red-200 bg-white">
      <div className="bg-[url('/icons/icon-512.svg')] bg-cover bg-center px-4 py-5 text-center">
        <div className="mx-auto max-w-3xl bg-red-900/80 px-4 py-3 text-2xl font-semibold uppercase tracking-wide text-white">
          Un savoir-faire de qualite
        </div>
      </div>

      <div className="space-y-3 p-4">
        {processLanes.map((lane) => (
          <div key={lane.title} className="grid gap-2 md:grid-cols-[140px_1fr]">
            <div className="flex items-center justify-center rounded bg-slate-900 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {lane.title}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {lane.blocks.map((block) => (
                <div
                  key={block}
                  className="min-h-14 rounded border border-slate-300 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-700"
                >
                  {block}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RedPanel({
  title,
  count,
  href,
  actions
}: {
  title: string;
  count: number;
  href: string;
  actions: string[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
      <Link
        href={href}
        className="flex items-center justify-between bg-red-600 px-3 py-2 text-sm font-semibold text-white"
      >
        <span>{title}</span>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs">{count}</span>
      </Link>
      <div className="space-y-1 px-4 py-3 text-sm text-slate-700">
        {actions.map((action) => (
          <Link key={action} href={href} className="flex items-center gap-2 hover:text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {action}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const { context, metrics, recentActivity, recentNotifications } = await getDashboardData();

  const improvementPanels = [
    {
      title: "Reclamations client",
      count: metrics.openCustomerComplaints,
      href: "/customer-complaints",
      actions: [
        "Nouvelle reclamation client",
        "Suivi des reclamations clients",
        "Historique QM des reclamations client"
      ]
    },
    {
      title: "Reclamation fournisseur",
      count: metrics.openSupplierComplaints,
      href: "/supplier-complaints",
      actions: [
        "Nouvelle reclamation fournisseur",
        "Suivi des reclamations fournisseur",
        "Historique QM des reclamations fournisseurs"
      ]
    },
    {
      title: "Non conformites Produit",
      count: metrics.openNonConformities,
      href: "/non-conformities",
      actions: [
        "Nouvelle Non conformite",
        "Suivi des Non conformites Produit",
        "Historique QM des Non conformites Produit"
      ]
    },
    {
      title: "Constats",
      count: metrics.openConstats,
      href: "/constats",
      actions: ["Nouveau constat", "Suivi des constats", "Historique QM des Constats"]
    },
    {
      title: "Plaintes",
      count: metrics.openComplaints,
      href: "/complaints",
      actions: ["Nouvelle plainte", "Suivi des plaintes"]
    },
    {
      title: "Actions correctives",
      count: metrics.pendingCapa,
      href: "/capa-actions",
      actions: ["Nouvelle action", "Suivi des actions", "Historique QM FAC"]
    }
  ];

  const taskRows = [
    { label: "documents a accuser reception", value: metrics.documents, href: "/documents" },
    { label: "enregistrements a traiter", value: metrics.forms, href: "/forms" },
    { label: "actions en cours", value: metrics.pendingCapa, href: "/capa-actions" }
  ];

  const followRows = [
    { label: "ACTION", value: metrics.pendingCapa, href: "/capa-actions" },
    { label: "CONSTAT", value: metrics.openConstats, href: "/constats" },
    { label: "NC PRODUIT", value: metrics.openNonConformities, href: "/non-conformities" },
    { label: "RECLAMATION CLIENT", value: metrics.openCustomerComplaints, href: "/customer-complaints" },
    { label: "RECLAMATION FOURNISSEUR", value: metrics.openSupplierComplaints, href: "/supplier-complaints" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portail Qualios"
        title={`Bonjour, ${context.profile?.full_name?.split(" ")[0] ?? "equipe"}`}
        description="Deux espaces operationnels: documentation maitrisee et amelioration continue, avec les enregistrements, actions, audits et alertes au meme endroit."
        actions={
          <>
            <Link
              href="#portail-documentaire"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-red-300 hover:text-red-700"
            >
              Portail Documentaire
            </Link>
            <Link
              href="#portail-amelioration"
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              Portail Amelioration
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Documents" value={metrics.documents} hint="Documents maitrises" icon={FileStack} />
        <KpiCard title="Formulaires" value={metrics.forms} hint="Modeles actifs" icon={ClipboardList} />
        <KpiCard title="Reclamations" value={metrics.openCustomerComplaints + metrics.openSupplierComplaints} hint="Client + fournisseur" icon={BellRing} />
        <KpiCard title="NC / Constats" value={metrics.openNonConformities + metrics.openConstats} hint="A traiter" icon={ShieldAlert} />
        <KpiCard title="Audits" value={metrics.upcomingAudits} hint="Planifies dans 30 jours" icon={ClipboardCheck} />
      </div>

      <section id="portail-documentaire" className="grid gap-5 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Documentation par processus
            </div>
            <div className="space-y-3 p-4">
              {documentTree.map((group) => (
                <div key={group.label}>
                  <div className="text-sm font-semibold text-slate-800">{group.label}</div>
                  <ul className="mt-1 space-y-1 border-l border-red-200 pl-4 text-sm text-slate-600">
                    {group.children.map((child) => (
                      <li key={child}>
                        <Link href="/documents" className="hover:text-red-700">
                          {child}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Mes Taches En Cours
            </div>
            <div className="divide-y divide-red-100">
              {taskRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-red-100/70"
                >
                  <span>{row.label}</span>
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-red-700">
                    {row.value}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="min-h-32 overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Mon Bloc Notes
            </div>
            <div className="p-4 text-sm text-slate-500">
              Les notes de suivi apparaissent dans les discussions de chaque dossier.
            </div>
          </div>
        </div>

        <ProcessMap />
      </section>

      <section id="portail-amelioration" className="grid gap-5 xl:grid-cols-[0.52fr_0.48fr]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          {improvementPanels.map((panel) => (
            <RedPanel key={panel.title} {...panel} />
          ))}
        </div>

        <div className="space-y-4">
          <RedPanel
            title="Audits"
            count={metrics.upcomingAudits}
            href="/audits"
            actions={["Planification d'audit", "Calendrier des audits", "Rapport d'audit", "Suivi des audits", "Historique des audits"]}
          />

          <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Mes Taches En Cours
            </div>
            <div className="divide-y divide-red-100">
              {taskRows.slice(0, 2).map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-red-100/70"
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Mes enregistrements a traiter ou a suivre
            </div>
            <div className="divide-y divide-red-100">
              {followRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-100/70"
                >
                  <span className="font-semibold">{row.label}</span>
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-red-700">
                    {row.value}
                  </span>
                  <ArrowRight className="h-4 w-4 text-red-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
              <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
                Aucune alerte pour le moment.
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div key={String(notification.id)} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">
                        {String(notification.title ?? "Notification")}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {String(notification.message ?? "")}
                      </div>
                    </div>
                    <BellRing className="mt-1 h-4 w-4 text-red-600" />
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
            <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
              Les actions utilisateurs apparaitront ici au fil des usages.
            </div>
          ) : (
            recentActivity.map((entry) => (
              <div
                key={String(entry.id)}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold text-ink">
                    {String(entry.action_type ?? "UPDATE")} on {String(entry.table_name ?? "record")}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Record {String(entry.record_id ?? "")} - {formatRelative(String(entry.created_at ?? ""))}
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
