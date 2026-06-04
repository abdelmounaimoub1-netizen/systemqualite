import { NextResponse } from "next/server";

import {
  markOverdueDistributions,
  sendDistributionRequestEmail
} from "@/lib/documents/distributions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const overdue = await markOverdueDistributions(supabase);

  const { data: pending } = await supabase
    .from("document_distributions")
    .select("id")
    .eq("status", "Overdue")
    .limit(50);

  let emailsSent = 0;

  for (const row of pending ?? []) {
    const result = await sendDistributionRequestEmail(supabase, String(row.id));
    if (result.sent) emailsSent += 1;
  }

  return NextResponse.json({
    overdueUpdated: overdue.updated,
    reminderEmailsSent: emailsSent
  });
}
