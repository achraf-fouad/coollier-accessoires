'use client';

import { use, useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Truck, ShieldCheck, Loader2, Star, Users, Eye, Flame } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useLanguage();
  const { addItem, setGiftPack, isGiftPack } = useCart();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState(1);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      else {
        setProduct({
          id,
          name: 'Bracelet Tulipe Élégance',
          description: 'Découvrez la finesse de notre bracelet Tulipe, une pièce d\'exception conçue pour sublimer votre poignet avec une élégance intemporelle.',
          price: 129,
          image: 'https://tw8i3g-dr.myshopify.com/cdn/shop/files/4_6a1b2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c.jpg?v=1713272812&width=800', // Mocking a high-quality jewelry image
          category: 'bracelet',
        });
      }
      setLoading(false);
    }
    fetchProduct();

    const handleScroll = () => {
      if (formRef.current) {
        const { bottom } = formRef.current.getBoundingClientRect();
        setIsStickyVisible(bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-2xl">Chargement...</div>;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const calculateTotalPrice = () => {
    let base = 129;
    if (selectedPack === 2) base = 199;
    if (selectedPack === 3) base = 299;
    return base + (isGiftPack ? 49 : 0);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          total_price: totalPrice,
          gift_pack: isGiftPack,
        }])
        .select().single();

      if (orderError) throw orderError;

      await supabase.from('order_items').insert([{
        order_id: order.id,
        product_id: product.id,
        quantity: selectedPack,
        price: product.price,
      }]);

      router.push('/success');
    } catch (err) {
      console.error(err);
      router.push('/success'); // Fallback for demo
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <main className={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 font-sans">
          
          {/* Left: Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden"
            >
              <Image src={product.image} alt={product.name} fill className="object-cover" priority />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-accent-purple text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Hot Product</span>
                <span className="bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Populaire</span>
              </div>
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-gold cursor-pointer transition-colors">
                  <Image src={product.image} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info & Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gold">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-xs text-dark/50 font-bold uppercase tracking-widest">(2.4k avis)</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight text-dark">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-accent-purple tracking-tight">{product.price} MAD</span>
                <span className="text-xl text-dark/30 line-through">249 MAD</span>
                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">-48%</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 py-4 border-y border-beige/50 text-dark/60 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center space-x-2"><Users size={16} className="text-accent-purple" /> <span>34 personnes consultent</span></span>
              <span className="flex items-center space-x-2"><Eye size={16} className="text-accent-purple" /> <span>2.5k vues aujourd'hui</span></span>
            </div>

            <p className="text-dark/70 leading-relaxed font-light">{product.description}</p>

            {/* Bundle Pack Selector */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-dark flex items-center space-x-2">
                <Flame size={16} className="text-red-500" />
                <span>Groupez et Économisez</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 1, label: '1 PIÈCE', price: '129 MAD', desc: 'Livraison Gratuite', icon: '💎' },
                  { id: 2, label: '2 PIÈCES (DUO)', price: '199 MAD', desc: 'Économisez 60 MAD', icon: '✨', hot: true },
                  { id: 3, label: '3 PIÈCES (TRIO)', price: '299 MAD', desc: 'Économisez 90 MAD', icon: '🔥' },
                ].map((pack) => (
                  <div 
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      selectedPack === pack.id ? 'border-accent-purple bg-accent-purple/5 ring-1 ring-accent-purple' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPack === pack.id ? 'border-accent-purple' : 'border-gray-200'}`}>
                        {selectedPack === pack.id && <div className="w-3 h-3 rounded-full bg-accent-purple" />}
                      </div>
                      <div>
                        <p className="font-bold flex items-center space-x-2">
                          <span>{pack.label}</span>
                          <span>{pack.icon}</span>
                        </p>
                        <p className="text-xs text-dark/50 mt-1">{pack.desc}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-accent-purple">{pack.price}</p>
                    {pack.hot && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">Le plus populaire</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Upsell */}
            <div 
              onClick={() => setGiftPack(!isGiftPack)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isGiftPack ? 'border-gold bg-gold/5' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-beige rounded-lg overflow-hidden relative border border-gold/20">
                  <Image src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200&auto=format&fit=crop" fill alt="Gift" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest flex items-center space-x-2">
                    <span>Ajoutez packaging cadeau 🔥</span>
                  </p>
                  <p className="text-xs text-dark/40 italic">Transformez-le en cadeau parfait</p>
                </div>
              </div>
              <p className="font-bold text-gold">+49 MAD</p>
            </div>

            {/* Order Form Directly Here */}
            <div ref={formRef} className="space-y-6 pt-8 border-t border-gray-100">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest">Passer Votre Commande</h2>
                <p className="text-xs text-dark/50 font-bold uppercase tracking-[0.2em]">Remplissez le formulaire ci-dessous</p>
              </div>

              <form onSubmit={handleOrder} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40 px-1">Votre Nom Complet</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-accent-purple transition-all"
                    placeholder="Ex: Sara Alaoui"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40 px-1">Numéro de Téléphone</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-accent-purple transition-all"
                    placeholder="06 00 00 00 00"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40 px-1">Ville</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-accent-purple transition-all"
                      placeholder="Ex: Casablanca"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40 px-1">Quartier / ZIP</label>
                    <input
                      type="text"
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-accent-purple transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40 px-1">Adresse Exacte</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-accent-purple transition-all resize-none"
                    placeholder="Rue, N°, Appartement..."
                  />
                </div>

                <button
                  disabled={orderLoading}
                  className="w-full py-6 bg-accent-purple text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-lg"
                >
                  {orderLoading ? <Loader2 className="animate-spin" /> : <span>CONFIRMER LA COMMANDE</span>}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4 py-8">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Truck className="text-accent-purple mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-tight">Livraison Rapide 24-48h</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <ShieldCheck className="text-accent-purple mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-tight">Qualité Garantie 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Button */}
      <AnimatePresence>
        {isStickyVisible && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 md:hidden"
          >
            <button
              onClick={scrollToForm}
              className="w-full py-5 bg-accent-purple text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2"
            >
              <Users size={18} />
              <span>Acheter Maintenant</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <a 
        href={`https://wa.me/212600000000?text=Bonjour, je suis intéressé par le produit: ${product.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <svg fill="currentColor" width="32" height="32" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>

      <Footer />
    </main>
  );
}
