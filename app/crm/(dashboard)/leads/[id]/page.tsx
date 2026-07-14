import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus, assignLead, addLeadNote } from "./actions";
import LeadStatusSelect from "@/components/LeadStatusSelect";
import LeadAssignSelect from "@/components/LeadAssignSelect";
import LeadNoteForm from "@/components/LeadNoteForm";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import type { Lead, LeadNote, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single<Lead>();
  if (!lead) notFound();

  const { data: vendedores } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");

  const { data: notes } = await supabase
    .from("lead_notes")
    .select("*, profiles:author_id(full_name)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <Link href="/crm" className="text-sm text-forest hover:underline">
        ← Volver a leads
      </Link>

      <div className="mt-4 rounded-lg border border-brown-dark/10 bg-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brown-dark">{lead.nombre}</h1>
            <p className="text-sm text-brown-dark/60 mt-1">
              Recibido el {new Date(lead.created_at).toLocaleString("es-MX")}
            </p>
          </div>
          <div className="flex gap-2">
            <LeadStatusSelect leadId={lead.id} current={lead.estado} action={updateLeadStatus} />
            <LeadAssignSelect
              leadId={lead.id}
              current={lead.assigned_to}
              vendedores={(vendedores ?? []) as Pick<Profile, "id" | "full_name">[]}
              action={assignLead}
            />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-brown-dark/50">Teléfono</dt>
            <dd className="font-medium">{lead.telefono || "—"}</dd>
          </div>
          <div>
            <dt className="text-brown-dark/50">Correo</dt>
            <dd className="font-medium">{lead.correo || "—"}</dd>
          </div>
          <div>
            <dt className="text-brown-dark/50">Ciudad</dt>
            <dd className="font-medium">{lead.ciudad || "—"}</dd>
          </div>
          <div>
            <dt className="text-brown-dark/50">Producto</dt>
            <dd className="font-medium">{lead.producto || "—"}</dd>
          </div>
          <div>
            <dt className="text-brown-dark/50">Fuente</dt>
            <dd className="font-medium">{lead.fuente}</dd>
          </div>
        </dl>

        {lead.mensaje && (
          <div className="mt-4 rounded-md bg-cream p-4 text-sm">
            <p className="text-brown-dark/50 mb-1">Mensaje</p>
            <p>{lead.mensaje}</p>
          </div>
        )}

        {lead.telefono && (
          <a
            href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bc59] transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Responder por WhatsApp
          </a>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-brown-dark/10 bg-white p-6">
        <h2 className="font-semibold text-brown-dark mb-4">Historial de interacciones</h2>
        <LeadNoteForm leadId={lead.id} action={addLeadNote} />

        <ul className="mt-6 space-y-4">
          {(notes as (LeadNote & { profiles: { full_name: string } | null })[] | null)?.map(
            (note) => (
              <li key={note.id} className="border-t border-brown-dark/10 pt-4 text-sm">
                <p>{note.note}</p>
                <p className="text-xs text-brown-dark/40 mt-1">
                  {note.profiles?.full_name ?? "Equipo"} ·{" "}
                  {new Date(note.created_at).toLocaleString("es-MX")}
                </p>
              </li>
            )
          )}
          {notes && notes.length === 0 && (
            <p className="text-sm text-brown-dark/40">Aún no hay notas para este lead.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
