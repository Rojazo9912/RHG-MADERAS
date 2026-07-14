"use client";

import { useEffect } from "react";
import {
  AlignLeft,
  BarChart3,
  Heading,
  Image as ImageIcon,
  LayoutPanelTop,
  LayoutTemplate,
  MoveVertical,
  Megaphone,
  X,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "@/types/database";

const BLOCK_TYPES: { type: BlockType; label: string; desc: string; icon: LucideIcon }[] = [
  { type: "hero", label: "Hero (portada)", desc: "Título grande de bienvenida con botón de llamada a la acción.", icon: LayoutTemplate },
  { type: "heading", label: "Título de sección", desc: "Encabezado para dividir el contenido en secciones.", icon: Heading },
  { type: "text", label: "Texto", desc: "Párrafo de texto libre.", icon: AlignLeft },
  { type: "image", label: "Imagen", desc: "Una imagen a todo lo ancho.", icon: ImageIcon },
  { type: "product_grid", label: "Cuadrícula de productos", desc: "Tarjetas de productos con imagen, nombre y descripción.", icon: LayoutPanelTop },
  { type: "stats", label: "Estadísticas", desc: "Números destacados (ej. años de experiencia).", icon: BarChart3 },
  { type: "cta_banner", label: "Banner con botón", desc: "Bloque destacado para invitar a la acción.", icon: Megaphone },
  { type: "spacer", label: "Espaciador", desc: "Espacio en blanco entre bloques.", icon: MoveVertical },
];

export default function BlockTypePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brown-dark/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agregar bloque"
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-brown-dark/10 px-5 py-4">
          <h2 className="font-semibold text-brown-dark">Agregar bloque</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-brown-dark/40 hover:text-brown-dark transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 grid sm:grid-cols-2 gap-3">
          {BLOCK_TYPES.map(({ type, label, desc, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onPick(type);
                onClose();
              }}
              className="flex items-start gap-3 text-left rounded-xl border border-brown-dark/10 p-4 hover:border-forest/40 hover:bg-forest/5 transition-colors"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-forest" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-brown-dark">{label}</span>
                <span className="block text-xs text-brown-dark/50 mt-0.5">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
