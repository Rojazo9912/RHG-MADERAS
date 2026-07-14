"use client";

import { useState, type FormEvent } from "react";

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
      <div className="rounded-2xl bg-forest/8 border border-forest/20 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-forest/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
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
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
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
        <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
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
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </>
          ) : (
            <>
              Solicitar cotización
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
