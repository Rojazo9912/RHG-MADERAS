"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { UserLocation, UserRole } from "@/types/database";

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

  if (profile?.role !== "admin") throw new Error("Solo un admin puede gestionar el equipo.");
  return supabase;
}

export async function inviteTeamMember(input: {
  email: string;
  fullName: string;
  role: UserRole;
  location: UserLocation;
}) {
  await requireAdmin();

  // inviteUserByEmail requiere la service role key: crea el usuario en
  // Supabase Auth y le manda un correo para poner su contraseña. El trigger
  // handle_new_user() crea el profile automáticamente con estos metadatos.
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: {
      full_name: input.fullName,
      role: input.role,
      location: input.location,
    },
  });

  if (error) throw new Error(error.message);
  revalidatePath("/crm/team");
}

export async function updateTeamMember(
  profileId: string,
  updates: { role?: UserRole; location?: UserLocation; active?: boolean }
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("profiles").update(updates).eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/crm/team");
}
