'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const { cart, subtotal, isGiftPack, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    quartier: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);

    try {
      const fullAddress = [
        formData.address,
        formData.quartier ? `(Quartier: ${formData.quartier})` : '',
        `CART: ${cart.map(i => `${i.name}x${i.quantity}`).join(', ')}`
      ].filter(Boolean).join(' | ');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: fullAddress,
          total_price: subtotal,
          gift_pack: isGiftPack,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Success
      clearCart();
      router.push('/success');
    } catch (err: any) {
      console.error('Order error:', err);
      alert('Erreur lors de la commande: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-serif mb-4">Votre panier est vide</h1>
          <button onClick={() => router.push('/shop')} className="px-8 py-3 bg-dark text-white uppercase text-xs tracking-widest">Boutique</button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4">{t.checkout.title}</h1>
          <p className="text-dark/50 uppercase tracking-[0.2em] text-xs">Paiement à la livraison au Maroc</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Form */}
          <section>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-dark/70">
                  {t.checkout.name}
                </label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-4 border border-beige bg-beige/5 focus:outline-none focus:border-gold transition-colors"
                  placeholder="Ex: Ahmed Alaoui"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-dark/70">
                  {t.checkout.phone}
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-4 border border-beige bg-beige/5 focus:outline-none focus:border-gold transition-colors"
                  placeholder="06 00 00 00 00"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-dark/70">
                    {t.checkout.city}
                  </label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-4 border border-beige bg-beige/5 focus:outline-none focus:border-gold transition-colors"
                    placeholder="Ex: Casablanca"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-dark/70">
                    Quartier / ZIP
                  </label>
                  <input
                    type="text"
                    name="quartier"
                    value={formData.quartier}
                    onChange={handleChange}
                    className="w-full p-4 border border-beige bg-beige/5 focus:outline-none focus:border-gold transition-colors"
                    placeholder="Ex: Maarif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-dark/70">
                  {t.checkout.address}
                </label>
                <textarea
                  required
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-4 border border-beige bg-beige/5 focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Numéro de porte, Rue, etc."
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-dark text-white uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold transition-all duration-300 flex items-center justify-center space-x-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{t.checkout.submit}</span>}
              </button>
            </form>
          </section>

          {/* Summary */}
          <section className="bg-beige/10 p-8 h-fit border border-beige/50">
            <h2 className="text-xl font-serif mb-6">Récapitulatif</h2>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-dark/70">{item.name} x {item.quantity}</span>
                  <span className="font-medium">{item.price} MAD</span>
                </div>
              ))}
              {isGiftPack && (
                <div className="flex justify-between text-sm italic">
                  <span>Emballage Cadeau Luxe</span>
                  <span>49 MAD</span>
                </div>
              )}
              <div className="pt-4 border-t border-dark/10 flex justify-between items-end">
                <span className="text-lg font-serif">Total à payer</span>
                <span className="text-2xl font-bold">{subtotal} MAD</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-gold/20 flex space-x-4 items-start">
              <ShoppingBag size={20} className="text-gold mt-1 flex-shrink-0" />
              <div className="text-[10px] uppercase tracking-widest text-dark/60 leading-relaxed">
                <p className="font-bold text-gold mb-1">Paiement Cash à la Livraison</p>
                <p>Vous ne payez que lorsque vous recevez votre commande chez vous.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
