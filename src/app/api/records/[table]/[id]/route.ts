import { NextResponse } from "next/server";

import { getTableWriteRoles, tableRegistry } from "@/lib/modules/registry";
import { getCurrentUserContext, createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableName } from "@/types/database";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;
  const tableName = table as TableName;

  if (!tableRegistry.has(tableName)) {
    return NextResponse.json({ error: "Unsupported table." }, { status: 404 });
  }

  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  let values: Record<string, unknown> = {};

  if (tableName === "comments" || tableName === "attachments") {
    const { data } = await supabase
      .from(tableName)
      .select("table_name")
      .eq("id", id)
      .maybeSingle();

    values = (data as Record<string, unknown>) ?? {};
  }

  const allowedRoles = getTableWriteRoles(tableName, values);

  if (!allowedRoles.includes(context.role)) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const { error } = await supabase.from(tableName).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
