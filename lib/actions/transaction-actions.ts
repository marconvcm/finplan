"use server";

import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validators/common";
import { dbConnect } from "@/lib/db/mongoose";
import { getCurrentUser } from "@/lib/server-data";
import { Transaction } from "@/lib/models/Transaction";
import { User } from "@/lib/models/User";
import { normalizeInput } from "@/lib/actions/helpers";

export async function createTransactionAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");
  const parsed = transactionSchema.parse(normalizeInput(input));

  await dbConnect();
  await Transaction.create({ ...parsed, userId: user._id });

  await User.updateOne({ _id: user._id }, { $set: { lastUsedCategoryId: parsed.categoryId } });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function deleteTransactionAction(id: string) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");
  await dbConnect();
  await Transaction.deleteOne({ _id: id, userId: user._id });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}
