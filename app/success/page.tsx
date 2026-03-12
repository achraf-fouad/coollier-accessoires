'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SuccessPage() {
  return (
    <main className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full text-center space-y-8"
        >
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="text-accent-purple" size={48} />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase"
            >
              Confirmé
            </motion.div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold text-dark">Merci pour votre commande !</h1>
            <p className="text-dark/60 leading-relaxed font-light text-lg">
              Votre commande a été reçue avec succès. Notre équipe vous contactera par téléphone sous peu pour confirmer les détails de la livraison.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center space-y-2">
              <Package className="text-accent-purple" size={24} />
              <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Livraison</p>
              <p className="font-bold">24h - 48h</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center space-y-2">
              <ShoppingBag className="text-accent-purple" size={24} />
              <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Paiement</p>
              <p className="font-bold">À la livraison</p>
            </div>
          </div>

          <div className="pt-8">
            <Link 
              href="/shop" 
              className="inline-flex items-center space-x-3 px-8 py-4 bg-dark text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-accent-purple transition-all shadow-xl shadow-dark/10"
            >
              <span>Continuer mes achats</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-xs text-dark/40 italic">
            Pour toute question, n'hésitez pas à nous contacter sur WhatsApp.
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
