"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Mail,
  Plus,
  Save,
  Send,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { ChildRecordsSection } from "@/components/modules/child-records-section";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { canWriteModule } from "@/lib/permissions";
import { cn, formatDate } from "@/lib/utils";
import { getLookupLabel } from "@/lib/modules/config";
import type {
  ChildModuleConfig,
  LookupCollection,
  SerializableModuleConfig,
  UserContext
} from "@/types/app";

type CustomerComplaintWorkflowClientProps = {
  context: UserContext;
  config: SerializableModuleConfig;
  record: Record<string, unknown>;
  lookups: LookupCollection;
  childrenData: Record<string, Array<Record<string, unknown>>>;
};

const inputClass =
  "h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-800 shadow-sm outline-none focus:border-teal-700";
const textareaClass =
  "min-h-20 w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-teal-700";

function fieldValue(values: Record<string, unknown>, key: string) {
  const value = values[key];
  return value === null || value === undefined ? "" : String(value);
}

function SectionTitle({
  step,
  title
}: {
  step: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-300 bg-slate-100 px-3 py-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-500">
        <ClipboardCheck className="h-4 w-4" />
      </span>
      <h2 className="text-xl font-medium text-slate-800">
        {step} {title}
      </h2>
    </div>
  );
}

function Field({
  label,
  children,
  wide
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={cn("grid gap-1 text-xs font-semibold text-slate-700", wide ? "md:col-span-2" : "")}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function WorkflowCard({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">{children}</section>;
}

function ActionIconButton({
  label,
  icon: Icon,
  onClick,
  disabled
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded bg-teal-700 text-white shadow-sm transition hover:bg-teal-800 disabled:bg-slate-300"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RadioGroup({
  label,
  name,
  value,
  options,
  onChange
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
      <span className="font-semibold">{label}</span>
      {options.map((option) => (
        <label key={option} className="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-3.5 w-3.5 text-teal-700"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

export function CustomerComplaintWorkflowClient({
  context,
  config,
  record,
  lookups,
  childrenData
}: CustomerComplaintWorkflowClientProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(record);
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteModule(context.role, config.slug);

  const actionConfig = config.childModules?.find(
    (child) => child.key === "customer-complaint-actions"
  ) as ChildModuleConfig | undefined;
  const attachmentConfig = config.childModules?.find(
    (child) => child.key === "attachments-customer_complaints"
  ) as ChildModuleConfig | undefined;
  const commentConfig = config.childModules?.find(
    (child) => child.key === "comments-customer_complaints"
  ) as ChildModuleConfig | undefined;

  const actionRecords = useMemo(
    () => childrenData["customer-complaint-actions"] ?? [],
    [childrenData]
  );
  const actionSummary = useMemo(() => {
    const done = actionRecords.filter((action) => action.progress_status === "Done").length;
    const cost = actionRecords.reduce((total, action) => {
      const numeric = Number(action.estimated_cost ?? 0);
      return Number.isNaN(numeric) ? total : total + numeric;
    }, 0);

    return {
      total: actionRecords.length,
      done,
      cost
    };
  }, [actionRecords]);

  function setField(key: string, value: string | number | null) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function saveComplaint(
    message = "Reclamation enregistree.",
    overrides: Record<string, unknown> = {}
  ) {
    if (!canWrite) return;
    setSaving(true);

    try {
      const response = await fetch("/api/records/customer_complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: record.id,
          values: {
            ...values,
            ...overrides,
            estimated_cost_total: actionSummary.cost
          }
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save complaint.");
      }

      toast.success(message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function createCorrectiveAction() {
    if (!canWrite) return;

    const response = await fetch("/api/records/capa_actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: {
          title: `Action corrective - ${fieldValue(values, "reference")}`,
          action_type: "Corrective",
          description: fieldValue(values, "ineffective_reason") || fieldValue(values, "description"),
          responsible_user_id: values.responsible_user_id ?? context.userId,
          deadline: values.measurement_deadline || values.due_date || null,
          priority: values.severity ?? "Medium",
          status: "Open",
          effectiveness_check: "Cree depuis la verification de reclamation client."
        }
      })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "Action corrective non creee.");
      return;
    }

    toast.success("Action corrective creee.");
    router.refresh();
  }

  const profileOptions = lookups.profiles ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-center text-xl font-semibold text-slate-900 md:text-left">
            Formulaire de suivi des reclamations client
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>Affiliation</span>
            <span className="rounded bg-slate-100 px-3 py-1 font-semibold text-slate-900">
              {fieldValue(values, "affiliation") || fieldValue(values, "reference")}
            </span>
            <StatusBadge value={String(values.status ?? "Open")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/customer-complaints">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <Button onClick={() => void saveComplaint()} disabled={!canWrite || saving}>
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      <WorkflowCard>
        <SectionTitle step="1/4" title="Declaration de la reclamation client" />

        <div className="space-y-4 p-3">
          <div className="grid gap-3 bg-yellow-50/70 p-3 md:grid-cols-2">
            <Field label="Affiliation">
              <input
                className={inputClass}
                value={fieldValue(values, "affiliation")}
                onChange={(event) => setField("affiliation", event.target.value)}
              />
            </Field>
            <Field label="Agent">
              <select
                className={inputClass}
                value={fieldValue(values, "agent_id")}
                onChange={(event) => setField("agent_id", event.target.value || null)}
              >
                <option value="">Select...</option>
                {profileOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Declarant">
              <input
                className={inputClass}
                value={fieldValue(values, "declarant_name")}
                onChange={(event) => setField("declarant_name", event.target.value)}
              />
            </Field>
            <Field label="Client">
              <input
                className={inputClass}
                value={fieldValue(values, "customer_name")}
                onChange={(event) => setField("customer_name", event.target.value)}
              />
            </Field>
            <Field label="Secteur">
              <input
                className={inputClass}
                value={fieldValue(values, "client_sector")}
                onChange={(event) => setField("client_sector", event.target.value)}
              />
            </Field>
            <Field label="Canal distributeur">
              <input
                className={inputClass}
                value={fieldValue(values, "distributor_channel")}
                onChange={(event) => setField("distributor_channel", event.target.value)}
              />
            </Field>
            <Field label="Typologie client">
              <input
                className={inputClass}
                value={fieldValue(values, "client_typology")}
                onChange={(event) => setField("client_typology", event.target.value)}
              />
            </Field>
            <Field label="Pays / Ville">
              <input
                className={inputClass}
                value={fieldValue(values, "country_city")}
                onChange={(event) => setField("country_city", event.target.value)}
              />
            </Field>
            <Field label="Contact">
              <input
                className={inputClass}
                value={fieldValue(values, "contact_name")}
                onChange={(event) => setField("contact_name", event.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tel">
                <input
                  className={inputClass}
                  value={fieldValue(values, "phone")}
                  onChange={(event) => setField("phone", event.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className={inputClass}
                  value={fieldValue(values, "contact_email")}
                  onChange={(event) => setField("contact_email", event.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="space-y-3 bg-red-50 p-3">
            <RadioGroup
              label="Type de reclamation"
              name="complaint_type"
              value={fieldValue(values, "complaint_type") || "Produit"}
              options={["Produit", "Service", "Autre"]}
              onChange={(value) => setField("complaint_type", value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Objet" wide>
                <input
                  className={inputClass}
                  value={fieldValue(values, "object_summary")}
                  onChange={(event) => setField("object_summary", event.target.value)}
                />
              </Field>
              <Field label="Date de reclamation">
                <input
                  type="date"
                  className={inputClass}
                  value={fieldValue(values, "received_date")}
                  onChange={(event) => setField("received_date", event.target.value || null)}
                />
              </Field>
              <Field label="Date achat/livraison">
                <input
                  type="date"
                  className={inputClass}
                  value={fieldValue(values, "purchase_delivery_date")}
                  onChange={(event) => setField("purchase_delivery_date", event.target.value || null)}
                />
              </Field>
              <Field label="Categorie de RC">
                <input
                  className={inputClass}
                  value={fieldValue(values, "complaint_category")}
                  onChange={(event) => setField("complaint_category", event.target.value)}
                />
              </Field>
              <Field label="Origine">
                <input
                  className={inputClass}
                  value={fieldValue(values, "origin")}
                  onChange={(event) => setField("origin", event.target.value)}
                />
              </Field>
              <Field label="Gamme / marque produit">
                <input
                  className={inputClass}
                  value={fieldValue(values, "brand")}
                  onChange={(event) => setField("brand", event.target.value)}
                />
              </Field>
              <Field label="Produit concerne">
                <input
                  className={inputClass}
                  value={fieldValue(values, "product_name") || fieldValue(values, "product_reference")}
                  onChange={(event) => {
                    setField("product_name", event.target.value);
                    setField("product_reference", event.target.value);
                  }}
                />
              </Field>
              <Field label="Numero du lot">
                <input
                  className={inputClass}
                  value={fieldValue(values, "lot_number")}
                  onChange={(event) => setField("lot_number", event.target.value)}
                />
              </Field>
              <Field label="Date de production">
                <input
                  type="date"
                  className={inputClass}
                  value={fieldValue(values, "production_date")}
                  onChange={(event) => setField("production_date", event.target.value || null)}
                />
              </Field>
              <Field label="Date d'expiration">
                <input
                  type="date"
                  className={inputClass}
                  value={fieldValue(values, "expiry_date")}
                  onChange={(event) => setField("expiry_date", event.target.value || null)}
                />
              </Field>
              <Field label="Quantite">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={fieldValue(values, "quantity")}
                  onChange={(event) =>
                    setField("quantity", event.target.value ? Number(event.target.value) : null)
                  }
                />
              </Field>
              <Field label="Description" wide>
                <textarea
                  className={textareaClass}
                  value={fieldValue(values, "description")}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </Field>
              <Field label="Actions immediates" wide>
                <textarea
                  className={textareaClass}
                  value={fieldValue(values, "immediate_actions")}
                  onChange={(event) => setField("immediate_actions", event.target.value)}
                />
              </Field>
            </div>
          </div>

          {attachmentConfig ? (
            <ChildRecordsSection
              config={attachmentConfig}
              records={childrenData[attachmentConfig.key] ?? []}
              lookups={lookups}
              role={context.role}
              parentId={String(record.id)}
            />
          ) : null}

          <div className="space-y-3 border-t border-slate-300 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Transmission pour orientation</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Destinataire pour traitement">
                <input
                  className={inputClass}
                  value={fieldValue(values, "orientation_recipient")}
                  onChange={(event) => setField("orientation_recipient", event.target.value)}
                />
              </Field>
              <Field label="Destinataires pour information">
                <input
                  className={inputClass}
                  value={fieldValue(values, "information_recipients")}
                  onChange={(event) => setField("information_recipients", event.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-center gap-3">
              <ActionIconButton
                label="Enregistrer"
                icon={Save}
                disabled={saving}
                onClick={() => void saveComplaint("Declaration enregistree.")}
              />
              <ActionIconButton
                label="Notifier"
                icon={Mail}
                disabled={saving}
                onClick={() => void saveComplaint("Transmission enregistree.")}
              />
            </div>
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="2/4" title="Orientation de la reclamation client" />
        <div className="space-y-4 p-3">
          <div className="bg-red-50 px-3 py-3">
            <RadioGroup
              label="Que voulez faire de cette reclamation ?"
              name="orientation_decision"
              value={fieldValue(values, "orientation_decision") || "Traiter"}
              options={["Traiter", "Modifier", "Cloturer"]}
              onChange={(value) => setField("orientation_decision", value)}
            />
          </div>
          <div className="flex justify-center gap-3">
            <ActionIconButton
              label="Enregistrer orientation"
              icon={Save}
              disabled={saving}
              onClick={() => void saveComplaint("Orientation enregistree.")}
            />
            <ActionIconButton
              label="Envoyer pour traitement"
              icon={Send}
              disabled={saving}
              onClick={() => void saveComplaint("Orientation transmise.")}
            />
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="3/4" title="Traitement de la reclamation client" />
        <div className="space-y-4 p-3">
          <Field label="Origine du probleme" wide>
            <textarea
              className={textareaClass}
              value={fieldValue(values, "problem_origin")}
              onChange={(event) => setField("problem_origin", event.target.value)}
            />
          </Field>

          <div className="overflow-hidden rounded border border-slate-300">
            <div className="grid grid-cols-[1fr_1.4fr_0.8fr_0.8fr_1.1fr_0.8fr] bg-teal-900 px-3 py-2 text-xs font-semibold text-white">
              <span>Pilote</span>
              <span>Action</span>
              <span>Deadline</span>
              <span>Date realisation</span>
              <span>Commentaire</span>
              <span>Avancement</span>
            </div>
            {actionRecords.length === 0 ? (
              <div className="px-3 py-5 text-sm text-slate-500">Aucune action planifiee.</div>
            ) : (
              actionRecords.map((action) => (
                <div
                  key={String(action.id)}
                  className="grid grid-cols-[1fr_1.4fr_0.8fr_0.8fr_1.1fr_0.8fr] border-t border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <span>{getLookupLabel(lookups, "profiles", String(action.pilot_id ?? ""))}</span>
                  <span>{String(action.action ?? "")}</span>
                  <span>{formatDate(String(action.deadline ?? ""))}</span>
                  <span>{formatDate(String(action.completion_date ?? ""))}</span>
                  <span>{String(action.comment ?? "")}</span>
                  <span>
                    <StatusBadge value={String(action.progress_status ?? "Open")} />
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="text-sm text-slate-700">
              Nombre d&apos;actions a realiser: <strong>{actionSummary.total}</strong>
            </div>
            <div className="text-sm text-slate-700">
              Nombre d&apos;actions realisees: <strong>{actionSummary.done}</strong>
            </div>
          </div>

          {actionConfig ? (
            <ChildRecordsSection
              config={actionConfig}
              records={actionRecords}
              lookups={lookups}
              role={context.role}
              parentId={String(record.id)}
            />
          ) : null}

          <div className="space-y-3 border-t border-slate-300 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Transmission pour verification et cloture</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Destinataire pour verification et cloture">
                <input
                  className={inputClass}
                  value={fieldValue(values, "verification_recipient")}
                  onChange={(event) => setField("verification_recipient", event.target.value)}
                />
              </Field>
              <Field label="Destinataires pour information">
                <input
                  className={inputClass}
                  value={fieldValue(values, "closure_recipients")}
                  onChange={(event) => setField("closure_recipients", event.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-center gap-3">
              <ActionIconButton
                label="Enregistrer traitement"
                icon={Save}
                disabled={saving}
                onClick={() => void saveComplaint("Traitement enregistre.")}
              />
              <ActionIconButton
                label="Transmettre"
                icon={Mail}
                disabled={saving}
                onClick={() => void saveComplaint("Verification transmise.")}
              />
            </div>
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="4/4" title="Verification et Cloture de la reclamation client" />
        <div className="space-y-4 p-3">
          <RadioGroup
            label="Les actions entreprises sont-elles efficaces ?"
            name="actions_effective"
            value={fieldValue(values, "actions_effective") || "Oui"}
            options={["Oui", "Non", "A mesurer"]}
            onChange={(value) => setField("actions_effective", value)}
          />

          <Field label="Criteres d'efficacite" wide>
            <textarea
              className={textareaClass}
              value={fieldValue(values, "effectiveness_criteria")}
              onChange={(event) => setField("effectiveness_criteria", event.target.value)}
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Date de cloture">
              <input
                type="date"
                className={inputClass}
                value={fieldValue(values, "closure_date")}
                onChange={(event) => setField("closure_date", event.target.value || null)}
              />
            </Field>
            <Field label="Cout total estime">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={fieldValue(values, "estimated_cost_total") || String(actionSummary.cost)}
                onChange={(event) =>
                  setField(
                    "estimated_cost_total",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              />
            </Field>
          </div>

          <div className="overflow-hidden rounded border border-slate-300">
            <div className="grid grid-cols-[1.4fr_0.8fr] bg-teal-900 px-3 py-2 text-xs font-semibold text-white">
              <span>Actions entreprises</span>
              <span>Cout estime</span>
            </div>
            {actionRecords.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500">Aucun resultat.</div>
            ) : (
              actionRecords.map((action) => (
                <div
                  key={String(action.id)}
                  className="grid grid-cols-[1.4fr_0.8fr] border-t border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <span>{String(action.action ?? "")}</span>
                  <span>{String(action.estimated_cost ?? "0")}</span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t border-slate-300 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">A mesurer</h3>
            <Field label="Motif" wide>
              <input
                className={inputClass}
                value={fieldValue(values, "measurement_reason")}
                onChange={(event) => setField("measurement_reason", event.target.value)}
              />
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                className={inputClass}
                value={fieldValue(values, "measurement_deadline")}
                onChange={(event) => setField("measurement_deadline", event.target.value || null)}
              />
            </Field>
          </div>

          <div className="space-y-3 border-t border-slate-300 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Actions non efficaces</h3>
            <Field label="Motif" wide>
              <input
                className={inputClass}
                value={fieldValue(values, "ineffective_reason")}
                onChange={(event) => setField("ineffective_reason", event.target.value)}
              />
            </Field>
            <Button variant="danger" onClick={() => void createCorrectiveAction()} disabled={saving}>
              <Plus className="h-4 w-4" />
              Creer une action corrective
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-300 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-500">
              Suivi par {context.profile?.full_name ?? context.email} - {formatDate(String(values.updated_at ?? ""))}
            </div>
            <div className="flex justify-center gap-3">
              <ActionIconButton
                label="Cloturer"
                icon={CheckCircle2}
                disabled={saving}
                onClick={() => {
                  setField("status", "Closed");
                  void saveComplaint("Reclamation cloturee.", { status: "Closed" });
                }}
              />
              <ActionIconButton
                label="Non efficace"
                icon={XCircle}
                disabled={saving}
                onClick={() => {
                  setField("actions_effective", "Non");
                  void saveComplaint("Verification enregistree.", { actions_effective: "Non" });
                }}
              />
            </div>
          </div>
        </div>
      </WorkflowCard>

      {commentConfig ? (
        <ChildRecordsSection
          config={commentConfig}
          records={childrenData[commentConfig.key] ?? []}
          lookups={lookups}
          role={context.role}
          parentId={String(record.id)}
        />
      ) : null}
    </div>
  );
}
