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
      <div className="rounded-lg bg-forest/10 border border-forest/30 p-6 text-center">
        <p className="text-lg font-semibold text-forest">¡Gracias! Recibimos tu solicitud.</p>
        <p className="text-brown-dark/80 mt-1">
          Te contactaremos pronto. También puedes escribirnos directo por WhatsApp.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm underline text-forest"
        >
          Enviar otra cotización
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium mb-1" htmlFor="nombre">
          Nombre *
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium mb-1" htmlFor="telefono">
          Teléfono *
        </label>
        <input
          id="telefono"
          name="telefono"
          required
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium mb-1" htmlFor="correo">
          Correo
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium mb-1" htmlFor="ciudad">
          Ciudad *
        </label>
        <select
          id="ciudad"
          name="ciudad"
          required
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">Selecciona...</option>
          <option value="Durango">Durango</option>
          <option value="Guadalajara">Guadalajara</option>
          <option value="Otra">Otra</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1" htmlFor="producto">
          Producto de interés *
        </label>
        <select
          id="producto"
          name="producto"
          required
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <option value="">Selecciona...</option>
          {PRODUCTOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1" htmlFor="mensaje">
          Cuéntanos tu proyecto
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          className="w-full rounded-md border border-brown-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto rounded-md bg-forest px-6 py-3 font-semibold text-white hover:bg-forest/90 disabled:opacity-60"
        >
          {status === "loading" ? "Enviando..." : "Solicitar cotización"}
        </button>
      </div>
    </form>
  );
}
