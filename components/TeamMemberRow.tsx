"use client";

import { useTransition } from "react";
import type { Profile, UserLocation, UserRole } from "@/types/database";

export default function TeamMemberRow({
  profile,
  action,
}: {
  profile: Profile;
  action: (
    profileId: string,
    updates: { role?: UserRole; location?: UserLocation; active?: boolean }
  ) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-t border-brown-dark/5">
      <td className="px-4 py-3 font-medium">{profile.full_name}</td>
      <td className="px-4 py-3">
        <select
          defaultValue={profile.role}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() => action(profile.id, { role: e.target.value as UserRole }))
          }
          className="rounded-md border border-brown-dark/20 px-2 py-1 text-sm"
        >
          <option value="vendedor">Vendedor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          defaultValue={profile.location}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() => action(profile.id, { location: e.target.value as UserLocation }))
          }
          className="rounded-md border border-brown-dark/20 px-2 py-1 text-sm"
        >
          <option value="durango">Durango</option>
          <option value="guadalajara">Guadalajara</option>
          <option value="ambas">Ambas</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => action(profile.id, { active: !profile.active }))}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            profile.active ? "bg-forest/20 text-forest" : "bg-red-100 text-red-700"
          }`}
        >
          {profile.active ? "Activo" : "Inactivo"}
        </button>
      </td>
    </tr>
  );
}
