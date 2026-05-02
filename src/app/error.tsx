"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-grid p-6">
      <Card className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold text-ink">Une erreur est survenue</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          QMS Pro a rencontre une erreur inattendue pendant le chargement de cette zone.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Reessayer</Button>
          <Link href="/dashboard">
            <Button variant="secondary">Tableau de bord</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
