import Link from "next/link";
import {
  BellRing,
  ClipboardCheck,
  FileStack,
  Gauge,
  ShieldCheck,
  Smartphone
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Controlled documents",
    description: "Versioning, review dates, owners, and approvals in one traceable place.",
    icon: FileStack
  },
  {
    title: "Audit-ready execution",
    description: "Plan audits, track findings, follow CAPA, and surface the next due action.",
    icon: ClipboardCheck
  },
  {
    title: "Risk and reminders",
    description: "Auto-scored risks and in-app notifications keep follow-up moving without spreadsheets.",
    icon: Gauge
  },
  {
    title: "Installable anywhere",
    description: "QMS Pro works as a PWA on mobile, desktop, and browser with offline shell support.",
    icon: Smartphone
  }
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-mesh-grid px-6 py-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-card backdrop-blur-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              Installable QMS PWA
            </div>
            <div className="text-2xl font-semibold text-ink">{APP_NAME}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in">
              <Button variant="secondary">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Launch MVP</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand shadow-card">
              <ShieldCheck className="h-4 w-4" />
              Original branding, quality-native workflows
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl">
              The quality system your team can actually use on the floor.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              QMS Pro is a complete quality management workspace for controlled documents, workflows, non-conformities, CAPA, audits, risk, training, equipment, suppliers, and alerts.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/auth/sign-up">
                <Button className="px-6 py-3">
                  Start with the demo-ready app
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button variant="secondary" className="px-6 py-3">
                  Open sign in
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] p-0">
            <div className="bg-slate-950 p-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <BellRing className="h-4 w-4" />
                Live operating view
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["48", "Documents"],
                  ["11", "Open issues"],
                  ["7", "Upcoming audits"],
                  ["18", "Pending actions"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl bg-white/10 p-5">
                    <div className="text-3xl font-semibold">{value}</div>
                    <div className="mt-1 text-sm text-slate-300">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-3xl bg-slate-50 p-5">
                    <div className="inline-flex rounded-2xl bg-brand/10 p-3 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-lg font-semibold text-ink">{feature.title}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
