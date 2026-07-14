"use client";

import { useState, useTransition } from "react";
import type {
  BlockContent,
  PageBlock,
  ProductGridItem,
  StatsItem,
} from "@/types/database";
import { BLOCK_TYPE_LABELS } from "@/types/database";
import ImageUploader from "./ImageUploader";

type Actions = {
  updateBlockContent: (blockId: string, pageId: string, content: BlockContent) => Promise<void>;
  deleteBlock: (blockId: string, pageId: string) => Promise<void>;
  moveBlock: (pageId: string, blockId: string, direction: "up" | "down") => Promise<void>;
};

export default function BlockEditorCard({
  pageId,
  block,
  isFirst,
  isLast,
  actions,
}: {
  pageId: string;
  block: PageBlock;
  isFirst: boolean;
  isLast: boolean;
  actions: Actions;
}) {
  const [content, setContent] = useState<BlockContent>(block.content);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function set<K extends keyof BlockContent>(key: K, value: BlockContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      await actions.updateBlockContent(block.id, pageId, content);
      setSavedAt(Date.now());
    });
  }

  const inputCls = "w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm";
  const labelCls = "block text-xs font-medium mb-1 text-brown-dark/60";

  return (
    <div className="rounded-lg border border-brown-dark/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-forest">
          {BLOCK_TYPE_LABELS[block.type]}
        </span>
        <div className="flex gap-1 text-xs">
          <button
            disabled={isFirst || isPending}
            onClick={() => startTransition(() => actions.moveBlock(pageId, block.id, "up"))}
            className="rounded border border-brown-dark/20 px-2 py-1 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            disabled={isLast || isPending}
            onClick={() => startTransition(() => actions.moveBlock(pageId, block.id, "down"))}
            className="rounded border border-brown-dark/20 px-2 py-1 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm("¿Borrar este bloque?")) {
                startTransition(() => actions.deleteBlock(block.id, pageId));
              }
            }}
            className="rounded border border-red-200 text-red-600 px-2 py-1"
          >
            Borrar
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {(block.type === "hero" || block.type === "cta_banner") && (
          <>
            <div>
              <label className={labelCls}>Título</label>
              <input className={inputCls} value={content.titulo ?? ""} onChange={(e) => set("titulo", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Subtítulo</label>
              <textarea className={inputCls} rows={2} value={content.subtitulo ?? ""} onChange={(e) => set("subtitulo", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Texto del botón</label>
                <input
                  className={inputCls}
                  value={(block.type === "hero" ? content.cta_label : content.boton_label) ?? ""}
                  onChange={(e) => set(block.type === "hero" ? "cta_label" : "boton_label", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Link del botón</label>
                <input
                  className={inputCls}
                  value={(block.type === "hero" ? content.cta_href : content.boton_href) ?? ""}
                  onChange={(e) => set(block.type === "hero" ? "cta_href" : "boton_href", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {block.type === "heading" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Texto</label>
              <input className={inputCls} value={content.texto ?? ""} onChange={(e) => set("texto", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tamaño</label>
              <select
                className={inputCls}
                value={content.nivel ?? 2}
                onChange={(e) => set("nivel", Number(e.target.value) as 2 | 3)}
              >
                <option value={2}>Grande</option>
                <option value={3}>Mediano</option>
              </select>
            </div>
          </div>
        )}

        {block.type === "text" && (
          <div>
            <label className={labelCls}>Texto</label>
            <textarea className={inputCls} rows={4} value={content.texto ?? ""} onChange={(e) => set("texto", e.target.value)} />
          </div>
        )}

        {block.type === "image" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Imagen</label>
              <ImageUploader currentUrl={content.url} onUpload={(url) => set("url", url)} />
            </div>
            <div>
              <label className={labelCls}>Texto alternativo</label>
              <input className={inputCls} value={content.alt ?? ""} onChange={(e) => set("alt", e.target.value)} />
            </div>
          </div>
        )}

        {block.type === "spacer" && (
          <div>
            <label className={labelCls}>Alto (px)</label>
            <input
              type="number"
              className={inputCls}
              value={content.alto ?? 40}
              onChange={(e) => set("alto", Number(e.target.value))}
            />
          </div>
        )}

        {block.type === "product_grid" && (
          <div>
            <label className={labelCls}>Título de la sección</label>
            <input className={inputCls} value={content.titulo ?? ""} onChange={(e) => set("titulo", e.target.value)} />
            <label className={`${labelCls} mt-3`}>Productos</label>
            <ItemListEditor
              items={(content.items as ProductGridItem[]) ?? []}
              fields={[
                { key: "image_url", placeholder: "Imagen del producto", type: "image" },
                { key: "nombre", placeholder: "Nombre" },
                { key: "desc", placeholder: "Descripción" },
              ]}
              onChange={(items) => set("items", items as ProductGridItem[])}
            />
          </div>
        )}

        {block.type === "stats" && (
          <div>
            <label className={labelCls}>Estadísticas</label>
            <ItemListEditor
              items={(content.items as StatsItem[]) ?? []}
              fields={[
                { key: "value", placeholder: "Valor (ej. 100%)" },
                { key: "label", placeholder: "Etiqueta (ej. Madera tratada)" },
              ]}
              onChange={(items) => set("items", items as StatsItem[])}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        {savedAt && !isPending && <span className="text-xs text-brown-dark/40">Guardado ✓</span>}
      </div>
    </div>
  );
}

function ItemListEditor({
  items,
  fields,
  onChange,
}: {
  items: Record<string, string>[];
  fields: { key: string; placeholder: string; type?: "text" | "image" }[];
  onChange: (items: Record<string, string>[]) => void;
}) {
  function updateItem(index: number, key: string, value: string) {
    const next = items.map((it, i) => (i === index ? { ...it, [key]: value } : it));
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const empty = Object.fromEntries(fields.map((f) => [f.key, ""]));
    onChange([...items, empty]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start border border-brown-dark/10 p-3 rounded-md bg-brown-dark/5">
          <div className="flex-1 space-y-2">
            {fields.map((f) => (
              <div key={f.key}>
                {f.type === "image" ? (
                  <ImageUploader currentUrl={item[f.key]} onUpload={(url) => updateItem(i, f.key, url)} />
                ) : (
                  <input
                    placeholder={f.placeholder}
                    value={item[f.key] ?? ""}
                    onChange={(e) => updateItem(i, f.key, e.target.value)}
                    className="w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <button onClick={() => removeItem(i)} className="text-red-600 text-xs px-2 mt-2 font-semibold">
            ✕
          </button>
        </div>
      ))}
      <button onClick={addItem} className="text-xs text-forest font-semibold underline">
        + Agregar ítem
      </button>
    </div>
  );
}
