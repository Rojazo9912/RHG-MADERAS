"use client";

import { useRef } from "react";
import { ArrowRight, ImagePlus, TreePine } from "lucide-react";
import type { BlockContent, PageBlock, ProductGridItem, StatsItem } from "@/types/database";

type FieldChange = <K extends keyof BlockContent>(blockId: string, key: K, value: BlockContent[K]) => void;

export default function EditablePreview({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onFieldChange,
  onPickImage,
}: {
  blocks: PageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onFieldChange: FieldChange;
  onPickImage: (blockId: string, onSelect: (url: string) => void) => void;
}) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-brown-dark/30 text-sm">
        Agrega un bloque para ver la vista previa aquí.
      </div>
    );
  }

  return (
    <div>
      {blocks.map((block) => (
        <div
          key={block.id}
          onClick={() => onSelectBlock(block.id)}
          className={`relative cursor-pointer transition-shadow ${
            selectedBlockId === block.id ? "ring-2 ring-inset ring-amber" : "hover:ring-2 hover:ring-inset hover:ring-amber/30"
          }`}
        >
          <BlockPreview
            block={block}
            onFieldChange={onFieldChange}
            onPickImage={(cb) => onPickImage(block.id, cb)}
          />
        </div>
      ))}
    </div>
  );
}

function BlockPreview({
  block,
  onFieldChange,
  onPickImage,
}: {
  block: PageBlock;
  onFieldChange: FieldChange;
  onPickImage: (onSelect: (url: string) => void) => void;
}) {
  const c = block.content;
  const set = <K extends keyof BlockContent>(key: K, value: BlockContent[K]) => onFieldChange(block.id, key, value);

  switch (block.type) {
    case "hero":
      return (
        <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-brown-dark">
          <div className="absolute inset-0 bg-gradient-to-br from-brown-dark via-brown to-forest-dark opacity-95" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <AutoTextarea
                value={c.titulo ?? ""}
                onChange={(v) => set("titulo", v)}
                placeholder="Título"
                className="w-full bg-transparent text-5xl font-bold leading-[1.05] text-white placeholder-white/30 resize-none border-0 focus:outline-none focus:ring-0"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              />
              <AutoTextarea
                value={c.subtitulo ?? ""}
                onChange={(v) => set("subtitulo", v)}
                placeholder="Subtítulo"
                className="mt-4 w-full bg-transparent text-lg text-cream/70 placeholder-cream/30 resize-none border-0 focus:outline-none focus:ring-0"
              />
              <div className="mt-8">
                <span className="btn-primary px-6 py-3 text-base inline-flex pointer-events-none">
                  <input
                    value={c.cta_label ?? ""}
                    onChange={(e) => set("cta_label", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Texto botón"
                    className="pointer-events-auto bg-transparent text-white placeholder-white/50 border-0 focus:outline-none focus:ring-0 w-32"
                  />
                  <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" aria-hidden="true" />
                </span>
              </div>
            </div>
            <div />
          </div>
        </section>
      );

    case "heading": {
      const size = c.nivel === 3 ? "text-2xl" : "text-3xl";
      return (
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-2">
          <input
            value={c.texto ?? ""}
            onChange={(e) => set("texto", e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Título de sección"
            className={`w-full text-center font-bold text-brown-dark bg-transparent border-0 focus:outline-none focus:ring-0 ${size}`}
          />
        </div>
      );
    }

    case "text":
      return (
        <div className="mx-auto max-w-3xl px-4 py-8">
          <AutoTextarea
            value={c.texto ?? ""}
            onChange={(v) => set("texto", v)}
            placeholder="Escribe el texto de esta sección…"
            className="w-full text-center text-brown-dark/80 leading-relaxed bg-transparent resize-none border-0 focus:outline-none focus:ring-0"
          />
        </div>
      );

    case "image":
      return (
        <div className="mx-auto max-w-4xl px-4 py-8">
          {c.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.url} alt={c.alt || ""} className="w-full h-auto rounded-lg" />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPickImage((url) => set("url", url));
              }}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-brown-dark/20 flex flex-col items-center justify-center gap-2 text-brown-dark/40 hover:bg-brown-dark/5 transition-colors"
            >
              <ImagePlus className="w-6 h-6" aria-hidden="true" />
              <span className="text-sm">Seleccionar imagen</span>
            </button>
          )}
        </div>
      );

    case "product_grid":
      return (
        <section className="bg-cream py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <span className="section-badge">
                <TreePine className="w-4 h-4" aria-hidden="true" />
                Nuestro catálogo
              </span>
              <input
                value={c.titulo ?? ""}
                onChange={(e) => set("titulo", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Título de la sección"
                className="block mx-auto mt-3 text-center text-3xl font-bold text-brown-dark bg-transparent border-0 focus:outline-none focus:ring-0 w-full max-w-md"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {((c.items as ProductGridItem[]) || []).map((item, i) => (
                <div key={i} className="rounded-xl border border-brown-dark/8 bg-white p-5 shadow-sm">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="mb-3 -mx-5 -mt-5 aspect-[4/3] w-[calc(100%+2.5rem)] object-cover rounded-t-xl" />
                  ) : (
                    <TreePine className="w-8 h-8 mb-3 text-forest" aria-hidden="true" />
                  )}
                  <input
                    value={item.nombre ?? ""}
                    onChange={(e) => {
                      const items = [...((c.items as ProductGridItem[]) || [])];
                      items[i] = { ...items[i], nombre: e.target.value };
                      set("items", items);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Nombre"
                    className="w-full font-semibold text-brown-dark bg-transparent border-0 focus:outline-none focus:ring-0"
                  />
                  <textarea
                    value={item.desc ?? ""}
                    onChange={(e) => {
                      const items = [...((c.items as ProductGridItem[]) || [])];
                      items[i] = { ...items[i], desc: e.target.value };
                      set("items", items);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Descripción"
                    rows={2}
                    className="mt-1 w-full text-sm text-brown-mid/70 bg-transparent resize-none border-0 focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-brown-dark py-12">
          <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {((c.items as StatsItem[]) || []).map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <input
                  value={item.value ?? ""}
                  onChange={(e) => {
                    const items = [...((c.items as StatsItem[]) || [])];
                    items[i] = { ...items[i], value: e.target.value };
                    set("items", items);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Valor"
                  className="w-full text-center text-3xl font-bold text-amber-light bg-transparent border-0 focus:outline-none focus:ring-0"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                />
                <input
                  value={item.label ?? ""}
                  onChange={(e) => {
                    const items = [...((c.items as StatsItem[]) || [])];
                    items[i] = { ...items[i], label: e.target.value };
                    set("items", items);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Etiqueta"
                  className="mt-1 w-full text-center text-sm text-cream/70 bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
            ))}
          </div>
        </section>
      );

    case "cta_banner":
      return (
        <section className="mx-auto max-w-4xl px-4 py-10 text-center">
          <div className="rounded-xl bg-forest text-white px-8 py-10">
            <input
              value={c.titulo ?? ""}
              onChange={(e) => set("titulo", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Título del banner"
              className="w-full text-center text-2xl font-bold bg-transparent placeholder-white/50 border-0 focus:outline-none focus:ring-0"
            />
            <input
              value={c.subtitulo ?? ""}
              onChange={(e) => set("subtitulo", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Subtítulo"
              className="mt-2 w-full text-center text-white/80 bg-transparent placeholder-white/40 border-0 focus:outline-none focus:ring-0"
            />
            <div className="mt-6 inline-block rounded-md bg-amber px-6 py-3">
              <input
                value={c.boton_label ?? ""}
                onChange={(e) => set("boton_label", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Texto botón"
                className="text-center font-semibold text-brown-dark bg-transparent border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </section>
      );

    case "spacer":
      return (
        <div style={{ height: `${c.alto ?? 40}px` }} className="flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-brown-dark/20">Espaciador · {c.alto ?? 40}px</span>
        </div>
      );

    default:
      return null;
  }
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        onChange(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }}
      rows={1}
      className={className}
      style={style}
    />
  );
}
