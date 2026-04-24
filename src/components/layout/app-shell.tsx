"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, LogOut, Menu, Settings, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import { appNavItems } from "@/lib/modules/config";
import { initials, cn } from "@/lib/utils";
import type { UserContext } from "@/types/app";
import { Button } from "@/components/ui/button";
import { ServiceWorkerRegister } from "@/components/ui/service-worker-register";

type AppShellProps = {
  children: React.ReactNode;
  context: UserContext;
};

export function AppShell({ children, context }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItems = useMemo(
    () =>
      appNavItems.map((item) => ({
        ...item,
        active: pathname === item.href || pathname.startsWith(`${item.href}/`)
      })),
    [pathname]
  );

  async function signOut() {
    const response = await fetch("/auth/sign-out", { method: "POST" });
    if (response.ok) window.location.href = "/auth/sign-in";
  }

  return (
    <div className="min-h-screen bg-mesh-grid text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 p-3 md:p-5">
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-card">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                QMS Pro
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Quality work, visibly under control.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Documents, CAPA, audits, risks, training, and supplier oversight in one installable workspace.
              </p>
            </div>

            <nav className="mt-8 flex-1 space-y-1">
              {activeItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      item.active
                        ? "bg-white text-ink"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="rounded-3xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {initials(context.profile?.full_name ?? context.email)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {context.profile?.full_name ?? context.email}
                  </div>
                  <div className="truncate text-xs uppercase tracking-[0.2em] text-slate-300">
                    {context.role.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/profile" className="flex-1">
                  <Button variant="secondary" className="w-full justify-center">
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="flex-1 justify-center text-white hover:bg-white/10 hover:text-white"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-3 z-20 mb-5 rounded-[2rem] border border-white/70 bg-white/80 px-4 py-4 shadow-card backdrop-blur-sm md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
                  onClick={() => setMobileOpen((value) => !value)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                    Installable quality workspace
                  </div>
                  <div className="text-lg font-semibold text-ink">QMS Pro</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ServiceWorkerRegister />
                <Link href="/notifications">
                  <Button variant="secondary" className="hidden sm:inline-flex">
                    <BellRing className="h-4 w-4" />
                    Alerts
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="secondary" className="hidden sm:inline-flex">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>

            {mobileOpen ? (
              <div className="mt-4 grid gap-2 lg:hidden">
                {activeItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                        item.active
                          ? "bg-brand text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </header>

          <main className="flex-1 pb-24 lg:pb-6">{children}</main>

          <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[1.75rem] border border-white/70 bg-white/90 p-2 shadow-card backdrop-blur-sm lg:hidden">
            <div className="grid grid-cols-4 gap-1">
              {activeItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-medium",
                      item.active ? "bg-brand text-white" : "text-slate-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
