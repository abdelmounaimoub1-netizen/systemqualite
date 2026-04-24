"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(73,190,185,0.28),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(247,180,68,0.22),transparent_32%)]" />
        <div className="relative flex max-w-xl flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              QMS Pro
            </div>
            <h1 className="mt-8 text-5xl font-semibold leading-tight">
              Quality systems built for the floor, the audit, and the follow-up.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
              Mobile installable. Desktop ready. Documents, CAPA, audits, risk, suppliers, and training in one original workspace.
            </p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-6">
            <div className="text-sm font-semibold text-white">What ships in this MVP</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-200">
              <div>Role-based access on Supabase Auth and RLS.</div>
              <div>Functional CRUD across every requested QMS module.</div>
              <div>PWA manifest, service worker, offline page, and install prompt support.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-xl rounded-[2rem] p-8">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Secure access</div>
            <h2 className="mt-3 text-3xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Sign in"
      description="Use your QMS Pro account to access documents, audits, CAPA actions, and the rest of your quality workspace."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          const supabase = getSupabaseBrowserClient();
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setLoading(false);

          if (error) {
            toast.error(error.message);
            return;
          }

          toast.success("Signed in successfully.");
          const nextPath =
            new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
          window.location.href = nextPath;
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@company.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-sm text-slate-500">
        <Link href="/auth/forgot-password" className="font-medium text-brand">
          Forgot password
        </Link>
        <Link href="/auth/sign-up" className="font-medium text-brand">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    jobTitle: "",
    note: ""
  });

  return (
    <AuthShell
      title="Create account"
      description="Start with a self-service employee account. Admins can later invite and assign governed roles in Settings."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          const supabase = getSupabaseBrowserClient();
          const emailRedirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
          const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              emailRedirectTo,
              data: {
                full_name: form.fullName,
                job_title: form.jobTitle,
                onboarding_note: form.note
              }
            }
          });
          setLoading(false);

          if (error) {
            toast.error(error.message);
            return;
          }

          if (data.session) {
            toast.success("Account created.");
            window.location.href = "/dashboard";
          } else {
            toast.success("Account created. Check your inbox to confirm your email.");
            router.replace("/auth/sign-in");
          }
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Full name</label>
          <Input
            required
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Jane Patel"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
            <Input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="At least 8 characters"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Job title</label>
          <Input
            value={form.jobTitle}
            onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))}
            placeholder="Quality specialist"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Context</label>
          <Textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="Optional onboarding note or department context."
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-500">
        Already have access?{" "}
        <Link href="/auth/sign-in" className="font-medium text-brand">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Reset password"
      description="Enter your email and QMS Pro will send a password reset link back to this app."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          const supabase = getSupabaseBrowserClient();
          const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
          });
          setLoading(false);

          if (error) {
            toast.error(error.message);
            return;
          }

          toast.success("Reset link sent.");
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@company.com"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-500">
        <Link href="/auth/sign-in" className="font-medium text-brand">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Choose a new password"
      description="Create a new password for your QMS Pro account after returning from the secure recovery link."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          const supabase = getSupabaseBrowserClient();
          const { error } = await supabase.auth.updateUser({ password });
          setLoading(false);

          if (error) {
            toast.error(error.message);
            return;
          }

          toast.success("Password updated.");
          window.location.href = "/dashboard";
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">New password</label>
          <Input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
