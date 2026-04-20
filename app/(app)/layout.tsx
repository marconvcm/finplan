import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser, getUserLedgers } from "@/lib/server-data";

type LedgerRow = { _id: Types.ObjectId; name: string };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user?._id) redirect("/");

  const ledgers = (await getUserLedgers(String(user._id))) as unknown as LedgerRow[];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar ledgers={ledgers.map((ledger) => ({ _id: String(ledger._id), name: ledger.name }))} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
