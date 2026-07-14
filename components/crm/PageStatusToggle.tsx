"use client";

import { useTransition } from "react";
import type { PageStatus } from "@/types/database";

export default function PageStatusToggle({
  pageId,
  status,
  action,
}: {
  pageId: string;
  status: PageStatus;
  action: (pageId: string, status: PageStatus) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const next: PageStatus = status === "publicada" ? "borrador" : "publicada";

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => action(pageId, next))}
      className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
        status === "publicada" ? "bg-forest/20 text-forest" : "bg-brown-dark/10 text-brown-dark/60"
      }`}
    >
      {status === "publicada" ? "Publicada" : "Borrador"}
    </button>
  );
}
