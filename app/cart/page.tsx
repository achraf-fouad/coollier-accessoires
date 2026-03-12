'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { t, lang } = useLanguage();
  const { cart, removeItem, updateQuantity, subtotal, totalItems, isGiftPack, setGiftPack } = useCart();

  if (cart.length === 0) {
    return (
      <main className={`bg-gray-50 min-h-screen ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        <Navbar />
        <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 max-w-md mx-auto px-4 text-center">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-dark/5">
            <ShoppingBag size={56} className="text-dark/20" />
          </div>
          <h1 className="text-4xl font-serif font-black tracking-tight text-dark">{t.cart.empty}</h1>
          <p className="text-sm text-dark/50 mb-4 tracking-wide">Découvrez nos collections pour remplir votre panier.</p>
          <Link href="/shop" className="w-full py-5 bg-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3 text-sm">
            <span>{t.hero.cta}</span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className={`bg-gray-50 min-h-screen ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24 font-sans">
        <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight text-dark mb-4">{t.cart.title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-dark/40 font-bold mb-12">Total: {totalItems} Produit(s)</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex space-x-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="relative w-24 h-32 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="pr-4">
                      <h3 className="text-lg font-black uppercase tracking-tight text-dark truncate leading-tight">{item.name}</h3>
                      <p className="text-xl font-black text-accent-purple mt-2">{item.price} MAD</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-dark/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50/50">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-3 hover:bg-gray-100 rounded-l-xl transition-colors text-dark/60"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors text-dark/60"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-dark/5">
              <h2 className="text-xl font-black uppercase tracking-widest text-dark mb-8 pb-4 border-b border-gray-100">{t.cart.total}</h2>
              
              <div className="space-y-6 mb-8">
                <div 
                  className={`flex items-start justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${isGiftPack ? 'border-accent-purple bg-accent-purple/5 ring-1 ring-accent-purple shadow-sm' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                  onClick={() => setGiftPack(!isGiftPack)}
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-dark">{t.cart.gift}</p>
                    <p className="text-[10px] uppercase font-bold text-dark/40 mt-1">Pack premium (+50 MAD)</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isGiftPack ? 'bg-accent-purple border-accent-purple text-white' : 'border-gray-200 bg-white'}`}>
                    {isGiftPack && <Check size={12} className="stroke-[4]" />}
                  </div>
                </div>

                <div className="pt-6 space-y-4 text-sm font-bold uppercase tracking-widest text-dark/50">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="text-dark">{subtotal - (isGiftPack ? 50 : 0)} MAD</span>
                  </div>
                  {isGiftPack && (
                    <div className="flex justify-between">
                      <span>Package Cadeau</span>
                      <span className="text-dark">50 MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between py-4 border-t border-gray-100 mt-4">
                    <span className="text-lg text-dark">Total</span>
                    <span className="text-3xl font-black text-accent-purple">{subtotal} MAD</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="w-full py-6 bg-accent-purple text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-sm"
              >
                <span>{t.cart.checkout}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-4 text-[10px] uppercase tracking-[0.2em] text-dark/60 font-black">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-green-500" strokeWidth={3} />
                </div>
                <span>Livraison Gratuite ce mois-ci</span>
              </div>
              <div className="flex items-center space-x-4 text-[10px] uppercase tracking-[0.2em] text-dark/60 font-black">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💶</span>
                </div>
                <span>Paiement Espèces à la livraison</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Check({ size, className, strokeWidth = 3 }: { size: number; className?: string; strokeWidth?: number }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
