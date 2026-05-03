import { NextResponse } from "next/server";

import { sendDocumentSignatureLateEmail } from "@/lib/documents/signatures";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function sendLateSignatureAlerts() {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("document_approvals")
    .select("id")
    .eq("decision", "Pending")
    .not("due_date", "is", null)
    .lt("due_date", today)
    .limit(50);

  if (error) {
    throw error;
  }

  let sent = 0;
  const failures: string[] = [];

  for (const approval of data ?? []) {
    try {
      const result = await sendDocumentSignatureLateEmail(supabase, String(approval.id));
      if (result.sent) sent += 1;
    } catch (emailError) {
      console.error("Could not send late signature email:", emailError);
      failures.push(String(approval.id));
    }
  }

  return {
    checked: data?.length ?? 0,
    sent,
    failures
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await sendLateSignatureAlerts();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
