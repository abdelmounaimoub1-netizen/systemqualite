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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-mesh-grid p-6">
        <Card className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            QMS Pro hit an unexpected error while loading this area.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </Card>
      </body>
    </html>
  );
}
