import Link from 'next/link';
import { ShoppingBag, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleLang = () => {
    setLang(lang === 'fr' ? 'ar' : 'fr');
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-dark hover:text-gold transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-dark">
              Coollier
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/shop" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">
              {t.nav.shop}
            </Link>
            <Link href="/#about" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">
              {t.nav.about}
            </Link>
            <Link href="/#contact" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">
              {t.nav.contact}
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLang}
              className="flex items-center space-x-1 text-sm font-medium hover:text-gold transition-colors"
              title="Toggle Language"
            >
              <Globe size={18} />
              <span className="uppercase">{lang === 'fr' ? 'AR' : 'FR'}</span>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-dark hover:text-gold transition-colors"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent-purple rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-beige overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-serif hover:text-gold py-2"
              >
                {t.nav.shop}
              </Link>
              <Link
                href="/#about"
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-serif hover:text-gold py-2"
              >
                {t.nav.about}
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-serif hover:text-gold py-2"
              >
                {t.nav.contact}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </nav>
    </>
  );
}
