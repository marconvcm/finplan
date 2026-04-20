export type EntryType = "income" | "expense";

export type LedgerSummary = {
  _id: string;
  name: string;
  currency: string;
  description: string;
  startingBalance: number;
  balance: number;
};
