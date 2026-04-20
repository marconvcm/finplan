"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "@/lib/actions/transaction-actions";

type Props = {
  ledgers: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; name: string }>;
  defaultLedgerId?: string;
  lastCategoryId?: string;
};

export function QuickAddModal({ ledgers, categories, defaultLedgerId, lastCategoryId }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((s) => !s);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-5 right-5 rounded-full shadow-lg" size="icon">
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="mb-4 text-lg font-semibold">Quick Add Transaction</h3>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            startTransition(async () => {
              await createTransactionAction({
                ledgerId: data.get("ledgerId"),
                amount: data.get("amount"),
                type: data.get("type"),
                categoryId: data.get("categoryId"),
                categoryName: categories.find((item) => item._id === data.get("categoryId"))?.name,
                description: data.get("description"),
                date: data.get("date"),
                tags: String(data.get("tags") || "")
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              });
              setOpen(false);
            });
          }}
        >
          <div>
            <Label>Amount</Label>
            <Input name="amount" type="number" step="0.01" required />
          </div>
          <div>
            <Label>Type</Label>
            <select name="type" className="h-10 w-full rounded-md border px-3 dark:bg-zinc-900">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <Label>Ledger</Label>
            <select name="ledgerId" defaultValue={defaultLedgerId} className="h-10 w-full rounded-md border px-3 dark:bg-zinc-900">
              {ledgers.map((ledger) => <option key={ledger._id} value={ledger._id}>{ledger.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Category</Label>
            <select name="categoryId" defaultValue={lastCategoryId} className="h-10 w-full rounded-md border px-3 dark:bg-zinc-900">
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Description</Label>
            <Input name="description" />
          </div>
          <div>
            <Label>Date</Label>
            <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div>
            <Label>Tags</Label>
            <Input name="tags" placeholder="comma,separated" />
          </div>
          <Button className="w-full" disabled={pending}>{pending ? "Saving..." : "Add Transaction"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
