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
      <main className="bg-gray-50 min-h-screen">
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
    <main className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24 font-sans h-full min-h-[70vh]">
        <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight text-dark mb-4">{t.cart.title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-dark/40 font-bold mb-12">Total: {totalItems} Produit(s)</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 p-6 lg:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="relative w-full sm:w-32 h-44 sm:h-40 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:shadow-inner transition-all">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0 py-2">
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-4 space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tight text-dark truncate leading-tight">{item.name}</h3>
                      <p className="text-2xl font-black text-accent-purple">{item.price} MAD</p>
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.variants.map((v, i) => (
                            <span key={i} className="text-[10px] bg-gray-50 text-dark/50 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-gray-100">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-dark/10 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50/50 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-dark/60"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-dark">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-dark/60"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-dark/30 uppercase tracking-widest hidden sm:block">Total: {item.price * item.quantity} MAD</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="relative">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-dark/5">
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-dark mb-10 pb-6 border-b border-gray-50 flex items-center justify-between">
                  <span>{t.cart.total}</span>
                  <ShoppingBag size={24} className="text-dark/10" />
                </h2>
                
                <div className="space-y-8 mb-10">
                  <div 
                    className={`flex items-center justify-between p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 ${isGiftPack ? 'border-accent-purple bg-accent-purple/[0.02] ring-4 ring-accent-purple/5 shadow-inner' : 'border-gray-50 bg-gray-50/30 hover:border-gray-200 hover:bg-white'}`}
                    onClick={() => setGiftPack(!isGiftPack)}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-dark">{t.cart.gift}</p>
                      <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">Emballage Premium (+50 MAD)</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isGiftPack ? 'bg-accent-purple border-accent-purple text-white rotate-0 scale-110' : 'border-gray-200 bg-white rotate-90 scale-90'}`}>
                      <Plus size={14} className={`transition-transform duration-300 ${isGiftPack ? 'rotate-45' : 'rotate-0'}`} />
                    </div>
                  </div>

                  <div className="space-y-5 px-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-dark/40">
                      <span>Sous-total</span>
                      <span className="text-dark">{subtotal - (isGiftPack ? 50 : 0)} MAD</span>
                    </div>
                    {isGiftPack && (
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-accent-purple">
                        <span>Pack Cadeau Premium</span>
                        <span>50 MAD</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-green-500">
                      <span>Livraison</span>
                      <span>GRATUITE</span>
                    </div>
                    <div className="flex justify-between pt-8 border-t border-gray-50 mt-8">
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-dark/30 mt-2">Total FINAL</span>
                      <span className="text-4xl font-black text-accent-purple tracking-tight">{subtotal} <small className="text-xs font-bold text-dark/20 ml-1">MAD</small></span>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full py-6 bg-accent-purple text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent-purple/40 hover:bg-dark hover:shadow-dark/40 hover:-translate-y-1 active:scale-95 transition-all duration-500 flex items-center justify-center space-x-4 text-sm"
                >
                  <span>{t.cart.checkout}</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 group">
                    <Check size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-dark/60 font-black leading-tight">Expédition<br/>Gratuite</span>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💶</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-dark/60 font-black leading-tight">Paiement à<br/>la livraison</span>
                </div>
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
