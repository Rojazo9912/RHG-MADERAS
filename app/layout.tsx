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
      <body>{children}</body>
    </html>
  );
}
