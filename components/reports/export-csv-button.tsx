"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { exportLedgerCsvAction } from "@/lib/actions/report-actions";

export function ExportCsvButton({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        startTransition(async () => {
          const csv = await exportLedgerCsvAction(ledgerId);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${ledgerName.toLowerCase().replace(/\s+/g, "-")}-transactions.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      }}
    >
      {pending ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
