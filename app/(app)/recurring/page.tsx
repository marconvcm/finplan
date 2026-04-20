import { Types } from "mongoose";
import { createRecurringAction, toggleRecurringPauseAction } from "@/lib/actions/recurring-actions";
import { dbConnect } from "@/lib/db/mongoose";
import { Category } from "@/lib/models/Category";
import { RecurringEntry } from "@/lib/models/RecurringEntry";
import { getCurrentUser, getUserLedgers } from "@/lib/server-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LedgerRow = { _id: Types.ObjectId; name: string };
type CategoryRow = { _id: Types.ObjectId; name: string };
type RecurringRow = { _id: Types.ObjectId; description?: string; categoryName: string; frequency: string; nextRunAt: Date; paused: boolean };

export default async function RecurringPage() {
  const user = await getCurrentUser();
  if (!user?._id) return null;
  await dbConnect();

  const [entries, ledgers, categories] = await Promise.all([
    RecurringEntry.find({ userId: user._id }).sort({ nextRunAt: 1 }).lean() as Promise<RecurringRow[]>,
    getUserLedgers(String(user._id)) as Promise<LedgerRow[]>,
    Category.find({ $or: [{ isDefault: true }, { userId: user._id }] }).sort({ name: 1 }).lean() as Promise<CategoryRow[]>,
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Recurring Entries</h1>
      <Card>
        <h2 className="mb-3 font-medium">Add recurring transaction</h2>
        <form action={createRecurringAction} className="grid gap-3 md:grid-cols-3">
          <input name="amount" type="number" step="0.01" placeholder="Amount" className="h-10 rounded-md border px-3 dark:bg-zinc-900" required />
          <select name="type" className="h-10 rounded-md border px-3 dark:bg-zinc-900"><option value="expense">Expense</option><option value="income">Income</option></select>
          <select name="ledgerId" className="h-10 rounded-md border px-3 dark:bg-zinc-900">{ledgers.map((l) => <option key={String(l._id)} value={String(l._id)}>{l.name}</option>)}</select>
          <select name="categoryId" className="h-10 rounded-md border px-3 dark:bg-zinc-900">{categories.map((c) => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}</select>
          <input name="categoryName" placeholder="Category name" className="h-10 rounded-md border px-3 dark:bg-zinc-900" required />
          <input name="description" placeholder="Description" className="h-10 rounded-md border px-3 dark:bg-zinc-900" />
          <select name="frequency" className="h-10 rounded-md border px-3 dark:bg-zinc-900"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="bi-weekly">Bi-weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
          <input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-10 rounded-md border px-3 dark:bg-zinc-900" required />
          <input name="date" type="hidden" value={new Date().toISOString().slice(0, 10)} />
          <Button className="md:col-span-3 md:w-fit">Create Recurring</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-3 font-medium">Upcoming</h2>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={String(entry._id)} className="flex items-center justify-between rounded border p-2 text-sm">
              <div>
                <p className="font-medium">{entry.description || entry.categoryName}</p>
                <p className="text-zinc-500">{entry.frequency} • next {new Date(entry.nextRunAt).toLocaleDateString()}</p>
              </div>
              <form action={toggleRecurringPauseAction.bind(null, String(entry._id), !entry.paused)}>
                <Button variant="secondary" size="sm">{entry.paused ? "Resume" : "Pause"}</Button>
              </form>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
