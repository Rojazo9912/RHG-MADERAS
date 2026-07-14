import { ArrowRight, TreePine } from "lucide-react";
import type { PageBlock, ProductGridItem, StatsItem } from "@/types/database";

/**
 * Dibuja cada bloque de una página según su `type`. Este es el lado público
 * (solo lectura); la edición vive en /crm/paginas (ver components/crm/BlockEditorForm.tsx).
 */
export default function BlockRenderer({ block }: { block: PageBlock }) {
  const c = block.content;

  switch (block.type) {
    case "hero":
      return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brown-dark">
          {/* Gradient background + patrón */}
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
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32 grid lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div>
              <h1
                className="animate-fade-up text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {c.titulo}
              </h1>
              {c.subtitulo && (
                <p className="animate-fade-up animate-delay-200 mt-6 text-lg sm:text-xl text-cream/70 max-w-xl leading-relaxed">
                  {c.subtitulo}
                </p>
              )}
              {c.cta_label && (
                <div className="animate-fade-up animate-delay-300 mt-10">
                  <a href={c.cta_href || "#cotizar"} className="btn-primary px-8 py-4 text-base inline-flex">
                    {c.cta_label}
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
            {/* Stats (vacío en hero de BlockRenderer, stats se renderiza como bloque separado) */}
            <div />
          </div>
          {/* Wave bottom */}
          <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
            <svg viewBox="0 0 1440 80" className="w-full fill-cream">
              <path d="M0,64 C360,0 1080,80 1440,32 L1440,80 L0,80 Z" />
            </svg>
          </div>
        </section>
      );

    case "heading": {
      const Tag = c.nivel === 3 ? "h3" : "h2";
      return (
        <div className="mx-auto max-w-6xl px-4 pt-16">
          <Tag className="text-3xl font-bold text-center text-brown-dark">{c.texto}</Tag>
        </div>
      );
    }

    case "text":
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-brown-dark/80 text-center leading-relaxed">{c.texto}</p>
        </div>
      );

    case "image":
      return c.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.url}
          alt={c.alt || ""}
          className="mx-auto max-w-4xl w-full h-auto px-4 py-10"
        />
      ) : null;

    case "product_grid":
      return (
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {c.titulo && (
              <div className="text-center mb-16">
                <span className="section-badge">
                  <TreePine className="w-4 h-4" aria-hidden="true" />
                  Nuestro catálogo
                </span>
                <h2
                  className="mt-4 text-4xl sm:text-5xl font-bold text-brown-dark"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {c.titulo}
                </h2>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {((c.items as ProductGridItem[]) || []).map((item, i) => (
                <div
                  key={i}
                  className="card-hover group relative rounded-2xl border border-brown-dark/8 bg-white p-6 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber to-forest rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {item.image_url ? (
                    <div className="mb-4 -mx-6 -mt-6 aspect-[4/3] overflow-hidden rounded-t-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <TreePine className="w-9 h-9 mb-4 text-forest" aria-hidden="true" />
                  )}
                  <h3 className="text-lg font-semibold text-brown-dark mb-2">{item.nombre}</h3>
                  <p className="text-sm text-brown-mid/70 leading-relaxed flex-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-brown-dark py-16">
          <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {((c.items as StatsItem[]) || []).map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <div className="text-4xl font-bold text-amber-light" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {item.value}
                </div>
                <div className="mt-2 text-sm text-cream/70">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      );

    case "cta_banner":
      return (
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-xl bg-forest text-white px-8 py-12">
            {c.titulo && <h2 className="text-2xl font-bold">{c.titulo}</h2>}
            {c.subtitulo && <p className="mt-2 text-white/80">{c.subtitulo}</p>}
            {c.boton_label && (
              <a
                href={c.boton_href || "#"}
                target="_blank"
                className="mt-6 inline-block rounded-md bg-amber px-6 py-3 font-semibold text-brown-dark hover:bg-amber-light"
              >
                {c.boton_label}
              </a>
            )}
          </div>
        </section>
      );

    case "spacer":
      return <div style={{ height: `${c.alto ?? 40}px` }} />;

    default:
      return null;
  }
}
