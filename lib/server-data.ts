import { cache } from "react";
import { auth0 } from "@/lib/auth0";
import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { Ledger } from "@/lib/models/Ledger";

export const getCurrentUser = cache(async () => {
  const session = await auth0.getSession();
  if (!session?.user) return null;

  await dbConnect();
  const auth0Id = session.user.sub!;
  const email = session.user.email || `${auth0Id}@unknown.local`;
  const name = session.user.name || "FinLedger User";

  const dbUser = await User.findOneAndUpdate(
    { auth0Id },
    {
      $setOnInsert: {
        auth0Id,
        email,
        name,
        picture: session.user.picture,
      },
    },
    { upsert: true, new: true },
  ).lean();

  return dbUser;
});

export async function getUserLedgers(userId: string) {
  await dbConnect();
  return Ledger.find({ userId, archived: false }).sort({ createdAt: 1 }).lean();
}
