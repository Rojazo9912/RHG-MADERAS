import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rhgmaderas.com"),
  title: {
    default: "RHG Maderas | Madera Tratada en Durango y Guadalajara",
    template: "%s | RHG Maderas",
  },
  description:
    "Venta de madera tratada CCA, decks de cumaru e ipe, vigas estufadas y maderas tropicales en Durango y Guadalajara, México. Cotiza gratis.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "RHG Maderas",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
