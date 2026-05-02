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

async function withRequestTimeout<T>(request: PromiseLike<T>, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), 15000);
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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
      <div className="relative hidden overflow-hidden bg-[#2749a0] px-10 py-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,169,218,0.34),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,205,18,0.28),transparent_32%)]" />
        <div className="relative flex max-w-xl flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#fff4b8]">
              <ShieldCheck className="h-4 w-4" />
              COSUMAR QMS
            </div>
            <h1 className="mt-8 text-5xl font-semibold leading-tight">
              Systeme qualite concu pour le terrain, l'audit et le suivi.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#d7f8ff]">
              Installable sur mobile, pret pour le bureau. Documents, CAPA, audits, risques, fournisseurs et formations dans un seul espace.
            </p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-6">
            <div className="text-sm font-semibold text-white">Inclus dans cette version</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-200">
              <div>Acces par role avec Supabase Auth et RLS.</div>
              <div>Gestion complete des modules qualite demandes.</div>
              <div>Application installable, mode hors ligne et page de secours.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-xl rounded-[2rem] p-8">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Acces securise</div>
            <h2 className="mt-3 text-3xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
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
      title="Connexion"
      description="Utilisez votre compte QMS Pro pour acceder aux documents, audits, actions CAPA et a tout l'espace qualite."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);

          try {
            const supabase = getSupabaseBrowserClient();
            const { error } = await withRequestTimeout(
              supabase.auth.signInWithPassword({ email: email.trim(), password }),
              "Supabase ne repond pas. Verifiez les variables d'environnement et l'acces reseau."
            );

            if (error) {
              toast.error(error.message);
              return;
            }

            toast.success("Connexion reussie.");
            const nextPath =
              new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
            window.location.href = nextPath;
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Connexion impossible.");
          } finally {
            setLoading(false);
          }
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
          <label className="mb-2 block text-sm font-medium text-slate-600">Mot de passe</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Saisir votre mot de passe"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-sm text-slate-500">
        <Link href="/auth/forgot-password" className="font-medium text-brand">
          Mot de passe oublie
        </Link>
        <Link href="/auth/sign-up" className="font-medium text-brand">
          Creer un compte
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
      title="Creer un compte"
      description="Demarrez avec un compte collaborateur. Les admins pourront ensuite inviter et attribuer les roles dans les reglages."
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
            toast.success("Compte cree.");
            window.location.href = "/dashboard";
          } else {
            toast.success("Compte cree. Verifiez votre boite mail pour confirmer l'adresse.");
            router.replace("/auth/sign-in");
          }
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Nom complet</label>
          <Input
            required
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Mounir Mestouria"
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
            <label className="mb-2 block text-sm font-medium text-slate-600">Mot de passe</label>
            <Input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Au moins 8 caracteres"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Fonction</label>
          <Input
            value={form.jobTitle}
            onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))}
            placeholder="Specialiste qualite"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Context</label>
          <Textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="Note d'accueil ou contexte de departement facultatif."
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creation du compte..." : "Creer le compte"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-500">
        Vous avez deja un acces ?{" "}
        <Link href="/auth/sign-in" className="font-medium text-brand">
          Se connecter
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
      title="Reinitialiser le mot de passe"
      description="Saisissez votre email et QMS Pro enverra un lien de reinitialisation vers cette application."
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

          toast.success("Lien de reinitialisation envoye.");
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
          {loading ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-500">
        <Link href="/auth/sign-in" className="font-medium text-brand">
          Retour a la connexion
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
      title="Choisir un nouveau mot de passe"
      description="Creez un nouveau mot de passe apres le retour depuis le lien de recuperation securise."
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

          toast.success("Mot de passe mis a jour.");
          window.location.href = "/dashboard";
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Nouveau mot de passe</label>
          <Input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Creer un mot de passe robuste"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enregistrement..." : "Mettre a jour le mot de passe"}
        </Button>
      </form>
    </AuthShell>
  );
}
