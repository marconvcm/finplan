"use server";

import { revalidatePath } from "next/cache";
import { recurringSchema } from "@/lib/validators/common";
import { dbConnect } from "@/lib/db/mongoose";
import { getCurrentUser } from "@/lib/server-data";
import { RecurringEntry } from "@/lib/models/RecurringEntry";
import { Transaction } from "@/lib/models/Transaction";
import { computeNextRun, shouldGenerate } from "@/lib/recurring";
import { normalizeInput } from "@/lib/actions/helpers";

export async function createRecurringAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");
  const parsed = recurringSchema.parse(normalizeInput(input));

  await dbConnect();
  await RecurringEntry.create({
    ...parsed,
    date: undefined,
    userId: user._id,
    nextRunAt: parsed.startDate,
  });

  revalidatePath("/recurring");
}

export async function toggleRecurringPauseAction(id: string, paused: boolean) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");
  await dbConnect();
  await RecurringEntry.updateOne({ _id: id, userId: user._id }, { $set: { paused } });
  revalidatePath("/recurring");
}

export async function generateRecurringTransactionsAction() {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");
  await dbConnect();

  const now = new Date();
  const entries = await RecurringEntry.find({ userId: user._id, paused: false }).lean();

  for (const entry of entries) {
    if (!shouldGenerate(now, entry.nextRunAt, entry.endDate)) continue;

    await Transaction.create({
      userId: entry.userId,
      ledgerId: entry.ledgerId,
      amount: entry.amount,
      type: entry.type,
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      description: entry.description,
      date: entry.nextRunAt,
      tags: entry.tags,
      sourceRecurringId: entry._id,
    });

    const nextRunAt = computeNextRun(
      entry.nextRunAt,
      entry.frequency,
      entry.dayOfWeek,
      entry.dayOfMonth,
      entry.lastDayOfMonth,
    );

    await RecurringEntry.updateOne(
      { _id: entry._id },
      {
        $set: {
          lastGeneratedAt: entry.nextRunAt,
          nextRunAt,
        },
      },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/recurring");
}
