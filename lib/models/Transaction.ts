import { Schema, model, models, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ledgerId: { type: Schema.Types.ObjectId, ref: "Ledger", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true, index: true },
    tags: [{ type: String }],
    sourceRecurringId: { type: Schema.Types.ObjectId, ref: "RecurringEntry" },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, ledgerId: 1, date: -1 });

export type TransactionDoc = InferSchemaType<typeof transactionSchema>;
export const Transaction = models.Transaction || model("Transaction", transactionSchema);
