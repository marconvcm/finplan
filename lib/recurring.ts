import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  endOfMonth,
  isAfter,
  setDate,
  setDay,
} from "date-fns";

export type Frequency = "daily" | "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly";

export function computeNextRun(
  from: Date,
  frequency: Frequency,
  dayOfWeek?: number,
  dayOfMonth?: number,
  lastDayOfMonth?: boolean,
) {
  switch (frequency) {
    case "daily":
      return addDays(from, 1);
    case "weekly":
      return dayOfWeek == null ? addWeeks(from, 1) : setDay(addWeeks(from, 1), dayOfWeek, { weekStartsOn: 0 });
    case "bi-weekly":
      return addWeeks(from, 2);
    case "monthly": {
      const next = addMonths(from, 1);
      if (lastDayOfMonth) return endOfMonth(next);
      if (dayOfMonth) return setDate(next, Math.min(dayOfMonth, endOfMonth(next).getDate()));
      return next;
    }
    case "quarterly":
      return addQuarters(from, 1);
    case "yearly":
      return addYears(from, 1);
  }
}

export function shouldGenerate(now: Date, nextRunAt: Date, endDate?: Date | null) {
  if (endDate && isAfter(nextRunAt, endDate)) return false;
  return nextRunAt <= now;
}
