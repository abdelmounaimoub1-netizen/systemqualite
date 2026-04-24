import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mesh-grid p-6">
      <Card className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-ink">You&apos;re offline</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          QMS Pro cached the shell so you can reopen the app, but live records and Supabase actions need a connection.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Return to app</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
