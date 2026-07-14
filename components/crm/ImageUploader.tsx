"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImageUploader({
  currentUrl,
  onUpload,
}: {
  currentUrl?: string;
  onUpload: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      // 1. Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(data.path);

      onUpload(publicUrl);
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {currentUrl && (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Preview"
            className="w-full max-w-[200px] rounded-md border border-brown-dark/20 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <label
          className={`cursor-pointer rounded-md border border-dashed border-brown-dark/30 px-4 py-2 text-sm text-brown-dark/70 transition-colors hover:bg-brown-dark/5 ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {isUploading ? "Subiendo..." : "Seleccionar imagen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {currentUrl && (
          <button
            type="button"
            onClick={() => onUpload("")}
            className="text-xs text-red-600 hover:underline"
            disabled={isUploading}
          >
            Quitar
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
