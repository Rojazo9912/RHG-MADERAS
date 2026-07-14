"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, TreePine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.replace("/crm");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brown-dark px-4">
      {/* Gradient background + patrón, mismo lenguaje visual que el hero del sitio */}
      <div className="absolute inset-0 bg-gradient-to-br from-brown-dark via-brown to-forest-dark opacity-95" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(200,168,130,0.3) 40px,
            rgba(200,168,130,0.3) 41px
          )`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl bg-white shadow-xl shadow-brown-dark/20 p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <TreePine className="w-9 h-9 text-forest" aria-hidden="true" />
            <h1
              className="mt-3 text-2xl font-bold text-brown-dark"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              RHG Maderas
            </h1>
            <p className="text-brown-mid/60 text-sm mt-1">CRM del equipo</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-brown-dark" htmlFor="email">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                className="form-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-brown-dark" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                  className="form-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-brown-light/60 hover:text-brown-dark transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-xs text-brown-dark/50 text-center mt-6">
            Los usuarios se crean desde Supabase o por un admin en /crm/team.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-cream/60">
          <a href="/" className="hover:text-cream transition-colors">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}
