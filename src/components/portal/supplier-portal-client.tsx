"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type SupplierPortalClientProps = {
  pendingAckCount: number;
};

export function SupplierPortalNewComplaint() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");

  async function submit() {
    if (!reference.trim() || !description.trim()) {
      toast.error("Reference et description sont obligatoires.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/records/supplier_complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            reference: reference.trim(),
            issue_type: issueType.trim() || "Qualite",
            description: description.trim(),
            severity: "Medium",
            status: "Open",
            supplier_name: "Portail fournisseur"
          }
        })
      });
      const payload = (await response.json()) as { error?: string; data?: { id?: string } };

      if (!response.ok) {
        throw new Error(payload.error ?? "Creation impossible.");
      }

      toast.success("Reclamation creee.");
      setOpen(false);
      router.refresh();
      if (payload.data?.id) {
        router.push(`/supplier-complaints/${payload.data.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouvelle reclamation
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded border border-[#b9def4] bg-[#f8fcff] p-3">
      <h3 className="text-sm font-semibold text-[#2749a0]">Nouvelle reclamation fournisseur</h3>
      <input
        className="h-9 w-full border border-[#b9def4] px-2 text-sm"
        placeholder="Reference RF-..."
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <input
        className="h-9 w-full border border-[#b9def4] px-2 text-sm"
        placeholder="Type d'ecart"
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
      />
      <textarea
        className="min-h-20 w-full border border-[#b9def4] px-2 py-1 text-sm"
        placeholder="Description du probleme..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <Button disabled={saving} onClick={() => void submit()}>
          {saving ? "Envoi..." : "Envoyer"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
}

export function SupplierPortalAckBanner({ pendingAckCount }: SupplierPortalClientProps) {
  if (pendingAckCount === 0) return null;

  return (
    <Link
      href="/documents/mes-accuses"
      className="block rounded border border-[#ffcd12] bg-[#fff8d8] px-4 py-2 text-sm font-semibold text-[#2749a0] hover:bg-[#fff4b8]"
    >
      Vous avez {pendingAckCount} document(s) en attente d&apos;accuse de lecture.
    </Link>
  );
}
