"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AlertCircle, CheckCircle2, Loader2, Monitor, Plus, Smartphone, Tablet } from "lucide-react";
import type { BlockContent, BlockType, Page, PageBlock, PageStatus } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageStatusToggle from "@/components/crm/PageStatusToggle";
import SortableBlockCard from "./SortableBlockCard";
import EditablePreview from "./EditablePreview";
import BlockTypePicker from "./BlockTypePicker";
import MediaLibraryModal from "./MediaLibraryModal";

type SaveState = "idle" | "saving" | "saved" | "error";
type DeviceWidth = "desktop" | "tablet" | "mobile";

const DEVICE_CLASSES: Record<DeviceWidth, string> = {
  desktop: "max-w-full",
  tablet: "max-w-[768px] mx-auto",
  mobile: "max-w-[390px] mx-auto",
};

export default function PageBuilder({
  page,
  initialBlocks,
  actions,
}: {
  page: Page;
  initialBlocks: PageBlock[];
  actions: {
    createBlock: (pageId: string, type: BlockType) => Promise<PageBlock>;
    updateBlockContent: (blockId: string, pageId: string, content: BlockContent) => Promise<void>;
    deleteBlock: (blockId: string, pageId: string) => Promise<void>;
    reorderBlocks: (pageId: string, orderedBlockIds: string[]) => Promise<void>;
    setPageStatus: (pageId: string, status: PageStatus) => Promise<void>;
  };
}) {
  const toast = useToast();
  const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialBlocks[0]?.id ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>("desktop");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [blockPendingDelete, setBlockPendingDelete] = useState<string | null>(null);
  const [mediaPicker, setMediaPicker] = useState<((url: string) => void) | null>(null);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(clearTimeout);
    };
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleFieldChange<K extends keyof BlockContent>(blockId: string, key: K, value: BlockContent[K]) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, [key]: value } } : b)));
    setSaveState("saving");

    clearTimeout(saveTimers.current[blockId]);
    saveTimers.current[blockId] = setTimeout(async () => {
      const latest = blocksRef.current.find((b) => b.id === blockId);
      if (!latest) return;
      try {
        await actions.updateBlockContent(blockId, page.id, latest.content);
        setSaveState("saved");
      } catch {
        setSaveState("error");
        toast.show("No se pudo guardar el cambio. Revisa tu conexión.", "error");
      }
    }, 800);
  }

  async function handleAddBlock(type: BlockType) {
    try {
      const newBlock = await actions.createBlock(page.id, type);
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      toast.show("Bloque agregado.");
    } catch {
      toast.show("No se pudo agregar el bloque.", "error");
    }
  }

  async function handleConfirmDelete() {
    const blockId = blockPendingDelete;
    if (!blockId) return;
    setBlockPendingDelete(null);

    const previous = blocksRef.current;
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) setSelectedBlockId(null);

    try {
      await actions.deleteBlock(blockId, page.id);
      toast.show("Bloque borrado.");
    } catch {
      setBlocks(previous);
      toast.show("No se pudo borrar el bloque.", "error");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = blocks;
    const reordered = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(reordered);

    try {
      await actions.reorderBlocks(page.id, reordered.map((b) => b.id));
    } catch {
      setBlocks(previous);
      toast.show("No se pudo reordenar. Intenta de nuevo.", "error");
    }
  }

  function selectAndScroll(blockId: string) {
    setSelectedBlockId(blockId);
    document.getElementById(`block-card-${blockId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function openMediaPicker(onSelect: (url: string) => void) {
    setMediaPicker(() => onSelect);
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">{page.title}</h1>
          <p className="text-sm text-brown-dark/50">/{page.slug}</p>
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} />
          <PageStatusToggle pageId={page.id} status={page.status} action={actions.setPageStatus} />
        </div>
      </div>

      {page.slug === "home" && (
        <p className="mb-4 text-xs text-brown-dark/50 bg-amber-light/10 border border-amber/30 rounded-md px-3 py-2">
          Esta es la página de inicio pública (rhgmaderas.com). Los cambios se guardan automáticamente
          y se reflejan en el sitio si la página está &quot;Publicada&quot;.
        </p>
      )}

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Panel izquierdo: lista de bloques */}
        <div className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <div key={block.id} id={`block-card-${block.id}`}>
                  <SortableBlockCard
                    block={block}
                    selected={selectedBlockId === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onChange={(key, value) => handleFieldChange(block.id, key, value)}
                    onDelete={() => setBlockPendingDelete(block.id)}
                    onPickImage={openMediaPicker}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <p className="text-sm text-brown-dark/40 text-center py-8 rounded-xl border border-dashed border-brown-dark/20">
              Esta página no tiene bloques todavía.
            </p>
          )}

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brown-dark/20 py-4 text-sm font-semibold text-brown-dark/60 hover:border-forest/40 hover:text-forest hover:bg-forest/5 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Agregar bloque
          </button>
        </div>

        {/* Panel derecho: vista previa en vivo */}
        <div className="lg:sticky lg:top-4">
          <div className="flex items-center justify-center gap-1 mb-3">
            <DeviceButton icon={Monitor} label="Escritorio" active={deviceWidth === "desktop"} onClick={() => setDeviceWidth("desktop")} />
            <DeviceButton icon={Tablet} label="Tablet" active={deviceWidth === "tablet"} onClick={() => setDeviceWidth("tablet")} />
            <DeviceButton icon={Smartphone} label="Móvil" active={deviceWidth === "mobile"} onClick={() => setDeviceWidth("mobile")} />
          </div>
          <div className="rounded-xl border border-brown-dark/10 bg-white shadow-sm overflow-hidden max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className={`${DEVICE_CLASSES[deviceWidth]} transition-all duration-300`}>
              <EditablePreview
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={selectAndScroll}
                onFieldChange={handleFieldChange}
                onPickImage={(blockId, onSelect) => openMediaPicker(onSelect)}
              />
            </div>
          </div>
        </div>
      </div>

      <BlockTypePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handleAddBlock} />

      <MediaLibraryModal
        open={mediaPicker !== null}
        onClose={() => setMediaPicker(null)}
        onSelect={(url) => {
          mediaPicker?.(url);
          setMediaPicker(null);
        }}
      />

      <ConfirmDialog
        open={blockPendingDelete !== null}
        title="¿Borrar este bloque?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setBlockPendingDelete(null)}
      />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-brown-dark/50">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Guardando…
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-600">
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Error al guardar
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-forest">
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
      Guardado
    </span>
  );
}

function DeviceButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Monitor;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        active ? "bg-forest text-white" : "text-brown-dark/40 hover:bg-brown-dark/5"
      }`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
