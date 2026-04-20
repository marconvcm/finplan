import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Transactions", "/transactions"],
  ["Recurring", "/recurring"],
  ["Ledgers", "/ledgers"],
  ["Reports", "/reports"],
];

export function Sidebar({ ledgers }: { ledgers: Array<{ _id: string; name: string }> }) {
  return (
    <aside className="w-full border-b p-4 md:w-72 md:border-b-0 md:border-r">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold">FinLedger</Link>
        <ThemeToggle />
      </div>

      <div className="mb-4">
        <p className="mb-1 text-xs uppercase text-zinc-500">Ledgers</p>
        <div className="space-y-1">
          {ledgers.map((ledger) => (
            <Link key={ledger._id} href={`/dashboard?ledgerId=${ledger._id}`} className="block rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">
              {ledger.name}
            </Link>
          ))}
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        <Link href="/auth/logout" className="text-sm text-rose-600">Logout</Link>
      </div>
    </aside>
  );
}
