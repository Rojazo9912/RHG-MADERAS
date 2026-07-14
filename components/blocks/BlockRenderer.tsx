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
        <section className="bg-gradient-to-b from-brown-dark to-brown text-cream">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl mx-auto">
              {c.titulo}
            </h1>
            {c.subtitulo && (
              <p className="mt-6 text-lg text-cream/80 max-w-2xl mx-auto">{c.subtitulo}</p>
            )}
            {c.cta_label && (
              <div className="mt-8">
                <a
                  href={c.cta_href || "#cotizar"}
                  className="inline-block rounded-md bg-amber px-6 py-3 font-semibold text-brown-dark hover:bg-amber-light"
                >
                  {c.cta_label}
                </a>
              </div>
            )}
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
        <section className="mx-auto max-w-6xl px-4 py-16">
          {c.titulo && (
            <h2 className="text-3xl font-bold text-center text-brown-dark mb-12">{c.titulo}</h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {((c.items as ProductGridItem[]) || []).map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-brown-dark/10 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg text-forest">{item.nombre}</h3>
                <p className="mt-2 text-sm text-brown-dark/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-forest/5 py-16">
          <div className="mx-auto max-w-md px-4 grid grid-cols-3 gap-6 text-center">
            {((c.items as StatsItem[]) || []).map((item, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-amber">{item.value}</div>
                <div className="text-sm text-brown-dark/70">{item.label}</div>
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
