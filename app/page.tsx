import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">FinLedger • Next.js 15 + Bun</p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">Track every dollar with confidence.</h1>
      <p className="mb-8 max-w-2xl text-zinc-600 dark:text-zinc-400">A modern multi-ledger finance app with recurring entries, quick-add workflows, charts, reports, and CSV exports.</p>
      <div className="flex gap-3">
        <Button asChild><Link href="/auth/login?screen_hint=signup">Get Started</Link></Button>
        <Button variant="secondary" asChild><Link href="/auth/login">Log In</Link></Button>
      </div>
    </main>
  );
}
