"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { BlockContent, PageBlock } from "@/types/database";
import { BLOCK_TYPE_LABELS } from "@/types/database";
import BlockFields from "./BlockFields";

export default function SortableBlockCard({
  block,
  selected,
  onSelect,
  onChange,
  onDelete,
  onPickImage,
}: {
  block: PageBlock;
  selected: boolean;
  onSelect: () => void;
  onChange: <K extends keyof BlockContent>(key: K, value: BlockContent[K]) => void;
  onDelete: () => void;
  onPickImage: (onSelect: (url: string) => void) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`rounded-xl border bg-white p-4 transition-colors ${
        selected ? "border-amber ring-1 ring-amber" : "border-brown-dark/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Arrastrar para reordenar"
            className="cursor-grab active:cursor-grabbing text-brown-dark/30 hover:text-brown-dark/60 touch-none"
          >
            <GripVertical className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-forest">
            {BLOCK_TYPE_LABELS[block.type]}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Borrar bloque"
          className="text-brown-dark/30 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <BlockFields block={block} content={block.content} onChange={onChange} onPickImage={onPickImage} />
      </div>
    </div>
  );
}
