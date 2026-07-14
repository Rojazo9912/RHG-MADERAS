import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createBlock, updateBlockContent, deleteBlock, moveBlock } from "./actions";
import { setPageStatus } from "../actions";
import AddBlockForm from "@/components/crm/AddBlockForm";
import BlockEditorCard from "@/components/crm/BlockEditorCard";
import PageStatusToggle from "@/components/crm/PageStatusToggle";
import type { Page, PageBlock } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase.from("pages").select("*").eq("id", id).single<Page>();
  if (!page) notFound();

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", id)
    .order("position", { ascending: true })
    .returns<PageBlock[]>();

  return (
    <div className="max-w-3xl">
      <Link href="/crm/paginas" className="text-sm text-forest hover:underline">
        ← Volver a páginas
      </Link>

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">{page.title}</h1>
          <p className="text-sm text-brown-dark/50">/{page.slug}</p>
        </div>
        <PageStatusToggle pageId={page.id} status={page.status} action={setPageStatus} />
      </div>

      {page.slug === "home" && (
        <p className="mt-3 text-xs text-brown-dark/50 bg-amber-light/10 border border-amber/30 rounded-md px-3 py-2">
          Esta es la página de inicio pública (rhgmaderas.com). Los cambios aquí se reflejan
          en el sitio en cuanto guardas cada bloque (si la página está "Publicada").
        </p>
      )}

      <div className="mt-6 space-y-4">
        {blocks?.map((block, i) => (
          <BlockEditorCard
            key={block.id}
            pageId={page.id}
            block={block}
            isFirst={i === 0}
            isLast={i === (blocks?.length ?? 1) - 1}
            actions={{ updateBlockContent, deleteBlock, moveBlock }}
          />
        ))}
        {blocks && blocks.length === 0 && (
          <p className="text-sm text-brown-dark/40 text-center py-8">
            Esta página no tiene bloques todavía. Agrega el primero abajo.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-brown-dark/20 bg-white p-5">
        <AddBlockForm pageId={page.id} action={createBlock} />
      </div>
    </div>
  );
}
