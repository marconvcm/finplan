import { Types } from "mongoose";
import { createLedgerAction } from "@/lib/actions/ledger-actions";
import { dbConnect } from "@/lib/db/mongoose";
import { Ledger } from "@/lib/models/Ledger";
import { getCurrentUser } from "@/lib/server-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LedgerRow = { _id: Types.ObjectId; name: string; description?: string; currency: string; startingBalance: number };

export default async function LedgersPage() {
  const user = await getCurrentUser();
  if (!user?._id) return null;
  await dbConnect();

  const ledgers = (await Ledger.find({ userId: user._id, archived: false }).sort({ createdAt: -1 }).lean()) as unknown as LedgerRow[];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Ledgers</h1>
      <Card>
        <h2 className="mb-3 font-medium">Create Ledger</h2>
        <form action={createLedgerAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Business" className="h-10 rounded-md border px-3 dark:bg-zinc-900" required />
          <input name="currency" defaultValue="USD" className="h-10 rounded-md border px-3 uppercase dark:bg-zinc-900" required />
          <input name="startingBalance" type="number" step="0.01" defaultValue="0" className="h-10 rounded-md border px-3 dark:bg-zinc-900" required />
          <input name="description" placeholder="Ledger description" className="h-10 rounded-md border px-3 dark:bg-zinc-900" />
          <Button className="md:col-span-2 md:w-fit">Create Ledger</Button>
        </form>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {ledgers.map((ledger) => (
          <Card key={String(ledger._id)}>
            <h3 className="font-semibold">{ledger.name}</h3>
            <p className="text-sm text-zinc-500">{ledger.description || "No description"}</p>
            <p className="mt-2 text-sm">Currency: {ledger.currency}</p>
            <p className="text-sm">Starting balance: {ledger.startingBalance.toFixed(2)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
