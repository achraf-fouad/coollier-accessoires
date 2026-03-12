'use client';

import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  const items = [
    'Livraison gratuite partout au Maroc 🇲🇦',
    'Qualité Premium Garantie ✨',
    'Paiement à la livraison 💸',
    'Satisfait ou remboursé ✅',
  ];

  return (
    <div className="bg-accent-purple text-white py-2 overflow-hidden relative">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap space-x-12 items-center"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
