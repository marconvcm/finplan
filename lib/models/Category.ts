import { Schema, model, models, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    icon: { type: String, default: "CircleDollarSign" },
    color: { type: String, default: "#6366f1" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = models.Category || model("Category", categorySchema);
