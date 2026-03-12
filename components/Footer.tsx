'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-beige/30 border-t border-beige pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif font-bold mb-6">Coollier Accessories</h2>
            <p className="text-dark/70 max-w-sm leading-relaxed">
              Des bijoux raffinés et minimalistes pour sublimer votre élégance au quotidien. 
              Basés au Maroc, nous livrons partout dans le royaume.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm uppercase tracking-widest font-bold mb-6">Explore</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-sm hover:text-gold transition-colors">
                  {t.nav.shop}
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-sm hover:text-gold transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm hover:text-gold transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm uppercase tracking-widest font-bold mb-6">Contact</h3>
            <ul className="space-y-4 font-sans font-medium">
              <li className="text-sm text-dark/70">Maroc (Livraison Nationale)</li>
              <li className="text-sm text-dark/70">WhatsApp: +212 710-824761</li>
              <li className="text-sm text-dark/70">contact@coollier.ma</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-beige/50 text-center">
          <p className="text-xs text-dark/50 uppercase tracking-widest">
            © {new Date().getFullYear()} Coollier Accessories. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
