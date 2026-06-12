"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileStack,
  FileText,
  PenLine,
  Send,
  ThumbsDown,
  ThumbsUp,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

import { ChildRecordsSection } from "@/components/modules/child-records-section";
import { useFileViewer } from "@/components/files/file-viewer-provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canWriteModule } from "@/lib/permissions";
import { getStorageFieldKey } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import type {
  ChildModuleConfig,
  LookupCollection,
  SerializableModuleConfig,
  UserContext
} from "@/types/app";

type DocumentWorkflowClientProps = {
  context: UserContext;
  config: SerializableModuleConfig;
  record: Record<string, unknown>;
  lookups: LookupCollection;
  childrenData: Record<string, Array<Record<string, unknown>>>;
};

export function DocumentWorkflowClient({
  context,
  config,
  record,
  lookups,
  childrenData
}: DocumentWorkflowClientProps) {
  const router = useRouter();
  const { openFile } = useFileViewer();
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [ackingId, setAckingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const canWrite = canWriteModule(context.role, config.slug);
  const storageFieldKey = getStorageFieldKey(config.fields);
  const filePath = storageFieldKey ? String(record[storageFieldKey] ?? "") : "";
  const documentId = String(record.id ?? "");
  const status = String(record.status ?? "Draft");

  const approvals = childrenData["document-approvals"] ?? [];
  const distributions = childrenData["document-distributions"] ?? [];

  const myPendingSignatures = approvals.filter(
    (row) =>
      row.decision === "Pending" && String(row.approver_id ?? "") === context.userId
  );
  const myPendingAcks = distributions.filter(
    (row) =>
      ["To Acknowledge", "Overdue"].includes(String(row.status ?? "")) &&
      String(row.recipient_id ?? "") === context.userId
  );

  // Pending approvals with no approver assigned — can be self-assigned
  const unassignedPendingApprovals = approvals.filter(
    (row) => row.decision === "Pending" && !row.approver_id
  );

  const myPendingSignature = myPendingSignatures.length > 0;
  const myPendingAck = myPendingAcks.length > 0;

  const childConfigs = useMemo(
    () => config.childModules ?? [],
    [config.childModules]
  );

  async function submitForReview() {
    setWorkflowLoading(true);

    try {
      const response = await fetch("/api/documents/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit-for-review", documentId })
      });
      const payload = (await response.json()) as { error?: string; data?: { created?: number } };

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de lancer le circuit de validation.");
      }

      toast.success(
        payload.data?.created
          ? `Circuit lance avec ${payload.data.created} niveau(x) de signature.`
          : "Circuit de validation deja en place."
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur workflow.");
    } finally {
      setWorkflowLoading(false);
    }
  }

  async function openDocumentFile() {
    if (!filePath) return;

    void fetch("/api/documents/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, source: "Apercu document" })
    });

    await openFile(filePath, String(record.title ?? record.document_code ?? "Document"));
  }

  async function signApproval(approvalId: string, decision: "Approved" | "Rejected") {
    setSigningId(approvalId);
    try {
      const signedAt = new Date().toISOString();
      const response = await fetch("/api/records/document_approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: approvalId,
          values: {
            decision,
            signed_at: signedAt,
            comment: `Signature electronique ${decision === "Approved" ? "approuvee" : "rejetee"} le ${signedAt}`
          }
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Signature impossible.");
      toast.success(
        decision === "Approved"
          ? "Signature electronique enregistree."
          : "Signature rejetee."
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur signature.");
    } finally {
      setSigningId(null);
    }
  }

  async function acknowledgeDistribution(distributionId: string) {
    setAckingId(distributionId);
    try {
      const acknowledgedAt = new Date().toISOString();
      const response = await fetch("/api/records/document_distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: distributionId,
          values: {
            status: "Acknowledged",
            acknowledged_at: acknowledgedAt,
            comment: `Accuse de lecture portail le ${acknowledgedAt}`
          }
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Accuse impossible.");
      toast.success("Accuse de lecture enregistre.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur accuse.");
    } finally {
      setAckingId(null);
    }
  }

  async function selfAssignApproval(approvalId: string) {
    setAssigningId(approvalId);
    try {
      const response = await fetch("/api/records/document_approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: approvalId,
          values: { approver_id: context.userId }
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Assignation impossible.");
      toast.success("Vous etes maintenant signataire de ce niveau.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur assignation.");
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden border border-[#8bd7ee] bg-[#f8fcff] shadow-sm">
        <div className="flex flex-col gap-2 bg-[linear-gradient(90deg,#2749a0,#00a9da)] px-3 py-2 text-white shadow-[inset_0_-2px_0_#ffcd12] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-white/30 hover:bg-white/10"
              title="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[10px] font-semibold uppercase text-[#fff4b8]">GED Qualios</div>
              <h1 className="text-base font-semibold">
                {String(record.document_code ?? "")} — {String(record.title ?? "")}
              </h1>
            </div>
          </div>
          <StatusBadge value={status} />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#d5edf8] bg-white px-3 py-2">
          {canWrite && (status === "Draft" || status === "Under Review") ? (
            <Button
              variant="secondary"
              disabled={workflowLoading}
              onClick={() => void submitForReview()}
            >
              <Send className="h-4 w-4" />
              Lancer validation / signatures
            </Button>
          ) : null}
          {filePath ? (
            <Button variant="secondary" onClick={() => void openDocumentFile()}>
              <FileText className="h-4 w-4" />
              Ouvrir le document
            </Button>
          ) : null}
          <Link
            href={`/documents/mes-signatures`}
            className="inline-flex min-h-9 items-center gap-2 rounded border border-[#b9def4] bg-[#f8fcff] px-3 text-xs font-semibold text-[#2749a0] hover:bg-[#fff4b8]"
          >
            Mes signatures
          </Link>
          <a
            href={`/api/documents/${documentId}/report`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-2 rounded border border-[#b9def4] bg-[#f8fcff] px-3 text-xs font-semibold text-[#2749a0] hover:bg-[#fff4b8]"
          >
            <FileStack className="h-4 w-4" />
            Rapport PDF / impression
          </a>
        </div>

        {(myPendingSignature || myPendingAck) && (
          <div className="border-b border-[#ffcd12] bg-[#fff8d8] px-3 py-2 text-xs text-[#17306b]">
            {myPendingSignatures.map((approval) => (
              <div key={String(approval.id)} className="mb-1 flex flex-wrap items-center gap-2">
                <PenLine className="h-3.5 w-3.5 shrink-0 text-[#2749a0]" />
                <span className="font-semibold">
                  Signature en attente — Niveau {String(approval.step_order ?? "-")} · {String(approval.role_label ?? "Signataire")}
                </span>
                <Button
                  variant="secondary"
                  className="h-6 min-h-0 gap-1 px-2 py-0 text-[10px] text-success"
                  disabled={signingId === String(approval.id)}
                  onClick={() => void signApproval(String(approval.id), "Approved")}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {signingId === String(approval.id) ? "..." : "Signer / Approuver"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-6 min-h-0 gap-1 px-2 py-0 text-[10px] text-danger"
                  disabled={signingId === String(approval.id)}
                  onClick={() => void signApproval(String(approval.id), "Rejected")}
                >
                  <ThumbsDown className="h-3 w-3" />
                  Rejeter
                </Button>
              </div>
            ))}
            {myPendingAcks.map((dist) => (
              <div key={String(dist.id)} className="mb-1 flex flex-wrap items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                <span className="font-semibold">
                  Accuse de lecture requis — {String(dist.recipient_group ?? "Portail")}
                </span>
                <Button
                  variant="secondary"
                  className="h-6 min-h-0 gap-1 px-2 py-0 text-[10px] text-success"
                  disabled={ackingId === String(dist.id)}
                  onClick={() => void acknowledgeDistribution(String(dist.id))}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {ackingId === String(dist.id) ? "..." : "Accuser reception"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {unassignedPendingApprovals.length > 0 && (
          <div className="border-b border-[#b9def4] bg-[#f0f8ff] px-3 py-2 text-xs text-[#17306b]">
            {unassignedPendingApprovals.map((approval) => (
              <div key={String(approval.id)} className="mb-1 flex flex-wrap items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 shrink-0 text-[#2749a0]" />
                <span className="text-[#2749a0]">
                  Niveau {String(approval.step_order ?? "-")} · {String(approval.role_label ?? "Signataire")} — aucun signataire assigne
                </span>
                <Button
                  variant="secondary"
                  className="h-6 min-h-0 gap-1 px-2 py-0 text-[10px]"
                  disabled={assigningId === String(approval.id)}
                  onClick={() => void selfAssignApproval(String(approval.id))}
                >
                  <UserPlus className="h-3 w-3" />
                  {assigningId === String(approval.id) ? "..." : "Me designer signataire"}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 px-3 py-2 text-xs text-ink md:grid-cols-4">
          <div>
            <span className="font-semibold text-[#2749a0]">Version</span>
            <div>{String(record.version_current ?? "-")}</div>
          </div>
          <div>
            <span className="font-semibold text-[#2749a0]">Processus</span>
            <div>
              {String(record.process_family ?? "-")} / {String(record.process_group ?? "-")}
            </div>
          </div>
          <div>
            <span className="font-semibold text-[#2749a0]">Mode signature</span>
            <div>{String(record.approval_mode ?? "Sequential")}</div>
          </div>
          <div>
            <span className="font-semibold text-[#2749a0]">Prochaine relecture</span>
            <div>{formatDate(String(record.review_date ?? ""))}</div>
          </div>
        </div>
      </section>

      {childConfigs.map((child) => (
        <ChildRecordsSection
          key={child.key}
          config={child as ChildModuleConfig}
          records={childrenData[child.key] ?? []}
          lookups={lookups}
          role={context.role}
          parentId={documentId}
          userId={context.userId}
          variant="qualios"
        />
      ))}
    </div>
  );
}
