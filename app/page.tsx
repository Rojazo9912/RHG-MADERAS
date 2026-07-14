import QuoteForm from "@/components/QuoteForm";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { createClient } from "@/lib/supabase/server";
import type { Page, PageBlock } from "@/types/database";

export const revalidate = 0;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RHG Maderas",
  alternateName: "RHG Maderas Good Lumber",
  description:
    "Empresa comercializadora de madera especializada en soluciones madereras para la construcción, arquitectura y diseño. Madera tratada CCA, decks tropicales, vigas estufadas y triplay.",
  url: "https://rhgmaderas.com",
  telephone: ["+52-618-258-5606", "+52-1-33-5086-1563"],
  email: "Roberto.herrera.garcia8@gmail.com",
  priceRange: "$$",
  address: [
    { "@type": "PostalAddress", addressLocality: "Durango", addressRegion: "Durango", addressCountry: "MX" },
    { "@type": "PostalAddress", addressLocality: "Guadalajara", addressRegion: "Jalisco", addressCountry: "MX" },
  ],
  areaServed: [
    { "@type": "City", name: "Durango" },
    { "@type": "City", name: "Guadalajara" },
  ],
};

async function getHomeBlocks(): Promise<PageBlock[] | null> {
  try {
    const supabase = await createClient();
    const { data: page } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "home")
      .eq("status", "publicada")
      .single<Page>();

    if (!page) return null;

    const { data: blocks } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page_id", page.id)
      .order("position", { ascending: true });

    return (blocks as PageBlock[] | null) ?? null;
  } catch {
    // Si Supabase aún no está configurado (desarrollo local sin .env), no
    // tumbamos la página: mostramos el contenido estático de respaldo.
    return null;
  }
}

export default async function HomePage() {
  const blocks = await getHomeBlocks();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown-dark/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-forest">🪵 RHG Maderas</span>
          <nav className="hidden sm:flex gap-6 text-sm font-medium">
            <a href="#productos" className="hover:text-amber">Productos</a>
            <a href="#nosotros" className="hover:text-amber">Nosotros</a>
            <a href="#cotizar" className="hover:text-amber">Cotizar</a>
            <a href="#contacto" className="hover:text-amber">Contacto</a>
          </nav>
          <a
            href="#cotizar"
            className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90"
          >
            Cotiza gratis
          </a>
        </div>
      </header>

      {/* CONTENIDO EDITABLE (CMS) — viene de Supabase (pages/page_blocks para
          slug="home"). Si aún no está configurado Supabase, se muestra un
          hero mínimo de respaldo para que el sitio nunca se vea vacío. */}
      <div id="productos">
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
        ) : (
          <section className="bg-gradient-to-b from-brown-dark to-brown text-cream">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl mx-auto">
                Madera que dura décadas, no temporadas
              </h1>
              <p className="mt-6 text-lg text-cream/80 max-w-2xl mx-auto">
                Configura Supabase y publica la página "home" desde /crm/paginas para
                editar este contenido sin tocar código.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* COTIZAR */}
      <section id="cotizar" className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-brown-dark">Solicita tu cotización</h2>
        <p className="text-center text-brown-dark/70 mt-2">
          Completa el formulario y te contactamos a la brevedad.
        </p>
        <div className="mt-10 rounded-xl border border-brown-dark/10 bg-white p-6 sm:p-8 shadow-sm">
          <QuoteForm />
        </div>
      </section>

      {/* CONTACTO / FOOTER */}
      <footer id="contacto" className="bg-brown-dark text-cream/80 py-14">
        <div className="mx-auto max-w-6xl px-4 grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-cream font-semibold mb-3">RHG Maderas</h3>
            <p className="text-sm">Madera que dura décadas, no temporadas.</p>
          </div>
          <div>
            <h3 className="text-cream font-semibold mb-3">Contacto</h3>
            <p className="text-sm">Roberto.herrera.garcia8@gmail.com</p>
            <a href="https://wa.me/526182585606" className="block text-sm mt-1 hover:text-amber-light">
              💬 WhatsApp Durango
            </a>
            <a href="https://wa.me/5213350861563" className="block text-sm mt-1 hover:text-amber-light">
              💬 WhatsApp Guadalajara
            </a>
          </div>
          <div>
            <h3 className="text-cream font-semibold mb-3">Ubicaciones</h3>
            <p className="text-sm">Durango, México</p>
            <p className="text-sm">Guadalajara, México</p>
          </div>
        </div>
        <p className="text-center text-xs text-cream/50 mt-10">
          © {new Date().getFullYear()} RHG Maderas · rhgmaderas.com
        </p>
      </footer>
    </>
  );
}
