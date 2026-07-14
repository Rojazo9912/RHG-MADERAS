import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createBlock, updateBlockContent, deleteBlock, reorderBlocks } from "./actions";
import { setPageStatus } from "../actions";
import PageBuilder from "@/components/crm/builder/PageBuilder";
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
    <div>
      <Link href="/crm/paginas" className="text-sm text-forest hover:underline">
        ← Volver a páginas
      </Link>

      <div className="mt-4">
        <PageBuilder
          page={page}
          initialBlocks={blocks ?? []}
          actions={{ createBlock, updateBlockContent, deleteBlock, reorderBlocks, setPageStatus }}
        />
      </div>
    </div>
  );
}
