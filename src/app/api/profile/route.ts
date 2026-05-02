import { NextResponse } from "next/server";

import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";
import { normalizeRecordPayload } from "@/lib/modules/registry";

export async function POST(request: Request) {
  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const body = (await request.json()) as {
    values?: Record<string, unknown>;
  };

  const payload = normalizeRecordPayload("profiles", body.values ?? {});
  delete payload.role_id;
  delete payload.department_id;
  delete payload.email;
  delete payload.is_active;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", context.userId)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
