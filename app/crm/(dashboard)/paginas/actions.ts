"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPage(input: { title: string; slug?: string }) {
  const supabase = await requireAdmin();
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: page, error } = await supabase
    .from("pages")
    .insert({ title: input.title, slug, status: "borrador", created_by: user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/crm/paginas");
  redirect(`/crm/paginas/${page.id}`);
}

export async function setPageStatus(pageId: string, status: "borrador" | "publicada") {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("pages").update({ status }).eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath("/crm/paginas");
  revalidatePath(`/crm/paginas/${pageId}`);
  revalidatePath("/");
}

export async function deletePage(pageId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath("/crm/paginas");
}
