"use client";

import { useRef, useState, useTransition } from "react";
import type { UserLocation, UserRole } from "@/types/database";
import { useToast } from "@/components/ui/Toast";

export default function InviteTeamMemberForm({
  action,
}: {
  action: (input: { email: string; fullName: string; role: UserRole; location: UserLocation }) => Promise<void>;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        const input = {
          email: String(fd.get("email")),
          fullName: String(fd.get("fullName")),
          role: fd.get("role") as UserRole,
          location: fd.get("location") as UserLocation,
        };
        startTransition(async () => {
          try {
            await action(input);
            formRef.current?.reset();
            toast.show(`Invitación enviada a ${input.email}.`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error al invitar.");
          }
        });
      }}
      className="grid gap-3 sm:grid-cols-4 items-end"
    >
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium mb-1">Nombre</label>
        <input name="fullName" required className="w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm" />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium mb-1">Correo</label>
        <input name="email" type="email" required className="w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm" />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium mb-1">Rol</label>
        <select name="role" defaultValue="vendedor" className="w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm">
          <option value="vendedor">Vendedor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium mb-1">Ubicación</label>
        <select name="location" defaultValue="ambas" className="w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm">
          <option value="durango">Durango</option>
          <option value="guadalajara">Guadalajara</option>
          <option value="ambas">Ambas</option>
        </select>
      </div>
      <div className="sm:col-span-4">
        <button
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Invitando..." : "Invitar al equipo"}
        </button>
        {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
