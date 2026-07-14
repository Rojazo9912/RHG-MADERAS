import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import type { Profile } from "@/types/database";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya redirige si no hay sesión; esto es una segunda capa
  // de defensa por si el layout se renderiza fuera de ese flujo.
  if (!user) redirect("/crm/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-brown-dark/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-forest">🪵 RHG Maderas · CRM</span>
            <nav className="hidden sm:flex gap-4 text-sm font-medium text-brown-dark/70">
              <a href="/crm" className="hover:text-forest">
                Leads
              </a>
              {isAdmin && (
                <a href="/crm/paginas" className="hover:text-forest">
                  Páginas
                </a>
              )}
              {isAdmin && (
                <a href="/crm/team" className="hover:text-forest">
                  Equipo
                </a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brown-dark/60">
              {profile?.full_name} ({profile?.role})
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
