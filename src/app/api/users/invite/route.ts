import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, getCurrentUserContext } from "@/lib/supabase/server";
import { canInviteUsers } from "@/lib/permissions";

export async function POST(request: Request) {
  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context || !canInviteUsers(context.role)) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const body = (await request.json()) as {
    email?: string;
    full_name?: string;
    role_id?: string | null;
    department_id?: string | null;
    job_title?: string | null;
  };

  if (!body.email || !body.full_name) {
    return NextResponse.json(
      { error: "Email and full name are required." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const invite = await admin.auth.admin.inviteUserByEmail(body.email, {
    redirectTo: `${env.appUrl}/auth/callback?next=/dashboard`,
    data: {
      full_name: body.full_name
    }
  });

  if (invite.error || !invite.data.user) {
    return NextResponse.json(
      { error: invite.error?.message ?? "Failed to invite user." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").upsert({
    id: invite.data.user.id,
    email: body.email,
    full_name: body.full_name,
    role_id: body.role_id ?? null,
    department_id: body.department_id ?? null,
    job_title: body.job_title ?? null,
    is_active: true,
    created_by: context.userId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
