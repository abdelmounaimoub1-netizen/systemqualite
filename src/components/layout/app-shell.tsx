"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BellRing, Home, LogOut, Menu, Settings, UserCircle2, X } from "lucide-react";
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
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItems = useMemo(
    () =>
      appNavItems.map((item) => ({
        ...item,
        active: pathname === item.href || pathname.startsWith(`${item.href}/`)
      })),
    [pathname]
  );

  const improvementPaths = new Set([
    "/customer-complaints",
    "/supplier-complaints",
    "/non-conformities",
    "/constats",
    "/complaints",
    "/capa-actions",
    "/audits"
  ]);

  const portalTabs = [
    {
      href: "/dashboard?portal=documentaire",
      label: "Portail Documentaire",
      active: pathname === "/dashboard" && searchParams.get("portal") !== "amelioration"
    },
    {
      href: "/dashboard?portal=amelioration",
      label: "Portail Amelioration",
      active:
        (pathname === "/dashboard" && searchParams.get("portal") === "amelioration") ||
        Array.from(improvementPaths).some(
          (path) => pathname === path || pathname.startsWith(`${path}/`)
        )
    }
  ];

  async function signOut() {
    const response = await fetch("/auth/sign-out", { method: "POST" });
    if (response.ok) window.location.href = "/auth/sign-in";
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecf7fc_0%,#ffffff_46%,#fff8d8_100%)] text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-14 flex-col bg-[#2749a0] text-white">
        <Link
          href="/dashboard"
          title="Portail"
          className="flex h-14 items-center justify-center border-b border-white/15 bg-[#1f3f91] hover:bg-[#00a9da]"
        >
          <Home className="h-6 w-6" />
        </Link>
        <div className="flex flex-1 flex-col items-center gap-2 pt-2">
          <span className="text-[10px] font-semibold text-[#ffcd12]">Portail</span>
        </div>
      </aside>

      <div className="min-h-screen pl-14">
        <header className="sticky top-0 z-30 border-b border-[#b9def4] bg-white/90 shadow-sm backdrop-blur">
          <div className="flex min-h-12 items-stretch justify-between gap-3 px-3">
            <nav className="flex min-w-0 items-stretch overflow-x-auto">
              {portalTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center border-r border-[#cfe8f6] px-4 text-sm font-semibold whitespace-nowrap transition",
                    tab.active
                      ? "bg-[#fff4b8] text-[#2749a0] shadow-[inset_0_-3px_0_#ffcd12]"
                      : "text-muted hover:bg-[#d7f8ff] hover:text-[#2749a0]"
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1 py-1.5">
              <ServiceWorkerRegister />
              <button
                type="button"
                title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#b9def4] bg-white text-[#2749a0] hover:bg-[#d7f8ff]"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <Link
                href="/notifications"
                title="Alertes"
                aria-label="Alertes"
                className="hidden h-8 w-8 items-center justify-center rounded border border-[#b9def4] bg-white text-[#2749a0] hover:bg-[#d7f8ff] sm:inline-flex"
              >
                <BellRing className="h-4 w-4" />
              </Link>
              <Link
                href="/settings"
                title="Parametres"
                aria-label="Parametres"
                className="hidden h-8 w-8 items-center justify-center rounded border border-[#b9def4] bg-white text-[#2749a0] hover:bg-[#d7f8ff] sm:inline-flex"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                href="/profile"
                title={context.profile?.full_name ?? context.email}
                aria-label="Profil"
                className="hidden h-8 min-w-8 items-center justify-center rounded border border-[#b9def4] bg-white px-2 text-xs font-semibold text-[#2749a0] hover:bg-[#fff4b8] md:inline-flex"
              >
                <UserCircle2 className="mr-1 h-4 w-4" />
                {initials(context.profile?.full_name ?? context.email)}
              </Link>
              <Button
                variant="ghost"
                title="Sortir"
                aria-label="Sortir"
                className="h-8 w-8 px-0"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {menuOpen ? (
            <div className="border-t border-[#b9def4] bg-white/95 p-3">
              <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {activeItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded border px-3 py-2 text-sm transition",
                        item.active
                          ? "border-[#2749a0] bg-[#d7f8ff] text-[#2749a0]"
                          : "border-[#cfe8f6] bg-[#f8fcff] text-ink hover:border-[#00a9da] hover:bg-[#fff4b8]"
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : null}
        </header>

        <main className="mx-auto min-h-[calc(100vh-3rem)] max-w-[1480px] p-3 md:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
