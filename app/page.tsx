'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Instagram } from 'lucide-react';
import { ensureValidImageUrl } from '@/lib/utils';

export default function Home() {
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').limit(8);
      if (data && data.length > 0) {
        setProducts(data.slice(0, 4));

        // Build gallery from product images (main + extras from metadata)
        const imgs: string[] = [];
        for (const p of data) {
          if (p.image) imgs.push(p.image);
          const extras: string[] = p.metadata?.images?.filter(Boolean) || [];
          imgs.push(...extras);
          if (imgs.length >= 6) break;
        }
        // Pad with first product image if not enough
        while (imgs.length < 6 && data[0]?.image) {
          imgs.push(data[0].image);
        }
        setGalleryImages(imgs.slice(0, 6));
      }
    }
    fetchProducts();
  }, []);

  // Fallback gallery images while products load
  const fallbackGallery = [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535632787358-4bfb5c700fac?q=80&w=500&auto=format&fit=crop",
  ];

  const displayGallery = galleryImages.length >= 6 ? galleryImages : fallbackGallery;

  return (
    <main className={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop"
          alt="Jewelry Hero"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif mb-6 leading-tight"
          >
            {t.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-10 opacity-90 font-light tracking-wide"
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/shop" 
              className="px-10 py-4 bg-accent-purple text-white uppercase tracking-widest text-sm font-bold hover:scale-105 transition-all duration-300 inline-block border border-accent-purple shadow-xl shadow-accent-purple/20"
            >
              {t.hero.cta}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="bg-beige/40 py-6 text-center border-y border-beige">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
            {t.bundle.title}: {t.bundle.desc}
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-2">Nouveautés</h2>
            <div className="h-1 w-20 bg-gold" />
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-dark pb-1 hover:text-gold hover:border-gold transition-colors">
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-beige/10 py-24 border-t border-beige">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square">
            <Image
              src={ensureValidImageUrl("https://images.unsplash.com/photo-1573408302355-4e0b7cb0308d?q=80&w=1000&auto=format&fit=crop")}
              alt="Artisan Jewelry"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-8">
            <span className="text-xs uppercase tracking-[0.4em] text-gold font-bold">L&apos;histoire Coollier</span>
            <h2 className="text-4xl font-serif leading-tight">L&apos;élégance à portée de main au Maroc.</h2>
            <p className="text-dark/70 text-lg leading-relaxed font-light">
              Née de la passion pour le design minimaliste et l&apos;artisanat de qualité, Coollier Accessories propose une sélection de bijoux intemporels. 
              Chaque pièce est choisie pour sublimer votre style unique, que ce soit pour une soirée spéciale ou pour votre quotidien.
            </p>
            <div className="pt-4">
              <Link href="/shop" className="px-8 py-3 border border-dark uppercase tracking-widest text-xs font-bold hover:bg-dark hover:text-white transition-colors">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery — uses real product photos from DB */}
      <section className="py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Instagram size={24} className="text-accent-purple" />
            <h2 className="text-3xl font-serif">#CoollierStyle</h2>
          </div>
          <p className="text-dark/50 uppercase tracking-widest text-xs">Suivez-nous sur Instagram @coollier.ma</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-[250px] md:h-[400px]">
          {displayGallery.map((url, i) => (
            <div key={i} className="relative overflow-hidden group">
              <Image
                src={ensureValidImageUrl(url)}
                alt={`Coollier Style ${i + 1}`}
                fill
                className="object-cover transition-all duration-700 hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-accent-purple/0 group-hover:bg-accent-purple/30 transition-all duration-500 flex items-center justify-center">
                <Instagram size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
