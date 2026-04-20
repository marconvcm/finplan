"use server";

import { Types } from "mongoose";
import { getCurrentUser } from "@/lib/server-data";
import { dbConnect } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";

type CsvRow = { date: Date; type: string; amount: number; categoryName: string; description?: string; tags?: string[] };

export async function exportLedgerCsvAction(ledgerId: string) {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error("Unauthorized");

  await dbConnect();
  const rows = (await Transaction.find({ userId: user._id, ledgerId: new Types.ObjectId(ledgerId) }).sort({ date: -1 }).lean()) as unknown as CsvRow[];

  const headers = ["Date", "Type", "Amount", "Category", "Description", "Tags"];
  const body = rows.map((row) => [new Date(row.date).toISOString().slice(0, 10), row.type, row.amount.toString(), row.categoryName, (row.description || "").replaceAll('"', '""'), (row.tags || []).join("|")].map((value) => `"${value}"`).join(","));
  return [headers.join(","), ...body].join("\n");
}
