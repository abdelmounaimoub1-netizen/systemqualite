import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, Circle, ClipboardCheck, FileStack } from "lucide-react";

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
  className = "",
  headerClassName = ""
}: {
  title: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <section className={`overflow-hidden border border-red-300 bg-red-50 ${className}`}>
      <div className={`bg-[#d2202f] px-2 py-1 text-xs font-semibold text-white ${headerClassName}`}>
        {title}
      </div>
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
    <section className="overflow-hidden border border-red-300 bg-[#f7c9cd]">
      <Link
        href={href}
        className="flex items-center justify-between bg-[#d2202f] px-2 py-1 text-xs font-semibold text-white hover:bg-[#b91825]"
      >
        <span className="inline-flex items-center gap-2">
          <Circle className="h-3.5 w-3.5 fill-white/15" />
          {title}
        </span>
        <span className="min-w-4 text-center text-[10px]">-</span>
      </Link>
      <div className="space-y-0.5 px-2 py-1.5 text-[10px] leading-4 text-slate-700">
        {actions.map((action) => {
          const actionHref =
            action.startsWith("Nouvelle") ||
            action.startsWith("Nouveau") ||
            action.startsWith("Planification")
              ? `${href}?new=1`
              : href;

          return (
            <Link key={action} href={actionHref} className="flex items-center gap-1.5 hover:text-red-700">
              <ChevronRight className="h-3 w-3 text-red-600" />
              {action}
              <span className="sr-only">({count})</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProcessMap() {
  return (
    <div className="bg-[#efeee7]">
      <div className="mb-4 bg-[linear-gradient(90deg,#7b2f2f,#b3473f,#7b2f2f)] px-4 py-4 text-center text-[28px] font-bold uppercase text-white shadow-sm">
        Un savoir-faire de qualite
      </div>

      <div className="mx-auto max-w-[980px] overflow-x-auto">
        <div className="min-w-[860px] border-[6px] border-[#de777f] bg-[#ede9df] p-3">
          <div className="grid grid-cols-[34px_34px_1fr_34px] gap-2">
            <div className="row-span-4 flex items-center justify-center bg-[#1b4660] text-[10px] font-bold uppercase text-white">
              <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                Exigences
              </span>
            </div>
            <div className="row-span-4 flex items-center justify-center bg-slate-500 text-[10px] font-bold uppercase text-white">
              <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                Parties interessees
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {processLanes[0].blocks.map((block) => (
                <Link
                  key={block}
                  href="/documents"
                  className="border border-slate-300 bg-[#f5f1eb] px-2 py-2 text-center text-[10px] font-semibold leading-4 text-slate-700 hover:border-red-500 hover:text-red-700"
                >
                  {block}
                </Link>
              ))}
            </div>

            <div className="row-span-4 flex items-center justify-center bg-emerald-700 text-[10px] font-bold uppercase text-white">
              <span style={{ writingMode: "vertical-rl" }}>Satisfaction clients</span>
            </div>

            <div className="col-start-3 space-y-2 border border-slate-300 bg-[#f9f4ef] p-2">
              <div className="text-center text-[10px] font-bold text-slate-700">
                Achats / Operations / Commercial / Logistique
              </div>
              <div className="grid grid-cols-[1fr_1fr_2.2fr_1.2fr] gap-2">
                <Link href="/documents" className="border-2 border-emerald-700 bg-emerald-100 p-2 text-center text-[10px] font-bold text-slate-700">
                  ACHATS
                  <span className="mt-2 block border border-slate-300 bg-white px-1 py-1 font-medium">
                    P2P
                  </span>
                </Link>
                <Link href="/documents" className="border-2 border-teal-600 bg-teal-100 p-2 text-center text-[10px] font-bold text-slate-700">
                  AMONT AGRICOLE
                  <span className="mt-2 block border border-slate-300 bg-white px-1 py-1 font-medium">
                    Sourcing
                  </span>
                </Link>
                <Link href="/documents" className="border border-slate-300 bg-white p-2 text-center text-[10px] font-bold text-slate-700">
                  OPERATIONS INDUSTRIELLES
                  <span className="mt-2 grid grid-cols-3 gap-1 font-medium">
                    <span className="border border-slate-300 bg-[#f5f1eb] px-1 py-1">Laiterie</span>
                    <span className="border border-slate-300 bg-[#f5f1eb] px-1 py-1">Packaging</span>
                    <span className="border border-slate-300 bg-[#f5f1eb] px-1 py-1">Qualite</span>
                  </span>
                </Link>
                <Link href="/documents" className="border-4 border-red-500 bg-red-100 p-2 text-center text-[10px] font-bold text-slate-700">
                  COMMERCIAL
                  <span className="mt-2 grid grid-cols-2 gap-1 font-medium">
                    <span className="border border-slate-300 bg-white px-1 py-1">Distribution</span>
                    <span className="border border-slate-300 bg-white px-1 py-1">Offres</span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="col-start-3 border border-slate-300 bg-[#203d72] p-2">
              <div className="mb-2 text-center text-[10px] font-bold uppercase text-white">
                Supply chain
              </div>
              <div className="grid grid-cols-6 gap-2">
                {processLanes[2].blocks.concat(["Gestion des prestataires", "Systeme et planning"]).map((block) => (
                  <Link
                    key={block}
                    href="/documents"
                    className="border border-slate-300 bg-[#f5f1eb] px-2 py-2 text-center text-[10px] font-semibold leading-4 text-slate-700 hover:border-red-500 hover:text-red-700"
                  >
                    {block}
                  </Link>
                ))}
              </div>
            </div>

            <div className="col-start-3">
              <div className="mb-1 text-center text-[10px] font-bold text-slate-700">
                Ressources Humaines
              </div>
              <div className="grid grid-cols-5 gap-2">
                {processLanes[3].blocks.map((block) => (
                  <Link
                    key={block}
                    href="/documents"
                    className="border border-slate-300 bg-[#f5f1eb] px-2 py-2 text-center text-[10px] font-semibold leading-4 text-slate-700 hover:border-red-500 hover:text-red-700"
                  >
                    {block}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ portal?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const activePortal = params.portal === "amelioration" ? "amelioration" : "documentaire";
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

  if (activePortal === "amelioration") {
    return (
      <section id="portail-amelioration">
        <div className="grid gap-11 xl:grid-cols-[380px_1fr]">
          <div className="grid content-start gap-2">
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
              <div className="divide-y divide-red-100 text-[10px] leading-4">
                {taskRows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-1 text-slate-700 hover:bg-red-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </Link>
                ))}
              </div>
            </PortalBox>

            <PortalBox title="Mes enregistrements a traiter ou a suivre">
              <div className="divide-y divide-red-100 text-[10px] leading-4">
                {followRows.map((row) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 px-2 py-1 text-slate-700 hover:bg-red-100"
                  >
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span className="font-semibold">{row.label}</span>
                    <span>{row.value}</span>
                    <FileStack className="h-3 w-3 text-slate-500" />
                  </Link>
                ))}
              </div>
            </PortalBox>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portail-documentaire">
      <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
        <div className="space-y-3">
          <PortalBox title="Documentation par processus">
            <div className="space-y-2 px-3 py-3 text-[10px] leading-4 text-slate-700">
              {documentTree.map((group) => (
                <div key={group.label}>
                  <Link href="/documents" className="font-semibold hover:text-red-700">
                    {group.label}
                  </Link>
                  <ul className="mt-1 space-y-0.5 pl-4">
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
            <div className="divide-y divide-red-100 text-[10px] leading-4">
              {taskRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="flex items-center justify-between px-3 py-1.5 text-slate-700 hover:bg-red-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardCheck className="h-3 w-3 text-red-600" />
                    {row.label}
                  </span>
                  <span>{row.value}</span>
                </Link>
              ))}
            </div>
          </PortalBox>

          <PortalBox title="Mon Bloc Notes" className="min-h-32">
            <div className="p-3 text-[10px] text-slate-500">
              Les notes de suivi apparaissent dans les discussions de chaque dossier.
            </div>
          </PortalBox>
        </div>

        <ProcessMap />
      </div>
    </section>
  );
}
