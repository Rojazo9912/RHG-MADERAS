import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inviteTeamMember, updateTeamMember } from "./actions";
import InviteTeamMemberForm from "@/components/InviteTeamMemberForm";
import TeamMemberRow from "@/components/TeamMemberRow";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") {
    return (
      <div className="rounded-lg border border-brown-dark/10 bg-white p-6 text-center text-brown-dark/60">
        Esta sección es solo para administradores.
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-dark">Equipo</h1>
      <p className="text-sm text-brown-dark/60 mt-1">
        Invita vendedores y admins, y controla qué ubicación / leads puede ver cada quien.
      </p>

      <div className="mt-6 rounded-lg border border-brown-dark/10 bg-white p-6">
        <h2 className="font-semibold text-brown-dark mb-4">Invitar nuevo miembro</h2>
        <InviteTeamMemberForm action={inviteTeamMember} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-brown-dark/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brown-dark/5 text-left text-brown-dark/60">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <TeamMemberRow key={p.id} profile={p} action={updateTeamMember} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
