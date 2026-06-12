import { NextResponse } from "next/server";

import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateFr(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return String(value);
  }
}

function formatDateTimeFr(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return String(value);
  }
}

function decisionLabel(decision: string) {
  const map: Record<string, string> = {
    Approved: "Approuve",
    Rejected: "Rejete",
    Pending: "En attente",
    Skipped: "Ignore"
  };
  return map[decision] ?? decision;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    Draft: "Brouillon",
    "Under Review": "En validation",
    Approved: "Actif",
    Archived: "Archive",
    "To Acknowledge": "A accuser",
    Acknowledged: "Accuse",
    Overdue: "En retard",
    Cancelled: "Annule"
  };
  return map[status] ?? status;
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

  const [
    { data: document },
    { data: approvals },
    { data: distributions },
    { data: versions },
    { data: consultationsRaw }
  ] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("document_approvals")
      .select("*")
      .eq("document_id", id)
      .order("step_order", { ascending: true }),
    supabase
      .from("document_distributions")
      .select("*")
      .eq("document_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("document_consultations")
      .select("consulted_at,user_id")
      .eq("document_id", id)
      .order("consulted_at", { ascending: false })
      .limit(1)
  ]);

  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  // Fetch related profiles for approvers and distributions
  const approverIds = (approvals ?? [])
    .map((row) => row.approver_id)
    .filter(Boolean) as string[];
  const recipientIds = (distributions ?? [])
    .map((row) => row.recipient_id)
    .filter(Boolean) as string[];
  const ownerIds = [document.owner_id, document.created_by].filter(Boolean) as string[];
  const allProfileIds = [...new Set([...approverIds, ...recipientIds, ...ownerIds])];

  const { data: profiles } = allProfileIds.length
    ? await supabase
        .from("profiles")
        .select("id,full_name,job_title")
        .in("id", allProfileIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p: Record<string, unknown>) => [String(p.id), p])
  );

  function profileName(profileId: string | null | undefined): string {
    if (!profileId) return "-";
    const profile = profileMap.get(profileId) as Record<string, unknown> | undefined;
    return String(profile?.full_name ?? profileId);
  }

  // Fetch category name
  const categoryId = String(document.category_id ?? "");
  const { data: categoryRow } = categoryId
    ? await supabase.from("document_categories").select("name").eq("id", categoryId).maybeSingle()
    : { data: null };

  const doc = document as Record<string, unknown>;
  const docCode = String(doc.document_code ?? "");
  const docTitle = String(doc.title ?? "");
  const version = String(doc.version_current ?? "1.0");
  const status = String(doc.status ?? "Draft");
  const generatedAt = new Date().toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Redacteurs = approvals at step 1 or with role_label containing "Redacteur"
  const redacteurs = (approvals ?? []).filter(
    (row) =>
      Number(row.step_order) === 1 ||
      String(row.role_label ?? "").toLowerCase().includes("redacteur")
  );

  // Signataires = all approvals
  const signataires = (approvals ?? []);

  // Groupes de diffusion
  const groupesDiffusion = (() => {
    const groups = new Set<string>();
    for (const row of distributions ?? []) {
      if (row.recipient_group) groups.add(String(row.recipient_group));
    }
    return groups.size > 0
      ? Array.from(groups).join(", ")
      : String(doc.diffusion_scope ?? "Tous les utilisateurs actifs");
  })();

  // Documents lies / reference documents
  const fichierJoint = doc.file_path
    ? String(doc.file_path).split("/").pop() ?? String(doc.file_path)
    : null;

  // Historique
  const historyRows = (versions ?? [])
    .slice(0, 5)
    .map((row: Record<string, unknown>) => {
      const label = `${docCode} version ${String(row.version_number ?? "")} : ${docTitle}`;
      const dateInfo = row.approval_date ? `Valide le ${formatDateFr(String(row.approval_date))}` : "";
      const activatedInfo = doc.effective_date ? `Mis en activite le ${formatDateFr(String(doc.effective_date))}` : "";
      return `<div class="hist-line">${escapeHtml(label)}${dateInfo ? `<br><span class="hist-sub">${escapeHtml(dateInfo)}</span>` : ""}${activatedInfo ? `<br><span class="hist-sub">${escapeHtml(activatedInfo)}</span>` : ""}</div>`;
    })
    .join("");

  // Last consultation
  const lastConsultation = consultationsRaw?.[0]
    ? formatDateTimeFr(String(consultationsRaw[0].consulted_at))
    : generatedAt;

  // Redacteurs lines
  const redacteursHtml = redacteurs.length
    ? redacteurs
        .map(
          (row) =>
            `<div class="sig-line">${escapeHtml(profileName(String(row.approver_id ?? "")))} - ${escapeHtml(String(row.role_label ?? "Redacteur-Signataire"))}</div>`
        )
        .join("")
    : `<div class="sig-line">${escapeHtml(profileName(String(doc.owner_id ?? "")))}</div>`;

  // Signataires lines
  const signaireLines = signataires
    .map((row, index) => {
      const name = profileName(String(row.approver_id ?? ""));
      const roleLabel = String(row.role_label ?? `Signataire-${index + 1}`);
      const isSigned = row.decision === "Approved" && row.signed_at;
      const signedText = isSigned
        ? ` signé numériquement le ${formatDateTimeFr(String(row.signed_at))}`
        : "";
      return `<div class="sig-line">${escapeHtml(name)} - ${escapeHtml(roleLabel)} - ${index + 1}${signedText ? `<span class="sig-date">${escapeHtml(signedText)}</span>` : ""}</div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docCode)} V${escapeHtml(version)} - ${escapeHtml(docTitle)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #f5f5f5;
    }
    .page {
      max-width: 820px;
      margin: 20px auto;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }

    /* Header */
    .doc-header {
      display: flex;
      align-items: stretch;
      border-bottom: 3px solid #e8600a;
    }
    .doc-header-logo {
      width: 120px;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-right: 1px solid #ddd;
      padding: 6px;
      flex-shrink: 0;
    }
    .doc-header-logo .logo-text {
      font-size: 16px;
      font-weight: bold;
      color: #2749a0;
      letter-spacing: 1px;
    }
    .doc-header-logo .logo-sub {
      font-size: 8px;
      color: #e8600a;
      font-weight: bold;
    }
    .doc-header-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6px 12px;
      background: #fff;
    }
    .doc-header-title .doc-name {
      font-size: 11px;
      color: #444;
      font-style: italic;
    }
    .doc-header-meta {
      width: 220px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px 8px;
      background: #f9f9f9;
      border-left: 1px solid #ddd;
      font-size: 9px;
      color: #555;
      flex-shrink: 0;
    }
    .doc-header-meta .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 1px 0;
    }
    .doc-header-meta .meta-row strong {
      color: #222;
    }

    /* Title block */
    .title-block {
      padding: 12px 16px 8px;
      border-bottom: 1px solid #e5e5e5;
    }
    .title-block h1 {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .title-block .subtitle {
      font-size: 11px;
      color: #555;
    }

    /* Info grid */
    .info-grid {
      padding: 8px 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    .info-row {
      display: flex;
      padding: 3px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 11px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label {
      width: 180px;
      font-weight: bold;
      color: #333;
      flex-shrink: 0;
    }
    .info-value { color: #222; flex: 1; }
    .info-value.status-actif { color: #0a7a0a; font-weight: bold; }
    .info-value.status-brouillon { color: #888; }
    .info-value.status-validation { color: #c06000; font-weight: bold; }
    .info-value.status-archive { color: #999; }

    /* Signatures block */
    .sig-block {
      padding: 6px 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    .sig-section-title {
      font-size: 10px;
      font-weight: bold;
      color: #555;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .sig-line {
      font-size: 11px;
      padding: 1px 0;
      color: #222;
    }
    .sig-date {
      color: #0a7a0a;
      font-style: italic;
    }

    /* Historique */
    .hist-block {
      padding: 6px 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    .hist-line {
      font-size: 10px;
      color: #444;
      padding: 2px 0;
      border-bottom: 1px dotted #eee;
    }
    .hist-line:last-child { border-bottom: none; }
    .hist-sub {
      color: #888;
      font-style: italic;
    }

    /* Footer */
    .doc-footer {
      padding: 6px 16px;
      background: #f9f9f9;
      font-size: 10px;
      color: #777;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e5e5e5;
    }

    /* Print */
    @media print {
      .no-print { display: none !important; }
      body { background: #fff; }
      .page { box-shadow: none; border: none; margin: 0; max-width: 100%; }
    }
  </style>
</head>
<body>

<div class="no-print" style="text-align:center;padding:10px;background:#2749a0;">
  <button onclick="window.print()" style="background:#ffcd12;border:none;padding:6px 20px;font-weight:bold;cursor:pointer;font-size:12px;">
    Imprimer / Exporter PDF
  </button>
  <span style="color:#fff;font-size:11px;margin-left:16px;">Fiche document — ${escapeHtml(docCode)} V${escapeHtml(version)}</span>
</div>

<div class="page">

  <!-- Header -->
  <div class="doc-header">
    <div class="doc-header-logo">
      <div style="text-align:center;">
        <div class="logo-text">Qualios</div>
        <div class="logo-sub">QMS PRO</div>
      </div>
    </div>
    <div class="doc-header-title">
      <div class="doc-name">${escapeHtml(String(doc.summary ?? docTitle))}</div>
    </div>
    <div class="doc-header-meta">
      <div class="meta-row"><span>Code :</span><strong>${escapeHtml(docCode)}</strong></div>
      <div class="meta-row"><span>Version :</span><strong>${escapeHtml(version)}</strong></div>
      <div class="meta-row"><span>Date :</span><strong>${escapeHtml(formatDateFr(String(doc.updated_at ?? doc.created_at ?? "")))}</strong></div>
      <div class="meta-row"><span>Mise en activite :</span><strong>${escapeHtml(formatDateFr(String(doc.effective_date ?? "")))}</strong></div>
      <div class="meta-row"><span>Page :</span><strong>1 / 1</strong></div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <h1>${escapeHtml(docCode)} version ${escapeHtml(version)}</h1>
    <div class="subtitle">${escapeHtml(docTitle)}</div>
  </div>

  <!-- Info fields -->
  <div class="info-grid">
    <div class="info-row">
      <div class="info-label">Objet :</div>
      <div class="info-value">${escapeHtml(String(doc.summary ?? docTitle))}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Référentiels et Chapitres :</div>
      <div class="info-value">${escapeHtml(String(doc.process_group ?? "ISO 9001 - Tous les chapitres"))}</div>
    </div>
    ${fichierJoint ? `
    <div class="info-row">
      <div class="info-label">Fichiers joints :</div>
      <div class="info-value">${escapeHtml(fichierJoint)}</div>
    </div>` : ""}
    ${(doc.process_group && doc.process_activity) ? `
    <div class="info-row">
      <div class="info-label">Documents liés :</div>
      <div class="info-value">${escapeHtml(String(doc.process_activity ?? ""))}</div>
    </div>` : ""}
    <div class="info-row">
      <div class="info-label">Statut :</div>
      <div class="info-value ${status === "Approved" ? "status-actif" : status === "Draft" ? "status-brouillon" : status === "Under Review" ? "status-validation" : "status-archive"}">${escapeHtml(statusLabel(status))}</div>
    </div>
    ${doc.effective_date ? `
    <div class="info-row">
      <div class="info-label">Mise en signature le :</div>
      <div class="info-value">${escapeHtml(formatDateFr(String(doc.updated_at ?? "")))}&nbsp;&nbsp;Validé le : ${escapeHtml(formatDateFr(String(doc.effective_date ?? "")))}</div>
    </div>` : ""}
    ${doc.effective_date ? `
    <div class="info-row">
      <div class="info-label">Mise en activité le :</div>
      <div class="info-value">${escapeHtml(formatDateFr(String(doc.effective_date ?? "")))}</div>
    </div>` : ""}
    ${doc.review_date ? `
    <div class="info-row">
      <div class="info-label">Prochaine date de relecture le :</div>
      <div class="info-value">${escapeHtml(formatDateFr(String(doc.review_date ?? "")))}</div>
    </div>` : ""}
    ${categoryRow ? `
    <div class="info-row">
      <div class="info-label">Catégorie :</div>
      <div class="info-value">${escapeHtml(String((categoryRow as Record<string, unknown>).name ?? ""))}</div>
    </div>` : ""}
    ${doc.process_family ? `
    <div class="info-row">
      <div class="info-label">Famille processus :</div>
      <div class="info-value">${escapeHtml(String(doc.process_family ?? ""))}${doc.process_group ? ` / ${escapeHtml(String(doc.process_group))}` : ""}${doc.process_activity ? ` / ${escapeHtml(String(doc.process_activity))}` : ""}</div>
    </div>` : ""}
  </div>

  <!-- Redacteurs -->
  <div class="sig-block">
    <div class="sig-section-title">Rédacteurs :</div>
    ${redacteursHtml}
  </div>

  <!-- Signataires -->
  <div class="sig-block">
    <div class="sig-section-title">Signataires :</div>
    ${signaireLines || `<div class="sig-line">Aucun signataire configuré</div>`}
  </div>

  <!-- Groupes de diffusion -->
  <div class="sig-block">
    <div class="sig-section-title">Groupes de diffusion :</div>
    <div class="sig-line">${escapeHtml(groupesDiffusion)} - Lecture</div>
  </div>

  <!-- Historique -->
  <div class="hist-block">
    <div class="sig-section-title">Historique du document :</div>
    ${historyRows || `<div class="hist-line">${escapeHtml(docCode)} version ${escapeHtml(version)} : ${escapeHtml(docTitle)}</div>`}
  </div>

  <!-- Date de consultation -->
  <div class="doc-footer">
    <span><strong>Date de consultation :</strong> ${escapeHtml(lastConsultation)}</span>
    <span>Généré par ${escapeHtml(context.profile?.full_name ?? context.email)}</span>
  </div>

</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
