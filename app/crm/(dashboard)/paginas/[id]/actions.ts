"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BlockContent, BlockType } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Solo un admin puede editar el contenido del sitio.");
  return supabase;
}

const DEFAULT_CONTENT: Record<BlockType, BlockContent> = {
  hero: { titulo: "Nuevo título", subtitulo: "", cta_label: "", cta_href: "#cotizar" },
  heading: { texto: "Nuevo encabezado", nivel: 2 },
  text: { texto: "Escribe aquí el texto de esta sección." },
  image: { url: "", alt: "" },
  product_grid: { titulo: "Productos", items: [] },
  stats: { items: [] },
  cta_banner: { titulo: "", subtitulo: "", boton_label: "", boton_href: "" },
  spacer: { alto: 40 },
};

export async function createBlock(pageId: string, type: BlockType) {
  const supabase = await requireAdmin();

  const { data: existing } = await supabase
    .from("page_blocks")
    .select("position")
    .eq("page_id", pageId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existing?.[0]?.position ?? 0) + 1;

  const { error } = await supabase.from("page_blocks").insert({
    page_id: pageId,
    type,
    position: nextPosition,
    content: DEFAULT_CONTENT[type],
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/crm/paginas/${pageId}`);
}

export async function updateBlockContent(blockId: string, pageId: string, content: BlockContent) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("page_blocks").update({ content }).eq("id", blockId);
  if (error) throw new Error(error.message);
  revalidatePath(`/crm/paginas/${pageId}`);
  revalidatePath("/");
}

export async function deleteBlock(blockId: string, pageId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("page_blocks").delete().eq("id", blockId);
  if (error) throw new Error(error.message);
  revalidatePath(`/crm/paginas/${pageId}`);
  revalidatePath("/");
}

export async function moveBlock(pageId: string, blockId: string, direction: "up" | "down") {
  const supabase = await requireAdmin();

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("id, position")
    .eq("page_id", pageId)
    .order("position", { ascending: true });

  if (!blocks) return;

  const index = blocks.findIndex((b) => b.id === blockId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= blocks.length) return;

  const a = blocks[index];
  const b = blocks[swapIndex];

  await Promise.all([
    supabase.from("page_blocks").update({ position: b.position }).eq("id", a.id),
    supabase.from("page_blocks").update({ position: a.position }).eq("id", b.id),
  ]);

  revalidatePath(`/crm/paginas/${pageId}`);
  revalidatePath("/");
}
