import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900",
        props.className,
      )}
    />
  );
}
