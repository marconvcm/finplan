"use server";

import { revalidatePath } from "next/cache";
import { ledgerSchema } from "@/lib/validators/common";
import { getCurrentUser } from "@/lib/server-data";
import { dbConnect } from "@/lib/db/mongoose";
import { Ledger } from "@/lib/models/Ledger";
import { normalizeInput } from "@/lib/actions/helpers";

export async function createLedgerAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");

  const parsed = ledgerSchema.parse(normalizeInput(input));
  await dbConnect();

  await Ledger.create({
    userId: user._id,
    ...parsed,
    currency: parsed.currency.toUpperCase(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/ledgers");
}
