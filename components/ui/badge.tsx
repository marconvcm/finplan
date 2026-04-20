import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800", className)} {...props} />;
}
