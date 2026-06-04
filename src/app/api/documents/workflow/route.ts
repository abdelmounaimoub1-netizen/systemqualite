import { NextResponse } from "next/server";

import { submitDocumentForReview } from "@/lib/documents/approval-workflow";
import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  if (!["admin", "quality_manager"].includes(context.role)) {
    return NextResponse.json({ error: "Droits insuffisants." }, { status: 403 });
  }

  const body = (await request.json()) as {
    action?: string;
    documentId?: string;
  };

  if (body.action !== "submit-for-review" || !body.documentId) {
    return NextResponse.json({ error: "Action non prise en charge." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    const result = await submitDocumentForReview(supabase, body.documentId, context.userId);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Workflow impossible." },
      { status: 400 }
    );
  }
}
