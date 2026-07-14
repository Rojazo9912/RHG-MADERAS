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
    return null;
  }
}

const PRODUCTOS = [
  { icon: "🌲", name: "Madera Tratada CCA", desc: "Resistente a hongos, insectos y humedad. Ideal para exteriores y estructuras." },
  { icon: "🏝️", name: "Deck de Cumaru", desc: "Madera tropical de alta durabilidad, perfecta para terrazas y albercas." },
  { icon: "🪵", name: "Deck de Ipe", desc: "Una de las maderas más duras del mundo. Elegancia y longevidad garantizadas." },
  { icon: "🏗️", name: "Vigas Estufadas", desc: "Proceso de secado controlado para mayor estabilidad dimensional." },
  { icon: "📦", name: "Triplay y Cimbras", desc: "Soluciones de encofrado y revestimiento para obra civil y arquitectura." },
  { icon: "🌴", name: "Maderas Tropicales", desc: "Amplio catálogo de especies selectas para proyectos especiales." },
];

const STATS = [
  { value: "15+", label: "Años de experiencia" },
  { value: "2", label: "Sucursales" },
  { value: "500+", label: "Clientes satisfechos" },
  { value: "100%", label: "Madera certificada" },
];

export default async function HomePage() {
  const blocks = await getHomeBlocks();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl">🪵</span>
            <div className="leading-tight">
              <span className="block text-lg font-bold text-brown-dark tracking-tight group-hover:text-forest transition-colors">
                RHG Maderas
              </span>
              <span className="block text-[10px] text-brown-light/70 uppercase tracking-widest font-medium">
                Good Lumber
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brown-mid">
            {[
              { href: "#productos", label: "Productos" },
              { href: "#nosotros", label: "Nosotros" },
              { href: "#cotizar", label: "Cotizar" },
              { href: "#contacto", label: "Contacto" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 hover:text-forest transition-colors
                           after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0
                           after:bg-forest after:transition-all after:duration-300
                           hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/526182585606"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-forest
                         hover:text-forest-light transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="#cotizar"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Cotiza gratis
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO / CONTENIDO CMS ──────────────────────────────────── */}
      <div id="productos">
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
        ) : (
          <>
            {/* Hero fallback — cinematográfico */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brown-dark">
              {/* Gradient background + patrón */}
              <div className="absolute inset-0 bg-gradient-to-br from-brown-dark via-brown to-forest-dark opacity-95" />
              <div
                className="absolute inset-0 opacity-10"
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
                  <div className="animate-fade-up">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-4 py-1.5 text-sm font-semibold text-amber-light mb-8">
                      🌲 Durango &amp; Guadalajara, México
                    </span>
                  </div>
                  <h1
                    className="animate-fade-up animate-delay-100
                               text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Madera que dura{" "}
                    <em className="not-italic text-amber-light">décadas</em>,<br />
                    no temporadas
                  </h1>
                  <p className="animate-fade-up animate-delay-200 mt-6 text-lg sm:text-xl text-cream/70 max-w-xl leading-relaxed">
                    Madera tratada CCA, decks tropicales, vigas estufadas y más.
                    Calidad industrial para proyectos que perduran.
                  </p>
                  <div className="animate-fade-up animate-delay-300 mt-10 flex flex-wrap gap-4">
                    <a href="#cotizar" className="btn-primary px-8 py-4 text-base">
                      Solicitar cotización
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                    <a href="#productos" className="btn-outline px-8 py-4 text-base">
                      Ver productos
                    </a>
                  </div>
                </div>

                {/* Stats */}
                <div className="animate-fade-up animate-delay-400 grid grid-cols-2 gap-4">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center"
                    >
                      <div
                        className="text-4xl font-bold text-amber-light"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-1 text-sm text-cream/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wave bottom */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 80" className="w-full fill-cream">
                  <path d="M0,64 C360,0 1080,80 1440,32 L1440,80 L0,80 Z" />
                </svg>
              </div>
            </section>

            {/* Productos fallback */}
            <section id="nosotros" className="bg-cream py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="text-center mb-16">
                  <span className="section-badge">🪵 Nuestro catálogo</span>
                  <h2
                    className="mt-4 text-4xl sm:text-5xl font-bold text-brown-dark"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Maderas para cada proyecto
                  </h2>
                  <p className="mt-4 text-brown-mid/70 text-lg max-w-2xl mx-auto">
                    Desde madera estructural hasta acabados de lujo. Todos nuestros productos
                    tienen garantía de calidad y procedencia certificada.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PRODUCTOS.map((prod) => (
                    <div
                      key={prod.name}
                      className="card-hover group relative rounded-2xl border border-brown-dark/8
                                 bg-white p-6 shadow-sm overflow-hidden"
                    >
                      {/* Accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber to-forest rounded-t-2xl
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="text-4xl mb-4">{prod.icon}</div>
                      <h3 className="text-lg font-semibold text-brown-dark mb-2">{prod.name}</h3>
                      <p className="text-sm text-brown-mid/70 leading-relaxed">{prod.desc}</p>
                      <a
                        href="#cotizar"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest
                                   hover:text-forest-light transition-colors"
                      >
                        Cotizar este producto
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Por qué elegirnos */}
            <section className="bg-brown-dark py-24">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <span className="section-badge bg-amber/20 border-amber/40 text-amber-light">
                      ✓ ¿Por qué RHG?
                    </span>
                    <h2
                      className="mt-4 text-4xl sm:text-5xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Más de 15 años entregando calidad
                    </h2>
                    <p className="mt-4 text-cream/60 text-lg leading-relaxed">
                      Somos especialistas en madera para la industria de la construcción, arquitectura
                      y diseño de interiores. Trabajamos con las mejores especies certificadas.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        "Entrega puntual en Durango y Guadalajara",
                        "Asesoría técnica sin costo con cada compra",
                        "Madera con tratamiento CCA certificado",
                        "Precios competitivos para proyectos grandes",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-forest flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-cream/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
                      >
                        <div
                          className="text-5xl font-bold text-amber-light"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {stat.value}
                        </div>
                        <div className="mt-2 text-sm text-cream/50 leading-snug">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── FORMULARIO DE COTIZACIÓN ──────────────────────────────── */}
      <section id="cotizar" className="bg-cream-dark py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-badge">📋 Cotización sin costo</span>
            <h2
              className="mt-4 text-4xl sm:text-5xl font-bold text-brown-dark"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Solicita tu cotización
            </h2>
            <p className="mt-4 text-brown-mid/70 text-lg">
              Cuéntanos tu proyecto y te contactamos en menos de 24 horas.
            </p>
          </div>

          <div className="rounded-3xl border border-brown-dark/8 bg-white shadow-xl shadow-brown-dark/5 p-8 sm:p-10">
            <QuoteForm />
          </div>

          {/* WhatsApp alt */}
          <p className="mt-6 text-center text-sm text-brown-light/60">
            ¿Prefieres hablar directo?{" "}
            <a
              href="https://wa.me/526182585606"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-forest hover:text-forest-light transition-colors"
            >
              Escríbenos por WhatsApp →
            </a>
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer id="contacto" className="bg-brown-dark text-cream/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-white/10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-2xl">🪵</span>
                <div>
                  <span className="block text-lg font-bold text-white">RHG Maderas</span>
                  <span className="block text-xs text-cream/40 uppercase tracking-widest">Good Lumber</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Especialistas en madera tratada y maderas tropicales para la
                construcción y el diseño. Durango y Guadalajara.
              </p>
              <div className="flex gap-3 mt-6">
                <a
                  href="https://wa.me/526182585606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30
                             px-4 py-2 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Durango
                </a>
                <a
                  href="https://wa.me/5213350861563"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30
                             px-4 py-2 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Guadalajara
                </a>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Productos</h3>
              <ul className="space-y-2">
                {["Madera Tratada CCA", "Deck de Cumaru", "Deck de Ipe", "Vigas Estufadas", "Triplay"].map((p) => (
                  <li key={p}>
                    <a href="#cotizar" className="text-sm hover:text-cream transition-colors">
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:Roberto.herrera.garcia8@gmail.com"
                    className="hover:text-cream transition-colors break-all"
                  >
                    Roberto.herrera.garcia8@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">📍</span>
                  <span>Durango, Dgo. · Guadalajara, Jal.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/30">
            <p>© {new Date().getFullYear()} RHG Maderas · rhgmaderas.com</p>
            <a href="/crm/login" className="hover:text-cream/60 transition-colors">
              Acceso CRM →
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
