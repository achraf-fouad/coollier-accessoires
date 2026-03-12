import type { Metadata } from "next";
import { Playfair_Display, Inter, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Coollier Accessories | Bijoux Raffinés au Maroc",
  description: "Boutique en ligne de bijoux minimalistes et élégants. Découvrez nos colliers, bracelets et bagues. Livraison gratuite au Maroc.",
  keywords: "bijoux maroc, bracelets, colliers, bagues, coollier, accessoires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${playfair.variable} ${inter.variable} ${cairo.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
