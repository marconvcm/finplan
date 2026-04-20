"use server";

import { revalidatePath } from "next/cache";
import { recurringSchema } from "@/lib/validators/common";
import { dbConnect } from "@/lib/db/mongoose";
import { getCurrentUser } from "@/lib/server-data";
import { RecurringEntry } from "@/lib/models/RecurringEntry";
import { normalizeInput } from "@/lib/actions/helpers";
import { generateRecurringTransactionsForUser } from "@/lib/recurring-generator";

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
  await generateRecurringTransactionsForUser(String(user._id));
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/recurring");
}
