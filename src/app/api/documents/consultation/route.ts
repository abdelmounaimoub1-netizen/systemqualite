import { NextResponse } from "next/server";

import { logDocumentConsultation } from "@/lib/documents/consultations";
import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const body = (await request.json()) as { documentId?: string; source?: string };

  if (!body.documentId) {
    return NextResponse.json({ error: "documentId requis." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await logDocumentConsultation(supabase, {
    documentId: body.documentId,
    userId: context.userId,
    source: body.source ?? "Portail"
  });

  return NextResponse.json({ ok: true });
}
