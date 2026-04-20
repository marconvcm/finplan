import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

export const ledgerSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional().default(""),
  currency: z.string().length(3).default("USD"),
  startingBalance: z.coerce.number(),
});

export const transactionSchema = z.object({
  ledgerId: objectIdSchema,
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  categoryId: objectIdSchema,
  categoryName: z.string().min(1),
  description: z.string().max(250).optional().default(""),
  date: z.coerce.date(),
  tags: z.array(z.string().trim().max(30)).optional().default([]),
});

export const recurringSchema = transactionSchema.extend({
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"]),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  lastDayOfMonth: z.coerce.boolean().optional().default(false),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});
