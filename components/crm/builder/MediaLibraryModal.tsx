"use client";

import { useEffect, useState } from "react";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MediaFile = { name: string; url: string };

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab("library");
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function loadFiles() {
    setLoadError(null);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("media")
      .list("uploads", { limit: 60, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      setLoadError(error.message);
      return;
    }

    const items = (data ?? [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from("media").getPublicUrl(`uploads/${f.name}`).data.publicUrl,
      }));
    setFiles(items);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    const supabase = createClient();

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadErr, data } = await supabase.storage.from("media").upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(data.path);

      onSelect(publicUrl);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brown-dark/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Biblioteca de medios"
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-brown-dark/10 px-5 py-4">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "library" ? "bg-forest/10 text-forest" : "text-brown-dark/60 hover:bg-brown-dark/5"
              }`}
            >
              Biblioteca
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "upload" ? "bg-forest/10 text-forest" : "text-brown-dark/60 hover:bg-brown-dark/5"
              }`}
            >
              Subir nueva
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-brown-dark/40 hover:text-brown-dark transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "library" ? (
            <>
              {loadError && <p className="text-sm text-red-600">Error cargando biblioteca: {loadError}</p>}
              {files === null && !loadError && (
                <div className="flex items-center justify-center py-16 text-brown-dark/40">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                </div>
              )}
              {files && files.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-brown-dark/40 gap-2">
                  <ImageOff className="w-8 h-8" aria-hidden="true" />
                  <p className="text-sm">Aún no hay imágenes subidas.</p>
                </div>
              )}
              {files && files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {files.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        onSelect(f.url);
                        onClose();
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-brown-dark/10 hover:ring-2 hover:ring-amber transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <label
                className={`cursor-pointer flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-brown-dark/30 px-10 py-10 text-sm text-brown-dark/70 transition-colors hover:bg-brown-dark/5 ${
                  isUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="w-6 h-6" aria-hidden="true" />
                )}
                {isUploading ? "Subiendo..." : "Seleccionar imagen del equipo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
