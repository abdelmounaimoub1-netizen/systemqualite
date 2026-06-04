import { NextResponse } from "next/server";

import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: document }, { data: approvals }, { data: distributions }] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("document_approvals")
      .select("*")
      .eq("document_id", id)
      .order("step_order", { ascending: true }),
    supabase.from("document_distributions").select("*").eq("document_id", id)
  ]);

  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const doc = document as Record<string, unknown>;
  const title = `${String(doc.document_code ?? "")} - ${String(doc.title ?? "")}`;

  const approvalRows = (approvals ?? [])
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(String(row.step_order ?? ""))}</td>
        <td>${escapeHtml(String(row.role_label ?? ""))}</td>
        <td>${escapeHtml(String(row.decision ?? ""))}</td>
        <td>${escapeHtml(String(row.signed_at ?? "-"))}</td>
      </tr>`
    )
    .join("");

  const distributionRows = (distributions ?? [])
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(String(row.recipient_group ?? ""))}</td>
        <td>${escapeHtml(String(row.status ?? ""))}</td>
        <td>${escapeHtml(String(row.acknowledged_at ?? "-"))}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport GED - ${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #17306b; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 14px; margin-top: 24px; border-bottom: 2px solid #00a9da; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #b9def4; padding: 6px 8px; text-align: left; }
    th { background: #d7f8ff; }
    .meta { font-size: 12px; color: #4b5d73; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Imprimer / PDF</button>
  <h1>Rapport documentaire GED</h1>
  <p class="meta">Genere le ${escapeHtml(new Date().toLocaleString("fr-FR"))} par ${escapeHtml(context.profile?.full_name ?? context.email)}</p>
  <h2>Fiche document</h2>
  <table>
    <tr><th>Code</th><td>${escapeHtml(String(doc.document_code ?? ""))}</td></tr>
    <tr><th>Titre</th><td>${escapeHtml(String(doc.title ?? ""))}</td></tr>
    <tr><th>Statut</th><td>${escapeHtml(String(doc.status ?? ""))}</td></tr>
    <tr><th>Version</th><td>${escapeHtml(String(doc.version_current ?? ""))}</td></tr>
    <tr><th>Processus</th><td>${escapeHtml(String(doc.process_family ?? ""))} / ${escapeHtml(String(doc.process_group ?? ""))}</td></tr>
    <tr><th>Diffusion</th><td>${escapeHtml(String(doc.diffusion_scope ?? ""))}</td></tr>
  </table>
  <h2>Circuit de signature electronique</h2>
  <table>
    <thead><tr><th>Niveau</th><th>Role</th><th>Decision</th><th>Date</th></tr></thead>
    <tbody>${approvalRows || "<tr><td colspan='4'>Aucun visa</td></tr>"}</tbody>
  </table>
  <h2>Diffusion et accuses de reception</h2>
  <table>
    <thead><tr><th>Groupe</th><th>Statut</th><th>Accuse le</th></tr></thead>
    <tbody>${distributionRows || "<tr><td colspan='3'>Aucune diffusion</td></tr>"}</tbody>
  </table>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
