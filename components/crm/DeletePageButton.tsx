"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function DeletePageButton({
  pageId,
  pageTitle,
  action,
}: {
  pageId: string;
  pageTitle: string;
  action: (pageId: string) => Promise<void>;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Borrar página ${pageTitle}`}
        className="text-brown-dark/30 hover:text-red-600 transition-colors"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={open}
        title={`¿Borrar "${pageTitle}"?`}
        description="Se borrarán también todos sus bloques. Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          startTransition(async () => {
            try {
              await action(pageId);
              toast.show("Página borrada.");
            } catch {
              toast.show("No se pudo borrar la página.", "error");
            }
          });
        }}
      />

      {isPending && <span className="sr-only">Borrando…</span>}
    </>
  );
}
