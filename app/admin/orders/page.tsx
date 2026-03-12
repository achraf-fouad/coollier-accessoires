'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Phone, MapPin, Package, Calendar, User, CheckCircle, XCircle, Trash2, Clock, RefreshCw, ShoppingCart } from 'lucide-react';
import { ensureValidImageUrl } from '@/lib/utils';

type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

const STATUS_LABELS: Record<OrderStatus, { fr: string, ar: string }> = {
  pending: { fr: 'En attente', ar: 'قيد الانتظار' },
  confirmed: { fr: 'Confirmée', ar: 'تم التأكيد' },
  cancelled: { fr: 'Annulée', ar: 'ملغاة' },
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusColMissing, setStatusColMissing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      // Detect if status column exists
      if (data.length > 0 && !('status' in data[0])) {
        setStatusColMissing(true);
      }
    }
    if (error) console.error('fetchOrders error:', error);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('status')) {
        setStatusColMissing(true);
      }
      alert('Erreur: ' + error.message);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
    setUpdatingId(null);
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Supprimer cette commande définitivement ?')) return;
    setUpdatingId(orderId);
    // Delete items first (FK constraint)
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      alert('Erreur suppression: ' + error.message);
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
    setUpdatingId(null);
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.id.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (order.status || 'pending') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const copyToWhatsApp = (order: any) => {
    const addressParts = order.address.split(' | ');
    const mainAddress = addressParts[0];
    const details = addressParts.slice(1).join('\n');

    const text = `*COMMANDE COOLLIER*\n` +
      `--------------------------\n` +
      `👤 *Client:* ${order.customer_name}\n` +
      `📞 *Tél:* ${order.phone}\n` +
      `📍 *Ville:* ${order.city}\n` +
      `🏠 *Adresse:* ${mainAddress}\n` +
      `--------------------------\n` +
      `📦 *Détails:*\n` + 
      details + 
      `\n--------------------------\n` +
      `💰 *Total:* ${order.total_price} MAD\n` +
      `🎁 *Pack Cadeau:* ${order.gift_pack ? 'OUI' : 'NON'}`;
    
    navigator.clipboard.writeText(text);
    alert('Infos copiées pour WhatsApp !');
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Commandes</h1>
          <p className="text-dark/50 mt-1">Gérez et confirmez les commandes clients.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Actualiser</span>
        </button>
      </header>

      {/* SQL Migration Notice */}
      {statusColMissing && (
        <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Colonne <code>status</code> manquante dans Supabase</p>
            <p className="text-amber-700 text-xs mt-1 mb-3">Pour activer Confirmer/Annuler, exécutez ce SQL dans <a href="https://supabase.com/dashboard/project/unjqjraxdxsbgfryfnzn/sql/new" target="_blank" rel="noopener noreferrer" className="underline font-bold">Supabase → SQL Editor</a> :</p>
            <pre className="bg-amber-100 text-amber-900 text-xs p-3 rounded-xl font-mono whitespace-pre-wrap">{`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';\nALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;`}</pre>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <input 
            type="text"
            placeholder="Rechercher par nom, téléphone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-accent-purple transition-all font-sans text-sm"
          />
          <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/20" size={20} />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-accent-purple font-black text-xs uppercase tracking-widest cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-dark/40">Chargement des commandes…</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const status: OrderStatus = order.status || 'pending';
            const isUpdating = updatingId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <User size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" dir="auto">{order.customer_name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-dark/40 font-bold uppercase tracking-widest mt-1">
                        <span className="flex items-center space-x-1">
                          <Phone size={12} />
                          <span>{order.phone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{formatDateTime(order.created_at)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-xs font-bold border flex flex-col items-center ${STATUS_COLORS[status]}`}>
                      <span>{STATUS_LABELS[status].fr}</span>
                      <span className="text-[10px] opacity-70 font-arabic leading-none">{STATUS_LABELS[status].ar}</span>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-dark/40 font-bold mb-1">Total</p>
                      <p className="text-2xl font-bold text-gold">{order.total_price} MAD</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-dark/40 flex items-center space-x-2">
                      <MapPin size={14} />
                      <span>Adresse de livraison</span>
                    </h4>
                    <div className="p-4 bg-beige/5 border border-beige/20 rounded-xl space-y-3">
                      <div>
                        <p className="font-bold text-base mb-1" dir="auto">{order.city}</p>
                        <p className="text-dark/70 leading-relaxed text-sm" dir="auto">
                          {order.address.split(' | ')[0]}
                        </p>
                      </div>
                      
                      {/* Parsed Details from Address Workaround */}
                      {order.address.includes(' | ') && (
                        <div className="pt-3 border-t border-beige/20 space-y-2">
                          {order.address.split(' | ').slice(1).map((detail: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <Package size={14} className="text-accent-purple mt-0.5 flex-shrink-0" />
                              <span className="font-black text-accent-purple uppercase tracking-tight">{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {order.gift_pack && (
                      <div className="px-4 py-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center space-x-3">
                        <Package size={18} />
                        <span className="text-sm font-bold uppercase tracking-widest">Emballage Cadeau Inclus</span>
                      </div>
                    )}

                    {/* Notes logic removed as column doesn't exist */}
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-dark/40 mb-4 flex items-center space-x-2">
                      <Package size={14} />
                      <span>Articles commandés</span>
                    </h4>
                    <div className="space-y-3">
                      {order.order_items?.length > 0 ? order.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-12 bg-gray-50 rounded overflow-hidden relative border border-gray-100 flex-shrink-0">
                              <img src={ensureValidImageUrl(item.products?.image)} alt="" className="object-cover w-full h-full" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{item.products?.name || 'Produit inconnu'}</p>
                              <p className="text-xs text-dark/40 uppercase tracking-widest">Qté: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm tracking-widest">{item.price} MAD</p>
                        </div>
                      )) : (
                        <p className="text-sm text-dark/40 italic">Aucun article enregistré.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
                  <button 
                    onClick={() => copyToWhatsApp(order)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 text-dark rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={16} className="text-green-500" />
                    <span>Copier WhatsApp</span>
                  </button>
                  <div className="h-6 w-px bg-gray-200 mx-2" />
                  {status !== 'confirmed' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, 'confirmed')}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      <span>Confirmer</span>
                    </button>
                  )}
                  {status !== 'cancelled' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      <span>Annuler</span>
                    </button>
                  )}
                  {status !== 'pending' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, 'pending')}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <Clock size={16} />
                      <span>Remettre en attente</span>
                    </button>
                  )}
                  <button
                    disabled={isUpdating}
                    onClick={() => deleteOrder(order.id)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
          <ShoppingCartIcon size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-dark/40 italic font-serif text-xl">Aucune commande enregistrée pour le moment.</p>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon({ size, className }: { size: number; className?: string }) {
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
