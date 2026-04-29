import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, ClipboardCheck, FileStack } from "lucide-react";

import { getDashboardData } from "@/lib/modules/queries";

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
      "Operations Industrielles",
      "Commercial",
      "Marketing et Innovation",
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
    title: "Pilotage",
    color: "bg-slate-100",
    blocks: [
      "Pilotage strategique",
      "Pilotage de la performance",
      "Audit interne & Risk Management",
      "Controle interne",
      "Qualite, Securite et Environnement"
    ]
  },
  {
    title: "Realisation",
    color: "bg-emerald-50",
    blocks: ["Achats", "Amont agricole", "Operations industrielles", "Commercial"]
  },
  {
    title: "Supply chain",
    color: "bg-sky-50",
    blocks: ["Service clients", "Logistique amont", "Entreposage", "Logistique aval"]
  },
  {
    title: "Support",
    color: "bg-stone-50",
    blocks: [
      "Ressources humaines",
      "Communication & RSE",
      "Juridique",
      "Finance",
      "Systeme d'information"
    ]
  }
];

function PortalBox({
  title,
  children,
  className = ""
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden border border-red-300 bg-red-50 ${className}`}>
      <div className="bg-[#d2202f] px-3 py-1.5 text-sm font-semibold text-white">{title}</div>
      {children}
    </section>
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
    <section className="overflow-hidden border border-red-300 bg-red-50">
      <Link
        href={href}
        className="flex items-center justify-between bg-[#d2202f] px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-[#b91825]"
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-white/80 bg-white/20" />
          {title}
        </span>
        <span className="min-w-6 rounded bg-white/20 px-1.5 text-center text-xs">{count}</span>
      </Link>
      <div className="space-y-1 px-3 py-2 text-xs text-slate-700">
        {actions.map((action) => {
          const actionHref =
            action.startsWith("Nouvelle") ||
            action.startsWith("Nouveau") ||
            action.startsWith("Planification")
              ? `${href}?new=1`
              : href;

          return (
            <Link key={action} href={actionHref} className="flex items-center gap-1.5 hover:text-red-700">
              <ChevronRight className="h-3.5 w-3.5 text-red-600" />
              {action}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProcessMap() {
  return (
    <div className="border border-red-200 bg-white p-3">
      <div className="bg-[linear-gradient(90deg,#7b2f2f,#b3473f,#7b2f2f)] px-4 py-4 text-center text-2xl font-bold uppercase tracking-wide text-white">
        Un savoir-faire de qualite
      </div>

      <div className="mt-4 border-[6px] border-red-200 bg-[#f7f2ed] p-4">
        <div className="grid gap-3">
          {processLanes.map((lane) => (
            <div key={lane.title} className="grid gap-2 lg:grid-cols-[130px_1fr]">
              <div className="flex items-center justify-center bg-[#1b4660] px-3 py-3 text-xs font-semibold uppercase text-white">
                {lane.title}
              </div>
              <div className={`grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-5 ${lane.color}`}>
                {lane.blocks.map((block) => (
                  <Link
                    key={block}
                    href="/documents"
                    className="min-h-12 border border-slate-300 bg-white px-2 py-2 text-center text-[11px] font-semibold leading-4 text-slate-700 hover:border-red-400 hover:text-red-700"
                  >
                    {block}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { metrics } = await getDashboardData();

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
        "Historique QM des Reclamations Fournisseurs"
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
    { label: "enregistrements a traiter", value: metrics.forms, href: "/forms" }
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
      <section id="portail-documentaire" className="scroll-mt-20">
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <div className="space-y-3">
            <PortalBox title="Documentation par processus">
              <div className="space-y-3 px-3 py-3 text-xs text-slate-700">
                {documentTree.map((group) => (
                  <div key={group.label}>
                    <Link href="/documents" className="font-semibold hover:text-red-700">
                      {group.label}
                    </Link>
                    <ul className="mt-1 space-y-1 pl-4">
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
            </PortalBox>

            <PortalBox title="Mes Taches En Cours">
              <div className="divide-y divide-red-100 text-xs">
                {taskRows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-red-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ClipboardCheck className="h-3.5 w-3.5 text-red-600" />
                      {row.label}
                    </span>
                    <span>{row.value}</span>
                  </Link>
                ))}
              </div>
            </PortalBox>

            <PortalBox title="Mon Bloc Notes" className="min-h-40">
              <div className="p-3 text-xs text-slate-500">
                Les notes de suivi apparaissent dans les discussions de chaque dossier.
              </div>
            </PortalBox>
          </div>

          <ProcessMap />
        </div>
      </section>

      <section id="portail-amelioration" className="scroll-mt-20">
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <div className="grid gap-3">
            {improvementPanels.map((panel) => (
              <RedPanel key={panel.title} {...panel} />
            ))}
          </div>

          <div className="space-y-3">
            <RedPanel
              title="Audits"
              count={metrics.upcomingAudits}
              href="/audits"
              actions={[
                "Planification d'audit",
                "Calendrier des audits",
                "Rapport d'audit",
                "Suivi des audits",
                "Historique des audits"
              ]}
            />

            <PortalBox title="Mes Taches En Cours">
              <div className="divide-y divide-red-100 text-xs">
                {taskRows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="grid grid-cols-[1fr_auto] px-3 py-2 text-slate-700 hover:bg-red-100"
                  >
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </Link>
                ))}
              </div>
            </PortalBox>

            <PortalBox title="Mes enregistrements a traiter ou a suivre">
              <div className="divide-y divide-red-100 text-xs">
                {followRows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 px-3 py-2 text-slate-700 hover:bg-red-100"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-red-600" />
                    <span className="font-semibold">{row.label}</span>
                    <span>{row.value}</span>
                    <FileStack className="h-3.5 w-3.5 text-slate-500" />
                  </Link>
                ))}
              </div>
            </PortalBox>
          </div>
        </div>
      </section>
    </div>
  );
}
