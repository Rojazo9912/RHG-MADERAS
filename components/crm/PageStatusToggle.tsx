"use client";

import { useTransition } from "react";
import type { PageStatus } from "@/types/database";
import { useToast } from "@/components/ui/Toast";

export default function PageStatusToggle({
  pageId,
  status,
  action,
}: {
  pageId: string;
  status: PageStatus;
  action: (pageId: string, status: PageStatus) => Promise<void>;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const next: PageStatus = status === "publicada" ? "borrador" : "publicada";

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await action(pageId, next);
            toast.show(next === "publicada" ? "Página publicada." : "Página pasada a borrador.");
          } catch {
            toast.show("No se pudo cambiar el estado.", "error");
          }
        })
      }
      className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
        status === "publicada" ? "bg-forest/20 text-forest" : "bg-brown-dark/10 text-brown-dark/60"
      }`}
    >
      {status === "publicada" ? "Publicada" : "Borrador"}
    </button>
  );
}
