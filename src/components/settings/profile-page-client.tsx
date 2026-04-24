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
      toast.error(result.error ?? "Unable to update profile.");
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User profile"
        title={context.profile?.full_name ?? context.email}
        description="Keep your role context, contact details, and department assignment current so ownership stays clear across the QMS."
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
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Department</div>
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
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Job title</div>
                <div className="text-sm font-medium text-ink">
                  {context.profile?.job_title ?? "Not set"}
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
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</div>
                <div className="text-sm font-medium text-ink">
                  {context.profile?.phone ?? "Not set"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Full name</label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, full_name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Job title</label>
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
                <label className="mb-2 block text-sm font-medium text-slate-600">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Supplier company</label>
                <Input
                  value={form.supplier_company}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, supplier_company: event.target.value }))
                  }
                  placeholder="For supplier viewers or external collaborators"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
