"use client";

import { useState } from "react";
import { Menu, TreePine, X } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const LINKS = [
  { href: "#productos", label: "Productos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#cotizar", label: "Cotizar" },
  { href: "#contacto", label: "Contacto" },
];

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <a href="/" className={`flex items-center gap-2.5 group rounded-md ${FOCUS_RING}`}>
          <TreePine className="w-6 h-6 text-forest" aria-hidden="true" />
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
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative py-1 rounded-sm hover:text-forest transition-colors
                         after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0
                         after:bg-forest after:transition-all after:duration-300
                         hover:after:w-full ${FOCUS_RING}`}
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
            className={`hidden sm:flex items-center gap-2 text-sm font-medium text-forest
                       hover:text-forest-light transition-colors rounded-md ${FOCUS_RING}`}
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
          <a href="#cotizar" className={`btn-primary text-sm px-5 py-2.5 ${FOCUS_RING}`}>
            Cotiza gratis
          </a>

          <button
            type="button"
            className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-brown-dark
                       hover:bg-brown-dark/5 transition-colors ${FOCUS_RING}`}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav-panel"
          role="menu"
          className="md:hidden border-t border-brown-dark/10 bg-cream px-4 sm:px-6 py-4 flex flex-col gap-1"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`px-2 py-2.5 rounded-lg text-brown-mid font-medium hover:bg-brown-dark/5 hover:text-forest transition-colors ${FOCUS_RING}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/526182585606"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={`mt-2 flex items-center gap-2 px-2 py-2.5 rounded-lg text-forest font-medium hover:bg-forest/5 transition-colors ${FOCUS_RING}`}
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
