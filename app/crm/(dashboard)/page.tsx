import Link from "next/link";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type Lead, type LeadStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const ESTADOS: LeadStatus[] = ["nuevo", "contactado", "cotizado", "cerrado", "perdido"];

export default async function LeadsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; ciudad?: string }>;
}) {
  const { estado, ciudad } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*, profiles:assigned_to(full_name)")
    .order("created_at", { ascending: false });

  const estadoValido = ESTADOS.find((e) => e === estado);
  if (estadoValido) query = query.eq("estado", estadoValido);
  if (ciudad) query = query.ilike("ciudad", `%${ciudad}%`);

  const { data: leads, error } = await query;

  const { count: totalNuevos } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("estado", "nuevo");

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">Cotizaciones</h1>
          <p className="text-sm text-brown-dark/60 mt-1">
            {totalNuevos ?? 0} lead{(totalNuevos ?? 0) === 1 ? "" : "s"} nuevo(s) por atender.
          </p>
        </div>

        <form className="flex gap-2" method="GET">
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {LEAD_STATUS_LABELS[e]}
              </option>
            ))}
          </select>
          <input
            name="ciudad"
            defaultValue={ciudad ?? ""}
            placeholder="Ciudad..."
            className="rounded-md border border-brown-dark/20 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
            Filtrar
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          Error cargando leads: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-brown-dark/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brown-dark/5 text-left text-brown-dark/60">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {(leads as (Lead & { profiles: { full_name: string } | null })[] | null)?.map((lead) => (
              <tr key={lead.id} className="border-t border-brown-dark/5 hover:bg-cream/60">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/crm/leads/${lead.id}`} className="font-medium text-forest hover:underline">
                    {lead.nombre}
                  </Link>
                  <div className="text-xs text-brown-dark/50">{lead.telefono}</div>
                </td>
                <td className="px-4 py-3">{lead.ciudad}</td>
                <td className="px-4 py-3">{lead.producto}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${LEAD_STATUS_COLORS[lead.estado]}`}
                  >
                    {LEAD_STATUS_LABELS[lead.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-brown-dark/70">
                  {lead.profiles?.full_name ?? "Sin asignar"}
                </td>
              </tr>
            ))}

            {leads && leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-brown-dark/40">
                  <Inbox className="w-8 h-8 mx-auto mb-2" aria-hidden="true" />
                  No hay leads con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}