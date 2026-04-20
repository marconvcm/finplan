import { startOfMonth, startOfYear } from "date-fns";
import { Types } from "mongoose";
import { Card } from "@/components/ui/card";
import { dbConnect } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { Category } from "@/lib/models/Category";
import { User } from "@/lib/models/User";
import { QuickAddModal } from "@/components/transactions/quick-add-modal";
import { formatMoney } from "@/lib/utils";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { generateRecurringTransactionsAction } from "@/lib/actions/recurring-actions";
import { getCurrentUser, getUserLedgers } from "@/lib/server-data";

type AggRow = { _id: "income" | "expense"; total: number };
type TxnRow = {
  _id: Types.ObjectId;
  ledgerId: Types.ObjectId;
  amount: number;
  type: "income" | "expense";
  categoryName: string;
  description?: string;
  date: Date;
};

type CategoryRow = { _id: Types.ObjectId; name: string };

type LedgerRow = {
  _id: Types.ObjectId;
  name: string;
  currency: string;
  startingBalance: number;
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ ledgerId?: string }> }) {
  const { ledgerId } = await searchParams;
  const user = await getCurrentUser();
  if (!user?._id) return null;
  await dbConnect();

  await generateRecurringTransactionsAction();

  const ledgers = (await getUserLedgers(String(user._id))) as unknown as LedgerRow[];
  const activeLedger = ledgerId || String(ledgers[0]?._id || "");

  const transactions = (await Transaction.find({ userId: user._id, ledgerId: activeLedger })
    .sort({ date: -1 })
    .limit(8)
    .lean()) as unknown as TxnRow[];
  const categories = (await Category.find({ $or: [{ isDefault: true }, { userId: user._id }] })
    .sort({ name: 1 })
    .lean()) as unknown as CategoryRow[];

  const monthStart = startOfMonth(new Date());
  const yearStart = startOfYear(new Date());

  const [monthlyAgg, yearlyAgg] = (await Promise.all([
    Transaction.aggregate([{ $match: { userId: user._id, ledgerId: transactions[0]?.ledgerId, date: { $gte: monthStart } } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { userId: user._id, ledgerId: transactions[0]?.ledgerId, date: { $gte: yearStart } } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
  ])) as [AggRow[], AggRow[]];

  const incomeMonth = monthlyAgg.find((a) => a._id === "income")?.total || 0;
  const expenseMonth = monthlyAgg.find((a) => a._id === "expense")?.total || 0;
  const incomeYear = yearlyAgg.find((a) => a._id === "income")?.total || 0;
  const expenseYear = yearlyAgg.find((a) => a._id === "expense")?.total || 0;

  const selectedLedger = ledgers.find((l) => String(l._id) === activeLedger);
  const runningBalance = (selectedLedger?.startingBalance || 0) + incomeYear - expenseYear;
  const freshUser = await User.findById(user._id).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-zinc-500">Ledger Balance</p><p className="text-2xl font-semibold">{formatMoney(runningBalance, selectedLedger?.currency)}</p></Card>
        <Card><p className="text-sm text-zinc-500">Income (Month)</p><p className="text-2xl font-semibold text-emerald-600">{formatMoney(incomeMonth, selectedLedger?.currency)}</p></Card>
        <Card><p className="text-sm text-zinc-500">Expense (Month)</p><p className="text-2xl font-semibold text-rose-600">{formatMoney(expenseMonth, selectedLedger?.currency)}</p></Card>
      </div>

      <Card><h2 className="mb-3 font-medium">Cashflow</h2><CashflowChart data={[{ label: "This Month", income: incomeMonth, expense: expenseMonth }, { label: "This Year", income: incomeYear, expense: expenseYear }]} /></Card>

      <Card>
        <h2 className="mb-3 font-medium">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map((txn) => (
            <div key={String(txn._id)} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium">{txn.description || txn.categoryName}</p>
                <p className="text-zinc-500">{new Date(txn.date).toLocaleDateString()} • {txn.categoryName}</p>
              </div>
              <p className={txn.type === "expense" ? "text-rose-600" : "text-emerald-600"}>{txn.type === "expense" ? "-" : "+"}{formatMoney(txn.amount, selectedLedger?.currency)}</p>
            </div>
          ))}
        </div>
      </Card>

      <QuickAddModal
        ledgers={ledgers.map((ledger) => ({ _id: String(ledger._id), name: ledger.name }))}
        categories={categories.map((category) => ({ _id: String(category._id), name: category.name }))}
        defaultLedgerId={activeLedger}
        lastCategoryId={String(freshUser?.lastUsedCategoryId || "")}
      />
    </div>
  );
}
