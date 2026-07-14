"use client";

import { useState, useTransition } from "react";

export default function NewPageForm({
  action,
}: {
  action: (input: { title: string; slug?: string }) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        const title = String(fd.get("title") || "");
        const slug = String(fd.get("slug") || "");
        if (!title) return;
        startTransition(async () => {
          try {
            await action({ title, slug: slug || undefined });
          } catch (err) {
            // redirect() de Next lanza una excepción especial NEXT_REDIRECT;
            // si llega aquí es un error real.
            if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
              setError(err.message);
            }
          }
        });
      }}
      className="flex flex-wrap gap-2 items-end"
    >
      <div>
        <label className="block text-xs font-medium mb-1">Título</label>
        <input name="title" required className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Slug (opcional)</label>
        <input name="slug" placeholder="se genera del título" className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm" />
      </div>
      <button
        disabled={isPending}
        className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Nueva página"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
