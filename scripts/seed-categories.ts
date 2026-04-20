import { dbConnect } from "../lib/db/mongoose";
import { Category } from "../lib/models/Category";

const defaults = [
  ["Salary", "Wallet", "#16a34a"],
  ["Freelance", "Briefcase", "#22c55e"],
  ["Groceries", "ShoppingCart", "#f97316"],
  ["Rent", "House", "#ef4444"],
  ["Utilities", "Lightbulb", "#f59e0b"],
  ["Transport", "Car", "#3b82f6"],
  ["Entertainment", "Film", "#a855f7"],
  ["Savings", "PiggyBank", "#14b8a6"],
  ["Health", "HeartPulse", "#ec4899"],
] as const;

async function run() {
  await dbConnect();

  for (const [name, icon, color] of defaults) {
    await Category.updateOne(
      { name, isDefault: true },
      { $setOnInsert: { name, icon, color, isDefault: true } },
      { upsert: true },
    );
  }

  console.log(`Seeded ${defaults.length} default categories.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
