"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const PRODUCTOS = [
  "Madera tratada CCA",
  "Deck de Cumaru",
  "Deck de Ipe",
  "Vigas estufadas",
  "Triplay y cimbras",
  "Maderas tropicales",
  "Otro",
];

export default function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar tu cotización.");
      }

      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl bg-forest/8 border border-forest/20 p-8 text-center" role="status">
        <div className="w-16 h-16 rounded-full bg-forest/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-forest" aria-hidden="true" />
        </div>
        <p className="text-xl font-semibold text-forest" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          ¡Solicitud recibida!
        </p>
        <p className="text-brown-mid/70 mt-2 text-sm leading-relaxed">
          Te contactaremos en menos de 24 horas. También puedes escribirnos por WhatsApp si necesitas respuesta inmediata.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/526182585606"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5
                       text-sm font-semibold text-white hover:bg-[#20bc59] transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp Durango
          </a>
          <button
            onClick={() => setStatus("idle")}
            className="text-sm text-brown-light/60 hover:text-brown-mid transition-colors underline underline-offset-2"
          >
            Enviar otra cotización
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      {/* Nombre */}
      <div className="sm:col-span-1 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="nombre">
          Nombre completo <span className="text-amber">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          autoComplete="name"
          placeholder="Ej. Carlos López"
          className="form-input"
        />
      </div>

      {/* Teléfono */}
      <div className="sm:col-span-1 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="telefono">
          Teléfono <span className="text-amber">*</span>
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Ej. 618 258 5606"
          className="form-input"
        />
      </div>

      {/* Correo */}
      <div className="sm:col-span-1 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="correo">
          Correo electrónico
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          className="form-input"
        />
      </div>

      {/* Ciudad */}
      <div className="sm:col-span-1 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="ciudad">
          Ciudad <span className="text-amber">*</span>
        </label>
        <select id="ciudad" name="ciudad" required className="form-input">
          <option value="">Selecciona tu ciudad...</option>
          <option value="Durango">Durango</option>
          <option value="Guadalajara">Guadalajara</option>
          <option value="Otra">Otra ciudad</option>
        </select>
      </div>

      {/* Producto */}
      <div className="sm:col-span-2 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="producto">
          Producto de interés <span className="text-amber">*</span>
        </label>
        <select id="producto" name="producto" required className="form-input">
          <option value="">¿Qué tipo de madera necesitas?</option>
          {PRODUCTOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div className="sm:col-span-2 space-y-1.5">
        <label className="block text-sm font-semibold text-brown-dark" htmlFor="mensaje">
          Cuéntanos tu proyecto
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="Dimensiones, cantidades, uso final, fechas de entrega..."
          className="form-input resize-none"
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3" role="alert">
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <button
          type="submit"
          id="btn-submit-quote"
          disabled={status === "loading"}
          className="btn-primary w-full sm:w-auto px-8 py-3.5"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            <>
              Solicitar cotización
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-xs text-brown-light/50 leading-tight">
          Sin compromiso. Te respondemos en menos de 24 h.
        </p>
      </div>
    </form>
  );
}
