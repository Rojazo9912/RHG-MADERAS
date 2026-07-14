"use client";

import { useRef, useTransition } from "react";

export default function LeadNoteForm({
  leadId,
  action,
}: {
  leadId: string;
  action: (leadId: string, note: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const note = new FormData(e.currentTarget).get("note");
        if (!note) return;
        startTransition(async () => {
          await action(leadId, String(note));
          formRef.current?.reset();
        });
      }}
      className="flex gap-2"
    >
      <input
        name="note"
        placeholder="Agregar nota / registro de contacto..."
        className="flex-1 rounded-md border border-brown-dark/20 px-3 py-2 text-sm"
      />
      <button
        disabled={isPending}
        className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Agregar"}
      </button>
    </form>
  );
}
