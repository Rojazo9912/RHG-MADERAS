import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPage, setPageStatus } from "./actions";
import NewPageForm from "@/components/crm/NewPageForm";
import PageStatusToggle from "@/components/crm/PageStatusToggle";
import type { Page } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PaginasListPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (myProfile?.role !== "admin") {
    return (
      <div className="rounded-lg border border-brown-dark/10 bg-white p-6 text-center text-brown-dark/60">
        Esta sección es solo para administradores.
      </div>
    );
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Page[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-dark">Páginas</h1>
      <p className="text-sm text-brown-dark/60 mt-1">
        Edita el contenido del sitio (textos, imágenes, secciones) sin tocar código. La
        página con slug <code className="bg-brown-dark/10 px-1 rounded">home</code> es la
        página de inicio pública.
      </p>

      <div className="mt-6 rounded-lg border border-brown-dark/10 bg-white p-6">
        <NewPageForm action={createPage} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-brown-dark/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brown-dark/5 text-left text-brown-dark/60">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizada</th>
            </tr>
          </thead>
          <tbody>
            {pages?.map((p) => (
              <tr key={p.id} className="border-t border-brown-dark/5 hover:bg-cream/60">
                <td className="px-4 py-3">
                  <Link href={`/crm/paginas/${p.id}`} className="font-medium text-forest hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brown-dark/60">/{p.slug}</td>
                <td className="px-4 py-3">
                  <PageStatusToggle pageId={p.id} status={p.status} action={setPageStatus} />
                </td>
                <td className="px-4 py-3 text-brown-dark/50">
                  {new Date(p.updated_at).toLocaleString("es-MX")}
                </td>
              </tr>
            ))}
            {pages && pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-brown-dark/50">
                  Aún no hay páginas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
