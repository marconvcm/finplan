import { dbConnect } from "@/lib/db/mongoose";
import { RecurringEntry } from "@/lib/models/RecurringEntry";
import { Transaction } from "@/lib/models/Transaction";
import { computeNextRun, shouldGenerate } from "@/lib/recurring";

export async function generateRecurringTransactionsForUser(userId: string) {
  await dbConnect();

  const now = new Date();
  const entries = await RecurringEntry.find({ userId, paused: false }).lean();

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
}
