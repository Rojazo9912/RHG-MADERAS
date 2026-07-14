"use client";

import { useTransition } from "react";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/types/database";
import { useToast } from "@/components/ui/Toast";

const ESTADOS: LeadStatus[] = ["nuevo", "contactado", "cotizado", "cerrado", "perdido"];

export default function LeadStatusSelect({
  leadId,
  current,
  action,
}: {
  leadId: string;
  current: LeadStatus;
  action: (leadId: string, estado: LeadStatus) => Promise<void>;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          const estado = e.target.value as LeadStatus;
          try {
            await action(leadId, estado);
            toast.show(`Estado actualizado a "${LEAD_STATUS_LABELS[estado]}".`);
          } catch {
            toast.show("No se pudo actualizar el estado.", "error");
          }
        })
      }
      className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm disabled:opacity-60"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {LEAD_STATUS_LABELS[e]}
        </option>
      ))}
    </select>
  );
}
