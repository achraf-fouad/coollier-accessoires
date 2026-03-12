'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <ShoppingBag size={24} className="text-accent-purple" />
                <h2 className="text-xl font-serif font-bold">Votre Panier ({totalItems})</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className={`flex-grow overflow-y-auto p-6 ${cart.length > 0 ? 'space-y-6' : 'flex items-center justify-center'}`}>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex space-x-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold uppercase tracking-tight leading-tight truncate pr-2">{item.name}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-dark/30 hover:text-red-500 transition-colors flex-shrink-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-accent-purple font-black text-sm mt-1">{item.price} MAD</p>
                      </div>
                      <div className="flex items-center space-x-2 border border-gray-100 rounded-lg w-fit mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-5 opacity-50 my-auto">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={40} className="text-dark/40" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-dark">Votre panier est vide</p>
                    <p className="text-xs text-dark/60 mt-2">Découvrez nos collections pour le remplir.</p>
                  </div>
                  <button onClick={onClose} className="px-6 py-3 bg-dark text-white rounded-full text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-accent-purple transition-colors shadow-lg">Continuer mes achats</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-dark/50 uppercase font-bold tracking-widest">Sous-total*</span>
                  <span className="text-2xl font-bold text-accent-purple">{subtotal} MAD</span>
                </div>
                <p className="text-[10px] text-dark/40 italic">*Taxes et livraison gratuites incluses</p>
                <Link 
                  href="/checkout" 
                  onClick={onClose}
                  className="w-full py-5 bg-accent-purple text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                >
                  <span>PASSER LA COMMANDE</span>
                </Link>
                <button onClick={onClose} className="w-full text-xs uppercase font-bold text-dark/40 tracking-widest hover:text-dark transition-colors">
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
