import { Types } from "mongoose";
import { deleteTransactionAction } from "@/lib/actions/transaction-actions";
import { dbConnect } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { getCurrentUser } from "@/lib/server-data";
import { Button } from "@/components/ui/button";

type TxnRow = { _id: Types.ObjectId; date: Date; description?: string; categoryName: string; type: "income" | "expense"; amount: number };
const PAGE_SIZE = 20;

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user?._id) return null;
  await dbConnect();

  const page = Number(params.page || 1);
  const query = {
    userId: user._id,
    ...(params.type && ["income", "expense"].includes(params.type) ? { type: params.type } : {}),
    ...(params.q ? { $or: [{ description: { $regex: params.q, $options: "i" } }, { categoryName: { $regex: params.q, $options: "i" } }] } : {}),
  };

  const [items, total] = await Promise.all([
    Transaction.find(query).sort({ date: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean() as Promise<TxnRow[]>,
    Transaction.countDocuments(query),
  ]);

  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <form className="grid gap-2 md:grid-cols-4">
        <input name="q" defaultValue={params.q} placeholder="Search description/category" className="h-10 rounded-md border px-3 dark:bg-zinc-900" />
        <select name="type" defaultValue={params.type} className="h-10 rounded-md border px-3 dark:bg-zinc-900"><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <Button>Apply Filters</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-left dark:bg-zinc-900"><tr><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2">Type</th><th className="p-2">Amount</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map((txn) => (
              <tr key={String(txn._id)} className="border-t">
                <td className="p-2">{new Date(txn.date).toLocaleDateString()}</td>
                <td className="p-2">{txn.description || txn.categoryName}</td>
                <td className="p-2 capitalize">{txn.type}</td>
                <td className="p-2">{txn.amount.toFixed(2)}</td>
                <td className="p-2"><form action={deleteTransactionAction.bind(null, String(txn._id))}><Button size="sm" variant="destructive">Delete</Button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2"><a className="rounded border px-3 py-1" href={`?q=${params.q || ""}&type=${params.type || ""}&page=${Math.max(1, page - 1)}`}>Prev</a><p className="px-2 py-1 text-sm">Page {page} of {maxPage}</p><a className="rounded border px-3 py-1" href={`?q=${params.q || ""}&type=${params.type || ""}&page=${Math.min(maxPage, page + 1)}`}>Next</a></div>
    </div>
  );
}
