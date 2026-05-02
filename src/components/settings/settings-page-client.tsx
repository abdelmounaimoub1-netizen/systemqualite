"use client";

import { useMemo, useState } from "react";
import { Send, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { canInviteUsers, canManageSettings, canViewAuditTrail } from "@/lib/permissions";
import { settingsTableConfigs } from "@/lib/modules/config";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { RecordForm } from "@/components/modules/record-form";
import { RecordTable } from "@/components/modules/record-table";
import { StatusBadge } from "@/components/ui/badge";
import type { LookupCollection, SettingsData, UserContext } from "@/types/app";

type SettingsPageClientProps = {
  context: UserContext;
  settings: SettingsData;
  lookups: LookupCollection;
  appSettings: Array<Record<string, unknown>>;
  auditTrail: Array<Record<string, unknown>>;
};

type SectionKey = keyof typeof settingsTableConfigs;

function toSectionRecords(
  key: SectionKey,
  settings: SettingsData,
  appSettings: Array<Record<string, unknown>>
) {
  if (key === "app_settings") return appSettings;
  if (key === "document_categories") return settings.categories as Array<Record<string, unknown>>;
  return settings[key as keyof SettingsData] as Array<Record<string, unknown>>;
}

export function SettingsPageClient({
  context,
  settings,
  lookups,
  appSettings,
  auditTrail
}: SettingsPageClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    role_id: "",
    department_id: "",
    job_title: ""
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  const canManage = canManageSettings(context.role);
  const canInvite = canInviteUsers(context.role);
  const canAudit = canViewAuditTrail(context.role);

  const sectionSummaries = useMemo(
    () => [
      {
        label: "Utilisateurs",
        value: settings.profiles.length,
        icon: Users
      },
      {
        label: "Roles",
        value: settings.roles.length,
        icon: Shield
      },
      {
        label: "Departements",
        value: settings.departments.length,
        icon: Users
      }
    ],
    [settings.departments.length, settings.profiles.length, settings.roles.length]
  );

  async function saveRecord(section: SectionKey, values: Record<string, unknown>) {
    const config = settingsTableConfigs[section];
    const payload =
      section === "app_settings" && typeof values.setting_value !== "string"
        ? {
            ...values,
            setting_value: JSON.stringify(values.setting_value ?? {}, null, 2)
          }
        : values;

    const response = await fetch(`/api/records/${config.table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: editing?.id,
        values: payload
      })
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(result.error ?? "Impossible d'enregistrer cet element.");
      return;
    }

    toast.success(`${config.label} mis a jour.`);
    setActiveSection(null);
    setEditing(null);
    router.refresh();
  }

  async function deleteRecord(section: SectionKey, record: Record<string, unknown>) {
    if (!window.confirm("Supprimer cet element ?")) return;

    const response = await fetch(`/api/records/${settingsTableConfigs[section].table}/${record.id}`, {
      method: "DELETE"
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(result.error ?? "Impossible de supprimer cet element.");
      return;
    }

    toast.success("Element supprime.");
    router.refresh();
  }

  async function inviteUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendingInvite(true);

    const response = await fetch("/api/users/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...inviteForm,
        role_id: inviteForm.role_id || null,
        department_id: inviteForm.department_id || null,
        job_title: inviteForm.job_title || null
      })
    });
    const result = (await response.json()) as { error?: string };
    setSendingInvite(false);

    if (!response.ok) {
      toast.error(result.error ?? "Impossible d'envoyer l'invitation.");
      return;
    }

    toast.success("Invitation envoyee.");
    setInviteForm({
      full_name: "",
      email: "",
      role_id: "",
      department_id: "",
      job_title: ""
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Reglages"
        description="Gerez les donnees de reference, utilisateurs, roles, categories documentaires et la configuration de QMS Pro."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {sectionSummaries.map((summary) => {
          const Icon = summary.icon;
          return (
            <Card key={summary.label}>
              <div className="inline-flex rounded-2xl bg-brand/10 p-3 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm text-slate-500">{summary.label}</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{summary.value}</div>
            </Card>
          );
        })}
      </div>

      {canInvite ? (
        <Card>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-ink">Inviter un nouvel utilisateur</h2>
            <p className="mt-1 text-sm text-slate-500">
              Creez un compte avec le bon role et le bon departement des le depart.
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={inviteUser}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Nom complet</label>
              <Input
                required
                value={inviteForm.full_name}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, full_name: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
              <Input
                type="email"
                required
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Role</label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                value={inviteForm.role_id}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, role_id: event.target.value }))
                }
              >
                <option value="">Selectionner un role</option>
                {lookups.roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Departement</label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                value={inviteForm.department_id}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, department_id: event.target.value }))
                }
              >
                <option value="">Selectionner un departement</option>
                {lookups.departments?.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">Fonction</label>
              <Input
                value={inviteForm.job_title}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, job_title: event.target.value }))
                }
                placeholder="Ingenieur qualite"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={sendingInvite}>
                <Send className="h-4 w-4" />
                {sendingInvite ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {canManage ? (
        <div className="space-y-6">
          {(Object.entries(settingsTableConfigs) as Array<[SectionKey, (typeof settingsTableConfigs)[SectionKey]]>).map(
            ([sectionKey, sectionConfig]) => {
              const records = toSectionRecords(sectionKey, settings, appSettings);
              const isProfilesSection = sectionKey === "profiles";
              return (
                <Card key={sectionKey} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-ink">{sectionConfig.label}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {sectionKey === "profiles"
                          ? "Gerez les utilisateurs invites. Utilisez le formulaire ci-dessus pour creer de nouveaux comptes."
                          : "Gerez les donnees de reference partagees dans QMS Pro."}
                      </p>
                    </div>
                    {!isProfilesSection ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(null);
                          setActiveSection(sectionKey);
                        }}
                      >
                        Ajouter
                      </Button>
                    ) : null}
                  </div>

                  <RecordTable
                    columns={sectionConfig.columns}
                    records={records}
                    lookups={lookups}
                    onEdit={(record) => {
                      setEditing(record);
                      setActiveSection(sectionKey);
                    }}
                    onDelete={
                      isProfilesSection ? undefined : (record) => deleteRecord(sectionKey, record)
                    }
                  />
                </Card>
              );
            }
          )}
        </div>
      ) : (
        <Card>
          <h2 className="text-xl font-semibold text-ink">Acces limite</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Votre role est <strong>{ROLE_LABELS[context.role]}</strong>. Les reglages administratifs sont reserves aux admins et responsables qualite.
          </p>
        </Card>
      )}

      {canAudit ? (
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Journal d'audit recent</h2>
            <p className="mt-1 text-sm text-slate-500">
              Les 12 dernieres actions tracees dans l'espace QMS Pro.
            </p>
          </div>
          <div className="space-y-3">
            {auditTrail.map((entry) => (
              <div
                key={String(entry.id)}
                className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={String(entry.action_type ?? "")} />
                    <span className="font-medium text-ink">{String(entry.table_name ?? "")}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    Enregistrement {String(entry.record_id ?? "")}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(String(entry.created_at ?? "")).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {activeSection ? (
        <Modal
          open
          onClose={() => {
            setActiveSection(null);
            setEditing(null);
          }}
          title={editing ? `Modifier ${settingsTableConfigs[activeSection].label}` : `Ajouter ${settingsTableConfigs[activeSection].label}`}
          description="Ces changements affectent le comportement partage et les donnees de reference."
        >
          <RecordForm
            key={`${activeSection}-${editing ? String(editing.id ?? "edit") : "new"}`}
            fields={settingsTableConfigs[activeSection].fields}
            lookups={lookups}
            initialValues={
              activeSection === "app_settings" && editing
                ? {
                    ...editing,
                    setting_value: JSON.stringify(editing.setting_value ?? {}, null, 2)
                  }
                : editing ?? {}
            }
            onSubmit={(values) => saveRecord(activeSection, values)}
            onCancel={() => {
              setActiveSection(null);
              setEditing(null);
            }}
            submitLabel={editing ? "Enregistrer" : "Creer"}
          />
        </Modal>
      ) : null}
    </div>
  );
}
