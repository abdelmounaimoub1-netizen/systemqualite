import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, Circle, ClipboardCheck, FileStack } from "lucide-react";

import cosumarLogo from "@/image/logo.png";
import { getDashboardData } from "@/lib/modules/queries";

const labManagementBlocks = [
  {
    title: "Organisation et systeme de management",
    items: [
      "Politique et objectifs",
      "Roles, Responsabilites, Autorites",
      "Planification",
      "Communication interne"
    ]
  },
  {
    title: "Management de la qualite",
    items: [
      "Analyse et suivi des indicateurs",
      "Amelioration continue",
      "Gestion des risques et opportunites",
      "Mesure de la S.C et fonctionnement du service"
    ]
  }
];

const labRealizationBlocks = [
  {
    title: "Pre-Analytique",
    items: ["Plan de controle", "Prelevements", "Reception", "Enregistrement", "Pretraitement"]
  },
  {
    title: "Analytique",
    items: ["Analyse", "Verification techniques"]
  },
  {
    title: "Post-Analytique",
    items: ["Validation", "Interpretation", "Transmission des resultats"]
  }
];

const labSupportBlocks = [
  {
    title: "Gestion du personnel",
    items: ["Recrutement", "Formation", "Qualification", "Matrice de competence"]
  },
  {
    title: "Maitrise des equipements",
    items: ["Gestion des equipements", "Metrologie"]
  },
  {
    title: "Systeme Documentaire",
    items: ["Manuel Qualite", "Modes operatoires", "Procedures", "Enregistrements", "Instructions"]
  },
  {
    title: "Achats / Sous-traitance",
    items: ["Procedure achat", "Suivi fournisseur", "Gestion des stocks en consommables"]
  },
  {
    title: "Systeme informatique",
    items: ["Validation des logiciels et formules", "Maitrise des donnees"]
  },
  {
    title: "Locaux et E.A",
    items: ["Acces et confidentialite", "N&H", "Securite", "Controle des CA"]
  }
];

const documentTree = [
  { label: "Pilotage", blocks: labManagementBlocks },
  { label: "Realisation", blocks: labRealizationBlocks },
  { label: "Support", blocks: labSupportBlocks }
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
  function actionHref(action: string) {
    if (
      action.startsWith("Nouvelle") ||
      action.startsWith("Nouveau") ||
      action.startsWith("Planification")
    ) {
      return `${href}?new=1`;
    }

    if (action.startsWith("Suivi") || action.startsWith("Calendrier")) {
      return `${href}?view=follow`;
    }

    if (action.startsWith("Historique")) {
      return `${href}?view=history`;
    }

    if (action.startsWith("Rapport")) {
      return `${href}?new=1`;
    }

    return href;
  }

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
          return (
            <Link key={action} href={actionHref(action)} className="flex items-center gap-1.5 hover:text-red-700">
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

function LabCard({
  title,
  items,
  className = ""
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <Link
      href={`/documents?q=${encodeURIComponent(title)}`}
      className={`block rounded-2xl border border-white/60 px-4 py-3 text-center shadow-sm transition hover:scale-[1.01] hover:border-sky-300 ${className}`}
    >
      <div className="text-[11px] font-bold text-white">{title}</div>
      <ul className="mt-2 space-y-0.5 text-left text-[9px] font-semibold leading-3 text-slate-900">
        {items.map((item) => (
          <li key={item}>-{item}</li>
        ))}
      </ul>
    </Link>
  );
}

function LabArrow({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <Link
      href={`/documents?q=${encodeURIComponent(title)}`}
      className="relative flex min-h-28 items-center justify-center bg-[#5a91d0] px-7 py-4 text-white shadow-sm transition hover:bg-[#447dbb]"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 38px) 0, 100% 50%, calc(100% - 38px) 100%, 0 100%, 28px 50%)"
      }}
    >
      <div>
        <div className="text-center text-[11px] font-bold">{title}</div>
        <ul className="mt-3 text-left text-[10px] font-semibold leading-4">
          {items.map((item) => (
            <li key={item}>-{item}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

function VerticalBand({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center px-2 py-3 text-center text-[10px] font-bold text-white ${className}`}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{children}</span>
    </div>
  );
}

function ProcessMap() {
  return (
    <div className="bg-[#efeee7]">
      <div className="mb-3 grid grid-cols-[150px_1fr_150px] items-center gap-3">
        <div className="rounded-sm bg-white px-3 py-2 text-[10px] font-bold text-slate-700 shadow-sm">
          Durrah Sugar Refinery
          <div className="text-[8px] font-semibold text-slate-500">Laboratoire et controle qualite</div>
        </div>
        <div className="border border-slate-400 bg-[#c7d6f4] px-4 py-2 text-center text-xl font-semibold text-slate-900 shadow-sm">
          Fonctionnement normale du laboratoire
        </div>
        <div className="flex min-h-12 items-center justify-center rounded-sm bg-white px-3 py-2 shadow-sm">
          <Image src={cosumarLogo} alt="COSUMAR" className="h-9 w-full object-contain" priority />
        </div>
      </div>

      <div className="mx-auto max-w-[1040px] overflow-x-auto border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative min-w-[930px]">
          <div className="mb-3 flex justify-center">
            <div className="border-4 border-white bg-[#4bb4c7] px-16 py-1 text-center text-xs font-bold uppercase text-slate-900 shadow">
              Cartographie du laboratoire
            </div>
          </div>

          <div className="relative grid grid-cols-[76px_1fr_76px] gap-3">
            <div className="absolute -left-2 top-0 h-24 w-24 rounded-tl-[3rem] border-l-[28px] border-t-[28px] border-[#d8d2ef]" />
            <div className="absolute -right-2 top-0 h-24 w-24 rounded-tr-[3rem] border-r-[28px] border-t-[28px] border-[#d8d2ef]" />
            <div className="absolute -bottom-2 left-0 h-24 w-24 rounded-bl-[3rem] border-b-[28px] border-l-[28px] border-[#d8d2ef]" />
            <div className="absolute -bottom-2 right-0 h-24 w-24 rounded-br-[3rem] border-b-[28px] border-r-[28px] border-[#d8d2ef]" />

            <div className="relative z-10 row-span-3 grid grid-rows-[1fr_auto_1fr] gap-3">
              <div className="flex items-start justify-center pt-8 text-xs font-bold text-slate-600">
                Plan
              </div>
              <VerticalBand className="bg-[#4d87c6]">
                Donnees d&apos;entree : Exigences clients / contrat d&apos;interet
              </VerticalBand>
              <div className="flex items-end justify-center pb-8 text-xs font-bold text-slate-600">
                Act
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="border border-slate-300 bg-[#e3dcf1] p-3">
                <div className="mb-2 text-center text-[10px] font-bold uppercase text-slate-800">
                  Processus de management
                </div>
                <div className="grid grid-cols-2 gap-10 px-10">
                  {labManagementBlocks.map((block) => (
                    <LabCard
                      key={block.title}
                      title={block.title}
                      items={block.items}
                      className="bg-[linear-gradient(#df9298,#bb4048,#e5a1a7)]"
                    />
                  ))}
                </div>
              </div>

              <div className="border border-slate-300 bg-[#dceefa] p-3">
                <div className="mb-2 text-center text-[10px] font-bold uppercase text-slate-800">
                  Processus de realisation
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {labRealizationBlocks.map((block) => (
                    <LabArrow key={block.title} title={block.title} items={block.items} />
                  ))}
                </div>
              </div>

              <div className="bg-[#4d2b74] p-3">
                <div className="mb-2 text-center text-[10px] font-bold uppercase text-slate-950">
                  Processus de support
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {labSupportBlocks.map((block) => (
                    <LabCard
                      key={block.title}
                      title={block.title}
                      items={block.items}
                      className="bg-[linear-gradient(#f0c8c5,#d9949c)]"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 row-span-3 grid grid-rows-[1fr_auto_1fr] gap-3">
              <div className="flex items-start justify-center pt-8 text-xs font-bold text-slate-600">
                DO
              </div>
              <VerticalBand className="bg-[#4d87c6]">
                Donnees de sortie : Satisfaction clients
              </VerticalBand>
              <div className="flex items-end justify-center pb-8 text-xs font-bold text-slate-600">
                Check
              </div>
            </div>
          </div>

          <div className="mt-3 h-8 bg-[linear-gradient(90deg,#10b8dc,#2a408f)]" />
          <div className="absolute right-14 top-14 rounded-full bg-[#edc4cb] px-5 py-4 text-center text-[10px] font-bold text-slate-700 shadow-sm">
            Amelioration
            <br />
            Continue
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
                  <ul className="mt-1 space-y-1 pl-4">
                    {group.blocks.map((block) => (
                      <li key={block.title}>
                        <Link
                          href={`/documents?q=${encodeURIComponent(block.title)}`}
                          className="font-medium hover:text-red-700"
                        >
                          {block.title}
                        </Link>
                        <ul className="mt-0.5 space-y-0.5 pl-3 text-[9px] leading-3 text-slate-500">
                          {block.items.map((item) => (
                            <li key={item}>
                              <Link href={`/documents?q=${encodeURIComponent(item)}`} className="hover:text-red-700">
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
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
