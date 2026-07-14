"use client";

import { useTransition } from "react";
import type { BlockType } from "@/types/database";
import { BLOCK_TYPE_LABELS } from "@/types/database";

const TYPES: BlockType[] = [
  "hero",
  "heading",
  "text",
  "image",
  "product_grid",
  "stats",
  "cta_banner",
  "spacer",
];

export default function AddBlockForm({
  pageId,
  action,
}: {
  pageId: string;
  action: (pageId: string, type: BlockType) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const type = new FormData(e.currentTarget).get("type") as BlockType;
        startTransition(() => action(pageId, type));
      }}
      className="flex gap-2"
    >
      <select name="type" className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm">
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {BLOCK_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <button
        disabled={isPending}
        className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-brown-dark disabled:opacity-60"
      >
        {isPending ? "Agregando..." : "+ Agregar bloque"}
      </button>
    </form>
  );
}
