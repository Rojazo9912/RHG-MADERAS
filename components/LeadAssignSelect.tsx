"use client";

import { useTransition } from "react";
import type { Profile } from "@/types/database";

export default function LeadAssignSelect({
  leadId,
  current,
  vendedores,
  action,
}: {
  leadId: string;
  current: string | null;
  vendedores: Pick<Profile, "id" | "full_name">[];
  action: (leadId: string, assignedTo: string | null) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current ?? ""}
      disabled={isPending}
      onChange={(e) => startTransition(() => action(leadId, e.target.value || null))}
      className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm disabled:opacity-60"
    >
      <option value="">Sin asignar</option>
      {vendedores.map((v) => (
        <option key={v.id} value={v.id}>
          {v.full_name}
        </option>
      ))}
    </select>
  );
}
