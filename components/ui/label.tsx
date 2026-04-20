import * as LabelPrimitive from "@radix-ui/react-label";

export function Label(props: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className="text-sm font-medium" {...props} />;
}
