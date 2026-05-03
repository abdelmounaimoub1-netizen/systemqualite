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
  Pencil,
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
  "h-6 w-full border border-[#b8c4ca] bg-white px-1.5 text-[11px] text-[#1f2c3a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] outline-none focus:border-[#008fc3] focus:ring-1 focus:ring-[#008fc3]/35 disabled:bg-slate-100";
const textareaClass =
  "min-h-14 w-full border border-[#b8c4ca] bg-white px-1.5 py-1 text-[11px] text-[#1f2c3a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] outline-none focus:border-[#008fc3] focus:ring-1 focus:ring-[#008fc3]/35";
const qualiosPanelClass = "border border-[#c7d1d7] bg-[#f7f9fa]";
const qualiosBlueHeader =
  "border-b border-[#8db9cc] bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-2 py-1 text-[11px] font-bold text-white";
const qualiosPinkHeader =
  "border-y border-[#ffcd12] bg-[#fff4b8] px-2 py-1 text-[11px] font-bold text-[#17306b]";

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
    <div className="flex items-center gap-2 border-b border-[#c7d1d7] bg-[#edf1f3] px-2 py-1.5">
      <span className="inline-flex h-5 w-5 items-center justify-center border border-[#aebbc2] bg-white text-[#006e99]">
        <ClipboardCheck className="h-4 w-4" />
      </span>
      <h2 className="text-[17px] font-medium text-[#2a3138]">
        {step} {title}
      </h2>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
  className = ""
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid grid-cols-[118px_1fr] items-center gap-2 text-[10px] font-semibold text-[#2f3a43]",
        wide ? "md:col-span-2" : "",
        className
      )}
    >
      <span className="leading-4">{label}</span>
      {children}
    </label>
  );
}

function WorkflowCard({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden border border-[#c7d1d7] bg-white shadow-sm">{children}</section>;
}

function ActionIconButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  tone = "save"
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: "save" | "mail" | "send" | "edit" | "danger" | "success";
}) {
  const toneClasses = {
    save: "bg-[#2749a0] hover:bg-[#00a9da]",
    mail: "bg-[#00a9da] hover:bg-[#2749a0]",
    send: "bg-[#00a9da] hover:bg-[#2749a0]",
    edit: "bg-[#ffcd12] text-[#17306b] hover:bg-[#ffe15c]",
    danger: "bg-danger hover:brightness-95",
    success: "bg-success hover:brightness-95"
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center border border-white/40 text-white shadow-sm transition disabled:bg-slate-300",
        toneClasses[tone]
      )}
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
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#2f3a43]">
      <span className="font-bold">{label}</span>
      {options.map((option) => (
        <label key={option} className="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-3.5 w-3.5 text-[#00a9da]"
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
        throw new Error(payload.error ?? "Impossible d'enregistrer la reclamation.");
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
    <div className="-m-3 min-h-[calc(100vh-3rem)] bg-[#e7f0f4] px-3 py-2 md:-m-5 md:px-5">
      <div className="mx-auto max-w-[1220px] space-y-3">
      <div className="border border-[#c7d1d7] bg-[#f4f6f7] px-3 py-2 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#31414d]">
            <span className="font-bold">Affiliation</span>
            <span className="border border-[#d8c26c] bg-[#fff4b8] px-3 py-1 font-bold text-[#1f4f8f]">
              {fieldValue(values, "affiliation") || fieldValue(values, "reference")}
            </span>
            <StatusBadge value={String(values.status ?? "Open")} />
          </div>
          <div className="text-center text-[15px] font-bold text-[#222b33]">
            Formulaire de suivi des reclamations client
          </div>
          <div className="flex flex-wrap justify-start gap-2 md:justify-end">
          <Link href="/customer-complaints">
            <Button variant="ghost" className="min-h-7 px-2 py-1 text-xs">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <Button className="min-h-7 px-2 py-1 text-xs" onClick={() => void saveComplaint()} disabled={!canWrite || saving}>
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
          </div>
        </div>
      </div>

      <WorkflowCard>
        <SectionTitle step="1/4" title="Declaration de la reclamation client" />

        <div className="space-y-3 bg-[#eef4f6] p-2">
          <div className={qualiosPanelClass}>
            <div className={qualiosBlueHeader}>Identification du declarant et du client</div>
            <div className="grid gap-x-5 gap-y-1.5 bg-[#fff8dc] p-2 md:grid-cols-2">
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
            <div className="grid gap-x-5 gap-y-1.5 md:col-span-2 md:grid-cols-2">
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
          </div>

          <div className={qualiosPanelClass}>
            <div className={qualiosPinkHeader}>Type et description de la reclamation</div>
            <div className="space-y-2 bg-[#eef3f6] p-2">
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
          </div>

          {attachmentConfig ? (
            <ChildRecordsSection
              config={attachmentConfig}
              records={childrenData[attachmentConfig.key] ?? []}
              lookups={lookups}
              role={context.role}
              parentId={String(record.id)}
              userId={context.userId}
              variant="qualios"
            />
          ) : null}

          <div className={qualiosPanelClass}>
            <div className={qualiosBlueHeader}>Transmission pour orientation</div>
            <div className="grid gap-x-5 gap-y-1.5 bg-[#f7f9fa] p-2 md:grid-cols-2">
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
            <div className="flex justify-center gap-2 border-t border-[#d7e0e5] bg-[#f4f6f7] p-2">
              <ActionIconButton
                label="Enregistrer"
                icon={Save}
                tone="save"
                disabled={saving}
                onClick={() => void saveComplaint("Declaration enregistree.")}
              />
              <ActionIconButton
                label="Notifier"
                icon={Mail}
                tone="mail"
                disabled={saving}
                onClick={() => void saveComplaint("Transmission enregistree.")}
              />
            </div>
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="2/4" title="Orientation de la reclamation client" />
        <div className="space-y-3 bg-[#eef4f6] p-2">
          <div className={qualiosPanelClass}>
            <div className={qualiosPinkHeader}>Decision d&apos;orientation</div>
            <div className="bg-[#f7f9fa] p-2">
            <RadioGroup
              label="Que voulez faire de cette reclamation ?"
              name="orientation_decision"
              value={fieldValue(values, "orientation_decision") || "Traiter"}
              options={["Traiter", "Modifier", "Cloturer"]}
              onChange={(value) => setField("orientation_decision", value)}
            />
            </div>
          </div>
          <div className="flex justify-center gap-2 border border-[#c7d1d7] bg-[#f4f6f7] p-2">
            <ActionIconButton
              label="Enregistrer orientation"
              icon={Save}
              tone="save"
              disabled={saving}
              onClick={() => void saveComplaint("Orientation enregistree.")}
            />
            <ActionIconButton
              label="Marquer a modifier"
              icon={Pencil}
              tone="edit"
              disabled={saving}
              onClick={() => {
                setField("orientation_decision", "Modifier");
                void saveComplaint("Reclamation marquee a modifier.", {
                  orientation_decision: "Modifier",
                  status: "In Progress"
                });
              }}
            />
            <ActionIconButton
              label="Cloturer"
              icon={CheckCircle2}
              tone="danger"
              disabled={saving}
              onClick={() => {
                setField("orientation_decision", "Cloturer");
                setField("status", "Closed");
                void saveComplaint("Reclamation cloturee.", {
                  orientation_decision: "Cloturer",
                  status: "Closed"
                });
              }}
            />
            <ActionIconButton
              label="Envoyer pour traitement"
              icon={Send}
              tone="mail"
              disabled={saving}
              onClick={() => void saveComplaint("Orientation transmise.")}
            />
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="3/4" title="Traitement de la reclamation client" />
        <div className="space-y-3 bg-[#eef4f6] p-2">
          <div className={qualiosPanelClass}>
            <div className={qualiosPinkHeader}>Analyse et plan d&apos;action</div>
            <div className="bg-[#f7f9fa] p-2">
              <Field label="Origine du probleme" wide className="items-start">
                <textarea
                  className={textareaClass}
                  value={fieldValue(values, "problem_origin")}
                  onChange={(event) => setField("problem_origin", event.target.value)}
                />
              </Field>
            </div>
          </div>

          {actionConfig ? (
            <ChildRecordsSection
              config={actionConfig}
              records={actionRecords}
              lookups={lookups}
              role={context.role}
              parentId={String(record.id)}
              userId={context.userId}
              variant="qualios"
            />
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-[#c7d1d7] bg-white px-2 py-1 text-[11px] text-[#1f2c3a]">
              Nombre d&apos;actions a realiser: <strong>{actionSummary.total}</strong>
            </div>
            <div className="border border-[#c7d1d7] bg-white px-2 py-1 text-[11px] text-[#1f2c3a]">
              Nombre d&apos;actions realisees: <strong>{actionSummary.done}</strong>
            </div>
          </div>

          <div className={qualiosPanelClass}>
            <div className={qualiosBlueHeader}>Transmission pour verification et cloture</div>
            <div className="grid gap-x-5 gap-y-1.5 bg-[#f7f9fa] p-2 md:grid-cols-2">
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
            <div className="flex justify-center gap-2 border-t border-[#d7e0e5] bg-[#f4f6f7] p-2">
              <ActionIconButton
                label="Enregistrer traitement"
                icon={Save}
                tone="save"
                disabled={saving}
                onClick={() => void saveComplaint("Traitement enregistre.")}
              />
              <ActionIconButton
                label="Transmettre"
                icon={Mail}
                tone="mail"
                disabled={saving}
                onClick={() => void saveComplaint("Verification transmise.")}
              />
            </div>
          </div>
        </div>
      </WorkflowCard>

      <WorkflowCard>
        <SectionTitle step="4/4" title="Verification et Cloture de la reclamation client" />
        <div className="space-y-3 bg-[#eef4f6] p-2">
          <div className={qualiosPanelClass}>
            <div className={qualiosPinkHeader}>Verification de l&apos;efficacite</div>
            <div className="space-y-2 bg-[#f7f9fa] p-2">
              <RadioGroup
                label="Les actions entreprises sont-elles efficaces ?"
                name="actions_effective"
                value={fieldValue(values, "actions_effective") || "Oui"}
                options={["Oui", "Non", "A mesurer"]}
                onChange={(value) => setField("actions_effective", value)}
              />

              <Field label="Criteres d'efficacite" wide className="items-start">
                <textarea
                  className={textareaClass}
                  value={fieldValue(values, "effectiveness_criteria")}
                  onChange={(event) => setField("effectiveness_criteria", event.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-x-5 gap-y-1.5 border border-[#c7d1d7] bg-white p-2 md:grid-cols-2">
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

          <div className="overflow-hidden border border-[#c7d1d7] bg-white">
            <div className="grid grid-cols-[1.4fr_0.8fr] bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-2 py-1 text-[10px] font-bold text-white">
              <span>Actions entreprises</span>
              <span>Cout estime</span>
            </div>
            {actionRecords.length === 0 ? (
              <div className="px-2 py-4 text-[11px] text-muted">Aucun resultat.</div>
            ) : (
              actionRecords.map((action) => (
                <div
                  key={String(action.id)}
                  className="grid grid-cols-[1.4fr_0.8fr] border-t border-[#d7e0e5] px-2 py-1 text-[11px] text-[#1f2c3a]"
                >
                  <span>{String(action.action ?? "")}</span>
                  <span>{String(action.estimated_cost ?? "0")}</span>
                </div>
              ))
            )}
          </div>

          <div className={qualiosPanelClass}>
            <div className={qualiosBlueHeader}>A mesurer</div>
            <div className="grid gap-x-5 gap-y-1.5 bg-[#f7f9fa] p-2 md:grid-cols-2">
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
          </div>

          <div className={qualiosPanelClass}>
            <div className={qualiosPinkHeader}>Actions non efficaces</div>
            <div className="space-y-2 bg-[#f7f9fa] p-2">
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
          </div>

          <div className="flex flex-col gap-2 border border-[#c7d1d7] bg-[#f4f6f7] p-2 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] text-slate-500">
              Suivi par {context.profile?.full_name ?? context.email} - {formatDate(String(values.updated_at ?? ""))}
            </div>
            <div className="flex justify-center gap-2">
              <ActionIconButton
                label="Enregistrer verification"
                icon={Save}
                tone="save"
                disabled={saving}
                onClick={() => void saveComplaint("Verification enregistree.")}
              />
              <ActionIconButton
                label="Cloturer"
                icon={CheckCircle2}
                tone="success"
                disabled={saving}
                onClick={() => {
                  setField("status", "Closed");
                  void saveComplaint("Reclamation cloturee.", { status: "Closed" });
                }}
              />
              <ActionIconButton
                label="Non efficace"
                icon={XCircle}
                tone="danger"
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
          userId={context.userId}
          variant="qualios"
        />
      ) : null}
      </div>
    </div>
  );
}
