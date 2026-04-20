import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String },
    lastUsedCategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = models.User || model("User", userSchema);
