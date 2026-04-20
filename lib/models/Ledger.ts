import { Schema, model, models, type InferSchemaType } from "mongoose";

const ledgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    currency: { type: String, required: true, default: "USD" },
    startingBalance: { type: Number, required: true, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ledgerSchema.index({ userId: 1, name: 1 }, { unique: true });

export type LedgerDoc = InferSchemaType<typeof ledgerSchema>;
export const Ledger = models.Ledger || model("Ledger", ledgerSchema);
