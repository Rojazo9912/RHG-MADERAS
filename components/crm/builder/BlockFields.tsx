"use client";

import { ImagePlus, X } from "lucide-react";
import type { BlockContent, ProductGridItem, StatsItem } from "@/types/database";
import type { PageBlock } from "@/types/database";

const inputCls =
  "w-full rounded-lg border border-brown-dark/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber";
const labelCls = "block text-xs font-medium mb-1 text-brown-dark/60";

export default function BlockFields({
  block,
  content,
  onChange,
  onPickImage,
}: {
  block: PageBlock;
  content: BlockContent;
  onChange: <K extends keyof BlockContent>(key: K, value: BlockContent[K]) => void;
  onPickImage: (onSelect: (url: string) => void) => void;
}) {
  return (
    <div className="space-y-3">
      {(block.type === "hero" || block.type === "cta_banner") && (
        <>
          <div>
            <label className={labelCls}>Título</label>
            <input className={inputCls} value={content.titulo ?? ""} onChange={(e) => onChange("titulo", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Subtítulo</label>
            <textarea className={inputCls} rows={2} value={content.subtitulo ?? ""} onChange={(e) => onChange("subtitulo", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Texto del botón</label>
              <input
                className={inputCls}
                value={(block.type === "hero" ? content.cta_label : content.boton_label) ?? ""}
                onChange={(e) => onChange(block.type === "hero" ? "cta_label" : "boton_label", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Link del botón</label>
              <input
                className={inputCls}
                value={(block.type === "hero" ? content.cta_href : content.boton_href) ?? ""}
                onChange={(e) => onChange(block.type === "hero" ? "cta_href" : "boton_href", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {block.type === "heading" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Texto</label>
            <input className={inputCls} value={content.texto ?? ""} onChange={(e) => onChange("texto", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Tamaño</label>
            <select
              className={inputCls}
              value={content.nivel ?? 2}
              onChange={(e) => onChange("nivel", Number(e.target.value) as 2 | 3)}
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
          <textarea className={inputCls} rows={4} value={content.texto ?? ""} onChange={(e) => onChange("texto", e.target.value)} />
        </div>
      )}

      {block.type === "image" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Imagen</label>
            <ImagePickerField url={content.url} onPick={() => onPickImage((url) => onChange("url", url))} onClear={() => onChange("url", "")} />
          </div>
          <div>
            <label className={labelCls}>Texto alternativo</label>
            <input className={inputCls} value={content.alt ?? ""} onChange={(e) => onChange("alt", e.target.value)} />
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
            onChange={(e) => onChange("alto", Number(e.target.value))}
          />
        </div>
      )}

      {block.type === "product_grid" && (
        <div>
          <label className={labelCls}>Título de la sección</label>
          <input className={inputCls} value={content.titulo ?? ""} onChange={(e) => onChange("titulo", e.target.value)} />
          <label className={`${labelCls} mt-3`}>Productos</label>
          <ItemListEditor
            items={(content.items as ProductGridItem[]) ?? []}
            fields={[
              { key: "image_url", placeholder: "Imagen del producto", type: "image" },
              { key: "nombre", placeholder: "Nombre" },
              { key: "desc", placeholder: "Descripción" },
            ]}
            onChange={(items) => onChange("items", items as ProductGridItem[])}
            onPickImage={onPickImage}
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
            onChange={(items) => onChange("items", items as StatsItem[])}
            onPickImage={onPickImage}
          />
        </div>
      )}
    </div>
  );
}

function ImagePickerField({
  url,
  onPick,
  onClear,
}: {
  url?: string;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative w-full max-w-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full rounded-md border border-brown-dark/20 object-cover aspect-video" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Quitar imagen"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-brown-dark/20 flex items-center justify-center text-brown-dark/60 hover:text-red-600 shadow-sm"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onPick}
        className="inline-flex items-center gap-2 rounded-md border border-dashed border-brown-dark/30 px-4 py-2 text-sm text-brown-dark/70 hover:bg-brown-dark/5 transition-colors"
      >
        <ImagePlus className="w-4 h-4" aria-hidden="true" />
        {url ? "Cambiar imagen" : "Seleccionar imagen"}
      </button>
    </div>
  );
}

function ItemListEditor({
  items,
  fields,
  onChange,
  onPickImage,
}: {
  items: Record<string, string>[];
  fields: { key: string; placeholder: string; type?: "text" | "image" }[];
  onChange: (items: Record<string, string>[]) => void;
  onPickImage: (onSelect: (url: string) => void) => void;
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
                  <ImagePickerField
                    url={item[f.key]}
                    onPick={() => onPickImage((url) => updateItem(i, f.key, url))}
                    onClear={() => updateItem(i, f.key, "")}
                  />
                ) : (
                  <input
                    placeholder={f.placeholder}
                    value={item[f.key] ?? ""}
                    onChange={(e) => updateItem(i, f.key, e.target.value)}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            aria-label="Quitar ítem"
            className="text-red-600 text-xs px-2 mt-2 font-semibold"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-forest font-semibold underline">
        + Agregar ítem
      </button>
    </div>
  );
}
