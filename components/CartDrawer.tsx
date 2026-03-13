'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ensureValidImageUrl } from '@/lib/utils';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 flex-none">
              <div className="flex items-center space-x-3">
                <ShoppingBag size={24} className="text-accent-purple" />
                <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">Votre Panier ({totalItems})</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-[#1A1A1A]">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white min-h-0 relative">
              <div className={`p-6 ${cart.length > 0 ? 'space-y-0' : 'h-full flex flex-col items-center justify-center'}`}>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex space-x-5 py-6 border-b border-gray-100 last:border-0 opacity-100 visible">
                      <div className="relative w-28 h-36 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        <Image src={ensureValidImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                          <h3 className="text-sm font-black uppercase tracking-tight leading-tight text-[#1A1A1A] truncate pr-2">{item.name}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-accent-purple font-black text-lg">{item.price} MAD</p>
                        {item.variants && item.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.variants.map((v, i) => (
                              <span key={i} className="text-[9px] bg-gray-50 text-dark/40 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight border border-gray-100">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 px-3 hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="text-xs font-black w-6 text-center text-[#1A1A1A]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 px-3 hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center rotate-3">
                      <ShoppingBag size={40} className="text-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-serif text-3xl font-bold text-[#1A1A1A] italic leading-tight">Panier Vide</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">C'est le moment de se faire plaisir</p>
                    </div>
                    <button onClick={onClose} className="px-10 py-5 bg-dark text-white rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] hover:bg-accent-purple transition-all shadow-xl active:scale-95">Parcourir la boutique</button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-gray-100 bg-white shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] space-y-6 flex-none">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-gray-400 uppercase font-black tracking-[0.3em]">Résumé</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-300 uppercase font-bold tracking-widest leading-none mb-1">Total à payer</span>
                    <span className="text-3xl font-black text-accent-purple tabular-nums">{subtotal} <small className="text-xs">MAD</small></span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    href="/checkout" 
                    onClick={onClose}
                    className="w-full py-6 bg-accent-purple text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent-purple/30 hover:bg-[#1A1A1A] hover:shadow-[#1A1A1A]/20 transition-all duration-500 flex items-center justify-center space-x-3 group"
                  >
                    <span>PASSER LA COMMANDE</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/cart" 
                    onClick={onClose}
                    className="w-full py-3 text-[10px] uppercase font-black text-gray-400 tracking-[0.3em] hover:text-[#1A1A1A] transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <span>Voir le panier complet</span>
                  </Link>
                  <button onClick={onClose} className="w-full py-1 text-[10px] uppercase font-black text-gray-200 tracking-[0.3em] hover:text-[#1A1A1A] transition-colors">
                    ← Continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
