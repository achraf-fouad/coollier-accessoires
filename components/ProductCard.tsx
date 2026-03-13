'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ensureValidImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-beige/20 mb-4">
        <Image
          src={ensureValidImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-dark/50">
          {t.product.categories[product.category as keyof typeof t.product.categories] || product.category}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-serif group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-medium">{product.price} MAD</p>
      </div>

      <Link
        href={`/product/${product.id}`}
        className="mt-4 w-full py-3 inline-block text-center text-xs uppercase tracking-widest border border-dark hover:bg-accent-purple hover:border-accent-purple hover:text-white transition-all duration-300 font-bold"
      >
        Choisir les options
      </Link>
    </motion.div>
  );
}
