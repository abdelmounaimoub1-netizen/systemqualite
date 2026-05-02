"use client";

import { useState } from "react";
import { Building2, BriefcaseBusiness, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { getLookupLabel } from "@/lib/modules/config";
import type { LookupCollection, UserContext } from "@/types/app";

export function ProfilePageClient({
  context,
  lookups
}: {
  context: UserContext;
  lookups: LookupCollection;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: context.profile?.full_name ?? "",
    job_title: context.profile?.job_title ?? "",
    phone: context.profile?.phone ?? "",
    supplier_company: context.profile?.supplier_company ?? ""
  });

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: form
      })
    });
    const result = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      toast.error(result.error ?? "Impossible de mettre a jour le profil.");
      return;
    }

    toast.success("Profil mis a jour.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profil utilisateur"
        title={context.profile?.full_name ?? context.email}
        description="Gardez votre role, vos coordonnees et votre departement a jour pour clarifier les responsabilites dans le QMS."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">
              {initials(context.profile?.full_name ?? context.email)}
            </div>
            <div>
              <div className="text-xl font-semibold text-ink">
                {context.profile?.full_name ?? context.email}
              </div>
              <div className="mt-1 text-sm text-slate-500">{context.email}</div>
            </div>
          </div>
          <StatusBadge value={ROLE_LABELS[context.role]} />
          <div className="grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Building2 className="h-4 w-4 text-brand" />
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Departement</div>
                <div className="text-sm font-medium text-ink">
                  {getLookupLabel(
                    lookups,
                    "departments",
                    context.profile?.department_id ?? undefined
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <BriefcaseBusiness className="h-4 w-4 text-brand" />
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Fonction</div>
                <div className="text-sm font-medium text-ink">
                  {context.profile?.job_title ?? "Non renseigne"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Mail className="h-4 w-4 text-brand" />
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</div>
                <div className="text-sm font-medium text-ink">{context.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Phone className="h-4 w-4 text-brand" />
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Telephone</div>
                <div className="text-sm font-medium text-ink">
                  {context.profile?.phone ?? "Non renseigne"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Nom complet</label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, full_name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Fonction</label>
                <Input
                  value={form.job_title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, job_title: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Telephone</label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Societe fournisseur</label>
                <Input
                  value={form.supplier_company}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, supplier_company: event.target.value }))
                  }
                  placeholder="Pour les lecteurs fournisseurs ou collaborateurs externes"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer le profil"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
