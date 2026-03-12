'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Phone, MapPin, Package, Calendar, User } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold">Commandes</h1>
        <p className="text-dark/50">Suivez et gérez les commandes clients.</p>
      </header>

      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg border border-gray-100">
                  <User size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-bold">{order.customer_name}</h3>
                  <div className="flex items-center space-x-4 text-xs text-dark/40 font-bold uppercase tracking-widest mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone size={12} />
                      <span>{order.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-dark/40 font-bold mb-1">Total</p>
                <p className="text-2xl font-bold text-gold">{order.total_price} MAD</p>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Shipping Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-dark/40 mb-4 flex items-center space-x-2">
                    <MapPin size={14} />
                    <span>Adresse de livraison</span>
                  </h4>
                  <div className="p-5 bg-beige/5 border border-beige/20 rounded-xl">
                    <p className="font-bold text-lg mb-1">{order.city}</p>
                    <p className="text-dark/70 leading-relaxed">{order.address}</p>
                  </div>
                </div>
                
                {order.gift_pack && (
                  <div className="px-4 py-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center space-x-3">
                    <Package size={18} />
                    <span className="text-sm font-bold uppercase tracking-widest">Emballage Cadeau Inclus</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-dark/40 mb-4 flex items-center space-x-2">
                  <Package size={14} />
                  <span>Articles commandés</span>
                </h4>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-12 bg-gray-50 rounded overflow-hidden relative border border-gray-100">
                          {item.products?.image && (
                            <img src={item.products.image} alt="" className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.products?.name || 'Produit inconnu'}</p>
                          <p className="text-xs text-dark/40 uppercase tracking-widest">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm tracking-widest">{item.price} MAD</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
            <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-dark/40 italic font-serif text-xl">Aucune commande enregistrée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
