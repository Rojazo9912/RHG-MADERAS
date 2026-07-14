import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendTeamNotification, sendClientConfirmation } from "@/lib/email";
import type { Lead } from "@/types/database";

// Reemplaza el flujo de n8n (Webhook → Procesar Datos → Google Sheets → Emails).
// Acepta el mismo shape de datos que ya usaba el formulario/n8n (nombre/name,
// telefono/phone, correo/email, ciudad/city, producto/product, mensaje/message)
// para no tener que tocar el formulario si aún vive en otro lado.

// ── Google Sheets (respaldo opcional) ───────────────────────────────────────
// Si GOOGLE_SHEETS_WEBHOOK_URL está configurada, cada lead nuevo se envía al
// webhook de Google Sheets (p.ej. un Apps Script doPost o un Make/Zapier hook).
// Si la variable está vacía, esta función es un no-op silencioso.
async function appendToGoogleSheets(lead: Lead): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const payload = {
    id: lead.id,
    nombre: lead.nombre,
    telefono: lead.telefono ?? "",
    correo: lead.correo ?? "",
    ciudad: lead.ciudad ?? "",
    producto: lead.producto ?? "",
    mensaje: lead.mensaje ?? "",
    estado: lead.estado,
    fuente: lead.fuente,
    created_at: lead.created_at,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Timeout corto: el respaldo no debe retrasar la respuesta al cliente.
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets webhook respondió ${response.status}`);
  }
}

const leadSchema = z.object({
  nombre: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  telefono: z.string().optional(),
  phone: z.string().optional(),
  correo: z.string().email().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  ciudad: z.string().optional(),
  city: z.string().optional(),
  producto: z.string().optional(),
  product: z.string().optional(),
  mensaje: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const nombre = data.nombre || data.name;
  if (!nombre) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      nombre,
      telefono: data.telefono || data.phone || null,
      correo: data.correo || data.email || null,
      ciudad: data.ciudad || data.city || null,
      producto: data.producto || data.product || null,
      mensaje: data.mensaje || data.message || null,
      estado: "nuevo",
      fuente: "formulario_web",
    })
    .select()
    .single();

  if (error || !lead) {
    console.error("Error insertando lead:", error);
    return NextResponse.json({ error: "No se pudo guardar la cotización." }, { status: 500 });
  }

  // Emails + respaldo en Google Sheets en paralelo.
  // Si cualquiera falla, no tumbamos la respuesta — el lead ya está en Supabase.
  const results = await Promise.allSettled([
    sendTeamNotification(lead as Lead),
    sendClientConfirmation(lead as Lead),
    appendToGoogleSheets(lead as Lead),
  ]);

  // Log de errores opcionales para depuración (no son fatales).
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const labels = ["sendTeamNotification", "sendClientConfirmation", "appendToGoogleSheets"];
      console.error(`[leads/route] ${labels[i]} falló:`, result.reason);
    }
  });

  return NextResponse.json({
    success: true,
    message: "Cotización recibida. Te contactaremos pronto.",
  });
}
