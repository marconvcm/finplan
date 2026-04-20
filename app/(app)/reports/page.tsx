import { startOfMonth, startOfYear } from "date-fns";
import { Types } from "mongoose";
import { Card } from "@/components/ui/card";
import { dbConnect } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { getCurrentUser, getUserLedgers } from "@/lib/server-data";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

type LedgerRow = { _id: Types.ObjectId; name: string };
type AggRow = { _id: "income" | "expense"; total: number };

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user?._id) return null;

  await dbConnect();
  const ledgers = (await getUserLedgers(String(user._id))) as unknown as LedgerRow[];

  const summaries = await Promise.all(
    ledgers.map(async (ledger) => {
      const monthStart = startOfMonth(new Date());
      const yearStart = startOfYear(new Date());
      const [month, year] = (await Promise.all([
        Transaction.aggregate([{ $match: { userId: user._id, ledgerId: ledger._id, date: { $gte: monthStart } } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
        Transaction.aggregate([{ $match: { userId: user._id, ledgerId: ledger._id, date: { $gte: yearStart } } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
      ])) as [AggRow[], AggRow[]];
      return { ledger, month, year };
    }),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {summaries.map(({ ledger, month, year }) => {
          const monthIncome = month.find((a) => a._id === "income")?.total || 0;
          const monthExpense = month.find((a) => a._id === "expense")?.total || 0;
          const yearIncome = year.find((a) => a._id === "income")?.total || 0;
          const yearExpense = year.find((a) => a._id === "expense")?.total || 0;

          return (
            <Card key={String(ledger._id)}>
              <h2 className="mb-2 font-semibold">{ledger.name}</h2>
              <p className="text-sm">Monthly: +{monthIncome.toFixed(2)} / -{monthExpense.toFixed(2)}</p>
              <p className="mb-3 text-sm">Yearly: +{yearIncome.toFixed(2)} / -{yearExpense.toFixed(2)}</p>
              <ExportCsvButton ledgerId={String(ledger._id)} ledgerName={ledger.name} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
