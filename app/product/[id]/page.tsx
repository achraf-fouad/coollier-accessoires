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
import { ArrowLeft, Check, Truck, ShieldCheck, Loader2, Star, Users, Eye, Flame, ShoppingBag, MessageCircle } from 'lucide-react';
import { ensureValidImageUrl } from '@/lib/utils';

// Fallback variants if not defined in metadata
const DEFAULT_VARIANTS = [
  'Modèle Standard'
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useLanguage();
  const { addItem, setGiftPack, isGiftPack } = useCart();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedPackIdx, setSelectedPackIdx] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Choice Mode State
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    quartier: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      else {
        setProduct({
          id,
          name: 'Tulip Bracelets (Premium Edition)',
          description: 'Découvrez la finesse de notre bracelet Tulipe, une pièce d\'exception conçue pour sublimer votre poignet avec une élégance intemporelle. Fabriqué avec une attention méticuleuse aux détails, ce bracelet incarne le luxe moderne.',
          price: 150,
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
          category: 'bracelets',
          metadata: {
            variants: ['Blanc', 'Noir', 'Rouge', 'Bleu'],
            bundles: [
              { name: '1 PIÈCE (ESSENTIAL)', price: 150, items_count: 1, badge: 'OFFRE DE RÉVÉRENCE', is_hot: true },
              { name: '2 PIÈCES', price: 250, items_count: 2 },
            ]
          }
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

  useEffect(() => {
    // Sync variants count with pack selection
    if (!product) return;
    const currentBundles = product.metadata?.bundles || [
      { name: '1 PIÈCE', items_count: 1, price: product.price }
    ];
    const pack = currentBundles[selectedPackIdx] || currentBundles[0];
    const variantsList = product.metadata?.variants || DEFAULT_VARIANTS;
    
    const newVariants = Array(pack.items_count).fill(0).map((_, i) => selectedVariants[i] || variantsList[0]);
    setSelectedVariants(newVariants);
  }, [selectedPackIdx, product]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-2xl">Chargement...</div>;

  // Build gallery images: use multi-upload from metadata, fallback to main image repeated
  const productImages: string[] = (() => {
    const imgs: string[] = product?.metadata?.images?.filter(Boolean) || [];
    if (imgs.length > 0) return imgs.slice(0, 4);
    return [product.image].filter(Boolean);
  })();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const calculateTotalPrice = () => {
    if (!product) return 0;
    const currentBundles = [...(product.metadata?.bundles || [
      { name: '1 PIÈCE', items_count: 1, price: product.price }
    ])];
    
    // Safety: If the first bundle is 1 piece, ensure it uses the product.price
    if (currentBundles[0] && currentBundles[0].items_count === 1) {
      currentBundles[0].price = product.price;
    }

    const pack = currentBundles[selectedPackIdx] || currentBundles[0];
    return Number(pack.price) + (isGiftPack ? 50 : 0);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      const currentBundles = product.metadata?.bundles || [
        { name: '1 PIÈCE', items_count: 1, price: product.price }
      ];
      const pack = currentBundles[selectedPackIdx] || currentBundles[0];
      
      const fullAddress = [
        formData.address,
        formData.quartier ? `(Quartier: ${formData.quartier})` : '',
        `PACK: ${pack.name}`,
        `CHOIX: ${selectedVariants.join(', ')}`
      ].filter(Boolean).join(' | ');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: fullAddress,
          total_price: totalPrice,
          gift_pack: isGiftPack,
        }])
        .select().single();

      if (orderError) throw orderError;

      await supabase.from('order_items').insert([{
        order_id: order.id,
        product_id: product.id,
        quantity: pack.items_count,
        price: pack.price,
      }]);

      router.push('/success');
    } catch (err: any) {
      console.error(err);
      alert('Erreur commande: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setOrderLoading(false);
    }
  };

    const handleAddToCart = () => {
      if (!product) return;
      const currentBundles = [...(product.metadata?.bundles || [
        { name: '1 PIÈCE', items_count: 1, price: product.price }
      ])];

      // Safety: If the first bundle is 1 piece, ensure it uses the product.price
      if (currentBundles[0] && currentBundles[0].items_count === 1) {
        currentBundles[0].price = product.price;
      }
      
      const pack = currentBundles[selectedPackIdx] || currentBundles[0];
      
      // Create a unique ID that includes the variants so different selections are separate items
      const variantKey = selectedVariants.join('-');
      
      addItem({
        id: `${product.id}-${selectedPackIdx}-${variantKey}`,
        name: `${product.name} (${pack.name})`,
        price: pack.price,
        image: ensureValidImageUrl(activeImage || product.image),
        quantity: 1,
        variants: selectedVariants,
      });
    };

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      
      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 font-sans">
          
          {/* Left: Premium Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden shadow-sm shadow-dark/5"
            >
              <Image 
                src={ensureValidImageUrl(activeImage || product.image)} 
                alt={product.name} 
                fill 
                className="object-cover" 
                priority 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <span className="bg-accent-purple text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-accent-purple/30">Most Pop</span>
                <span className="bg-white text-dark text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100 shadow-sm">Hot Product</span>
                <span className="bg-green-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/20">1er qualité au Maroc</span>
              </div>
            </motion.div>
            {/* Thumbnail gallery - shows product images if multiple available */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm border-2 ${
                      (activeImage || product.image) === img ? 'border-accent-purple' : 'border-transparent hover:border-accent-purple/50'
                    }`}
                  >
                    <Image 
                      src={ensureValidImageUrl(img)} 
                      alt="" 
                      fill 
                      className="object-cover" 
                      sizes="(max-width: 768px) 25vw, 10vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Form */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gold">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                <span className="text-sm text-dark/40 font-bold uppercase tracking-widest ml-2">2.4k avis vérifiés</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-serif font-bold tracking-tight text-dark leading-tight">{product.name}</h1>
              <div className="flex items-center space-x-6">
                <span className="text-4xl font-black text-accent-purple tracking-tighter">{product.price} MAD</span>
                <span className="text-2xl text-dark/30 line-through tracking-tighter">299.00 dh</span>
                <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-lg">-50% OFF</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 py-5 border-y border-gray-100 text-dark/60 text-xs font-bold uppercase tracking-[0.2em]">
              <span className="flex items-center space-x-2"><Users size={18} className="text-accent-purple" /> <span>34 personnes consultent</span></span>
              <span className="flex items-center space-x-2"><Eye size={18} className="text-accent-purple" /> <span>2.5k vues aujourd'hui</span></span>
            </div>

            <p className="text-dark/70 leading-relaxed font-light text-lg italic">
              "{product.description}"
            </p>

            {/* Bundle Selection ("Groupez & Économisez") */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-dark flex items-center space-x-3">
                  <Flame size={20} className="text-red-600 animate-bounce" />
                  <span>GROUPEZ & ÉCONOMISEZ</span>
                </h3>
                <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full animate-pulse border border-red-100 uppercase">Offre Limitée</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {(product.metadata?.bundles || [
                  { name: '1 PIÈCE (ESSENTIAL)', price: product.price, items_count: 1, badge: 'OFFRE DE RÉVÉRENCE', hot: true }
                ]).map((pack: any, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedPackIdx(idx)}
                    className={`relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col space-y-4 ${
                      selectedPackIdx === idx ? 'border-accent-purple bg-accent-purple/5 ring-1 ring-accent-purple shadow-xl shadow-accent-purple/10' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedPackIdx === idx ? 'border-accent-purple bg-accent-purple' : 'border-gray-200'}`}>
                          {selectedPackIdx === idx && <Check size={16} className="text-white" />}
                        </div>
                        <div>
                          <p className="font-black text-lg tracking-tight flex items-center space-x-2 uppercase">
                            <span>{pack.name}</span>
                          </p>
                          <p className="text-[10px] text-dark/50 font-bold uppercase tracking-widest mt-1">Qté: {pack.items_count} Articles</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {pack.badge && <span className="block text-[10px] font-black text-red-600 uppercase mb-1">{pack.badge}</span>}
                        <p className={`text-2xl font-black ${selectedPackIdx === idx ? 'text-accent-purple' : 'text-dark/80'}`}>{pack.price} MAD</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedPackIdx === idx && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 mt-4 border-t border-accent-purple/10 space-y-4"
                        >
                          <p className="text-[10px] font-black text-accent-purple uppercase tracking-[0.2em]">Choisissez vos modèles :</p>
                          {Array(pack.items_count).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <label className="text-[9px] uppercase font-black text-dark/30 ml-1">Modèle #{i + 1}</label>
                              <div className="relative group">
                                <select 
                                  value={selectedVariants[i]}
                                  onChange={(e) => {
                                    const next = [...selectedVariants];
                                    next[i] = e.target.value;
                                    setSelectedVariants(next);
                                  }}
                                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-accent-purple text-sm font-bold pr-12 group-hover:border-accent-purple/50 transition-all font-sans"
                                >
                                  {(product.metadata?.variants || DEFAULT_VARIANTS).map((v: string) => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark/30 group-hover:text-accent-purple transition-colors">
                                  <ArrowLeft className="-rotate-90" size={16} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {pack.is_hot && (
                      <span className="absolute -top-3 left-10 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-red-600/20 uppercase tracking-[0.2em]">SÉLECTION VELOORA</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Pack Upsell */}
            <div 
              onClick={() => setGiftPack(!isGiftPack)}
              className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between ${
                isGiftPack ? 'border-green-500 bg-green-50/50' : 'border-gray-200 bg-white hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-beige rounded-2xl overflow-hidden relative border border-gold/20 shadow-sm">
                  <Image 
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200&auto=format&fit=crop" 
                    fill 
                    alt="Gift" 
                    className="object-cover" 
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest flex items-center space-x-2">
                    <span>Ajoutez packaging cadeau 🔥</span>
                  </p>
                  <p className="text-[10px] text-dark/40 italic font-medium">Idéal pour un cadeau inoubliable</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-green-600">+50.00 dh</p>
                <div className={`w-6 h-6 rounded-lg border-2 mt-1 mx-auto flex items-center justify-center transition-all ${isGiftPack ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
                  {isGiftPack && <Check size={14} className="text-white" />}
                </div>
              </div>
            </div>

            {/* Integrated Fast Checkout Form */}
            <div ref={formRef} className="space-y-8 pt-10 border-t border-gray-100 bg-gray-50/30 -mx-4 px-4 py-10 md:mx-0 md:px-0 md:bg-transparent">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-black uppercase tracking-[0.1em] text-dark">LIVRAISON PARTOUT AU MAROC</h2>
                <p className="text-[10px] text-accent-purple font-black uppercase tracking-[0.3em]">Paiement à la réception (Cash on Delivery)</p>
              </div>

              <form onSubmit={handleOrder} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full p-5 pl-14 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold placeholder:text-dark/20 text-sm shadow-sm"
                      placeholder="Votre nom et prénom"
                    />
                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent-purple transition-colors" size={20} />
                  </div>
                  
                  <div className="relative">
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-5 pl-14 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold placeholder:text-dark/20 text-sm shadow-sm"
                      placeholder="Votre numéro de WhatsApp"
                    />
                    <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20" size={20} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold placeholder:text-dark/20 text-sm shadow-sm"
                      placeholder="Ville"
                    />
                    <input
                      required
                      type="text"
                      name="quartier"
                      value={formData.quartier}
                      onChange={(e) => setFormData({...formData, quartier: e.target.value})}
                      className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold placeholder:text-dark/20 text-sm shadow-sm"
                      placeholder="Quartier"
                    />
                  </div>

                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold placeholder:text-dark/20 text-sm shadow-sm resize-none"
                    placeholder="Adresse complète (Appartement, Rue...)"
                  />
                  
                </div>

                <div className="pt-4 space-y-4">
                  <button
                    disabled={orderLoading}
                    className="w-full py-4 md:py-7 bg-accent-purple text-white rounded-3xl font-black uppercase tracking-[0.1em] md:tracking-[0.3em] shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 md:space-x-4 text-base md:text-xl"
                  >
                    {orderLoading ? <Loader2 className="animate-spin" /> : (
                      <div className="flex items-center justify-center space-x-2">
                        <ShoppingBag size={20} className="flex-shrink-0 md:w-6 md:h-6" />
                        <span>COMMANDER MAINTENANT</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-4 md:py-6 bg-white text-accent-purple border-2 border-accent-purple rounded-3xl font-black uppercase tracking-[0.1em] md:tracking-[0.3em] hover:bg-accent-purple hover:text-white transition-all flex items-center justify-center space-x-3 md:space-x-4 text-sm md:text-lg"
                  >
                    <ShoppingBag size={18} className="flex-shrink-0 md:w-5 md:h-5" />
                    <span>AJOUTER AU PANIER</span>
                  </button>

                  <p className="text-center text-[10px] text-dark/40 font-bold mt-4 uppercase tracking-widest">
                    Livraison gratuite + Paiement Cash à la livraison
                  </p>
                </div>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-8">
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-2">
                <Truck className="text-accent-purple" size={32} />
                <p className="text-[10px] font-black uppercase tracking-tight">Livraison Rapide (24h-48h)</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-2">
                <ShieldCheck className="text-accent-purple" size={32} />
                <p className="text-[10px] font-black uppercase tracking-tight">Garantie 1ère Qualité au Maroc</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Direct Purchase Button */}
      <AnimatePresence>
        {isStickyVisible && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 md:hidden flex space-x-3 items-center"
          >
            <button
              onClick={scrollToForm}
              className="flex-grow py-5 bg-accent-purple text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-accent-purple/20 flex items-center justify-center space-x-3 text-sm"
            >
              <ShoppingBag size={18} />
              <span>ACHETER MAINTENANT</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Hub Button */}
      <a 
        href="https://wa.me/212710824761?text=Bonjour Coollier, je souhaite commander le pack: Tulip Bracelets"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group"
      >
        <span className="absolute right-20 bg-white text-dark text-[10px] font-black px-4 py-2 rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest pointer-events-none">Support WhatsApp</span>
        <svg fill="currentColor" width="32" height="32" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>

      <Footer />
    </main>
  );
}
