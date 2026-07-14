import { Resend } from "resend";
import type { Lead } from "@/types/database";

// Reemplaza los nodos "Email al Equipo RHG" y "Email Confirmación al Cliente"
// del flujo de n8n (rhg_maderas_flujo_cotizacion.json), con la misma plantilla.

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendTeamNotification(lead: Lead) {
  if (!process.env.RESEND_API_KEY) return; // no-op si aún no se configura
  const resend = getResend();

  await resend.emails.send({
    from: process.env.EMAIL_FROM_NOTIFICACIONES || "notificaciones@rhgmaderas.com",
    to: process.env.EMAIL_EQUIPO || "Roberto.herrera.garcia8@gmail.com",
    subject: `🪵 Nuevo Lead - ${lead.nombre} (${lead.ciudad || "sin ciudad"})`,
    html: `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#2d5016;padding:20px;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;">🪵 RHG Maderas - Nuevo Lead</h1>
      </div>
      <div style="background:#f9f9f9;padding:25px;border:1px solid #ddd;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;font-weight:bold;">Nombre:</td><td style="padding:8px;">${lead.nombre}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px;font-weight:bold;">Teléfono:</td><td style="padding:8px;">${lead.telefono ?? ""}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Correo:</td><td style="padding:8px;">${lead.correo ?? ""}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px;font-weight:bold;">Ciudad:</td><td style="padding:8px;">${lead.ciudad ?? ""}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Producto:</td><td style="padding:8px;"><strong style="color:#2d5016;">${lead.producto ?? ""}</strong></td></tr>
        </table>
        <div style="margin:20px 0;background:#fff;padding:15px;border-left:4px solid #2d5016;">
          <strong>Mensaje:</strong><p style="margin:8px 0 0;">${lead.mensaje ?? ""}</p>
        </div>
        <div style="text-align:center;">
          <a href="https://wa.me/${(lead.telefono ?? "").replace(/\D/g, "")}" style="background:#25D366;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;font-weight:bold;">💬 Responder por WhatsApp</a>
        </div>
      </div></body></html>
    `,
  });
}

export async function sendClientConfirmation(lead: Lead) {
  if (!process.env.RESEND_API_KEY || !lead.correo) return;
  const resend = getResend();

  await resend.emails.send({
    from: process.env.EMAIL_FROM_COTIZACIONES || "cotizaciones@rhgmaderas.com",
    to: lead.correo,
    subject: "✅ Recibimos tu cotización - RHG Maderas",
    html: `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#2d5016;padding:30px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;">🪵 RHG Maderas</h1>
        <p style="color:#a8d5a2;">Madera que dura décadas, no temporadas</p>
      </div>
      <div style="background:#fff;padding:30px;border:1px solid #ddd;">
        <h2 style="color:#2d5016;">¡Hola ${lead.nombre}! 👋</h2>
        <p>Recibimos tu solicitud para <strong>${lead.producto ?? "tu proyecto"}</strong>. Te contactaremos pronto.</p>
        <div style="background:#f0f7ed;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Producto:</strong> ${lead.producto ?? ""}</p>
          <p><strong>Ciudad:</strong> ${lead.ciudad ?? ""}</p>
        </div>
        <div style="text-align:center;margin:20px 0;">
          <a href="https://wa.me/526182585606" style="background:#25D366;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;margin:5px;display:inline-block;">💬 WhatsApp Durango</a>
          <a href="https://wa.me/5213350861563" style="background:#25D366;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;margin:5px;display:inline-block;">💬 WhatsApp Guadalajara</a>
        </div>
      </div>
      <div style="background:#eee;padding:15px;text-align:center;font-size:12px;color:#888;border-radius:0 0 8px 8px;">© 2026 RHG Maderas · rhgmaderas.com</div>
      </body></html>
    `,
  });
}
