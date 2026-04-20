import { Schema, model, models, type InferSchemaType } from "mongoose";

const recurringEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ledgerId: { type: Schema.Types.ObjectId, ref: "Ledger", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    frequency: {
      type: String,
      enum: ["daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    dayOfMonth: { type: Number, min: 1, max: 31 },
    lastDayOfMonth: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    paused: { type: Boolean, default: false },
    nextRunAt: { type: Date, required: true, index: true },
    lastGeneratedAt: { type: Date },
  },
  { timestamps: true },
);

export type RecurringEntryDoc = InferSchemaType<typeof recurringEntrySchema>;
export const RecurringEntry =
  models.RecurringEntry || model("RecurringEntry", recurringEntrySchema);
