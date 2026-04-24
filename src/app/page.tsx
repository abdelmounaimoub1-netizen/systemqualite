import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  Gauge,
  LayoutGrid,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SolutionHref = "/documents" | "/forms" | "/workflows" | "/dashboard";

const solutionBlocks: Array<{
  title: string;
  text: string;
  href: SolutionHref;
  icon: typeof FileStack;
}> = [
  {
    title: "GED documentaire",
    text: "Creation, validation, diffusion, versioning et archivage des documents maitrises.",
    href: "/documents",
    icon: FileStack
  },
  {
    title: "Formulaires",
    text: "Modeles de formulaires, saisies terrain, notifications et suivi des actions.",
    href: "/forms",
    icon: ClipboardList
  },
  {
    title: "Workflow BPM",
    text: "Etapes, acteurs, validations, delais et historique pour chaque processus.",
    href: "/workflows",
    icon: Sparkles
  },
  {
    title: "Tableaux de bord",
    text: "Indicateurs, risques, alertes, audit trail et vision temps reel du systeme.",
    href: "/dashboard",
    icon: Gauge
  }
];

const qmsPack = [
  "Non-conformites",
  "Actions CAPA",
  "Audits",
  "Risques",
  "Formations",
  "Fournisseurs"
];

const portalMenu = [
  { label: "GED", icon: FileStack },
  { label: "Formulaires", icon: ClipboardList },
  { label: "Workflow", icon: Sparkles },
  { label: "Dashboard", icon: LayoutGrid }
];

const liveRows = [
  ["DOC-014", "Procedure de liberation", "Validation", "Amina"],
  ["FRM-NC-001", "Fiche non-conformite", "Actif", "Marco"],
  ["AUD-2026-03", "Audit packaging", "Planifie", "Elena"]
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-mesh-grid text-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                Suite QMS
              </span>
              <span className="block text-xl font-semibold">{APP_NAME}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#solutions" className="hover:text-brand">
              Solutions
            </a>
            <a href="#pack-qms" className="hover:text-brand">
              Pack QMS
            </a>
            <a href="#pilotage" className="hover:text-brand">
              Pilotage
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in">
              <Button variant="secondary">Connexion</Button>
            </Link>
            <Link href="/auth/sign-up" className="hidden sm:block">
              <Button>Demarrer</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand shadow-card">
            <ShieldCheck className="h-4 w-4" />
            ISO 9001, documents, workflows, indicateurs
          </div>
          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
            Le systeme qualite que votre equipe peut vraiment piloter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Une plateforme QMS inspiree des suites Qualios: GED, formulaires, workflows,
            tableaux de bord, non-conformites, CAPA, audits, risques, formations et alertes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/sign-up">
              <Button className="px-5 py-3">
                Lancer le portail
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="secondary" className="px-5 py-3">
                Ouvrir la demo
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["50k+", "utilisateurs cible"],
              ["12", "pays suivis"],
              ["96%", "satisfaction visee"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-card">
                <div className="text-2xl font-semibold text-ink">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="pilotage" className="relative">
          <div className="absolute -left-4 top-8 hidden h-24 w-24 rounded-full bg-accent/25 blur-3xl lg:block" />
          <Card className="relative overflow-hidden p-0">
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Portail qualite
                  </div>
                  <div className="mt-1 text-2xl font-semibold">Vue operationnelle</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-slate-200">
                  <BellRing className="h-4 w-4 text-cyan-200" />
                  8 actions en attente
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
              <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
                {portalMenu.map(({ label, icon: MenuIcon }) => {
                  return (
                    <div
                      key={label}
                      className="mb-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      <MenuIcon className="h-4 w-4 text-brand" />
                      {label}
                    </div>
                  );
                })}
              </aside>

              <div className="space-y-5 bg-white p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["48", "Documents actifs"],
                    ["11", "NC ouvertes"],
                    ["7", "Audits a venir"]
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-2xl font-semibold">{value}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[1fr_1fr_0.8fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <span>Code</span>
                    <span>Objet</span>
                    <span>Etat</span>
                    <span>Pilote</span>
                  </div>
                  {liveRows.map(([code, title, state, owner]) => (
                    <div
                      key={code}
                      className="grid grid-cols-[1fr_1fr_0.8fr_0.7fr] border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
                    >
                      <span className="font-semibold text-brand">{code}</span>
                      <span className="truncate text-slate-700">{title}</span>
                      <span className="text-slate-600">{state}</span>
                      <span className="text-slate-600">{owner}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {["Creer", "Valider", "Diffuser"].map((step, index) => (
                    <div key={step} className="rounded-2xl bg-accent/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        0{index + 1}. {step}
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${75 - index * 15}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              Performance et suivi
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
              Les blocs fonctionnels essentiels.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-500">
            Chaque bloc est relie aux droits, aux pieces jointes, aux commentaires et a
            un audit trail pour garder la tracabilite.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {solutionBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Link key={block.title} href={block.href}>
                <Card className="h-full transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{block.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{block.text}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="pack-qms" className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <Card className="bg-slate-950 text-white">
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Pack QMS
          </div>
          <h2 className="mt-5 text-3xl font-semibold">Pret pour ISO 9001.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Le pack regroupe les formulaires, tableaux de bord, alertes et plans d action
            necessaires pour suivre le cycle d amelioration continue.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
            <LockKeyhole className="h-5 w-5 text-cyan-200" />
            <span className="text-sm text-slate-200">Droits par role, intranet/extranet et trace complete.</span>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qmsPack.map((item) => (
            <Card key={item} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-ink">{item}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <Card className="grid gap-6 bg-white/90 md:grid-cols-3">
          <div className="flex gap-4">
            <UsersRound className="h-6 w-6 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold">Equipe impliquee</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Chaque collaborateur voit ses taches, validations et rappels.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <BellRing className="h-6 w-6 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold">Alertes automatiques</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Echeances, revues documentaires, CAPA et audits remontent au bon moment.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Gauge className="h-6 w-6 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold">Indicateurs clairs</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Les KPI donnent une vision directe des blocages, risques et progres.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
