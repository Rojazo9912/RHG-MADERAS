"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/database";

export async function updateLeadStatus(leadId: string, estado: LeadStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ estado }).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm");
}

export async function assignLead(leadId: string, assignedTo: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ assigned_to: assignedTo })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm");
}

export async function addLeadNote(leadId: string, note: string) {
  if (!note.trim()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { error } = await supabase
    .from("lead_notes")
    .insert({ lead_id: leadId, author_id: user.id, note: note.trim() });
  if (error) throw new Error(error.message);
  revalidatePath(`/crm/leads/${leadId}`);
}
