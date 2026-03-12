'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Package, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSales: number;
    totalProducts: number;
    recentOrders: any[];
  }>({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    recentOrders: [],
  });

  useEffect(() => {
    async function fetchStats() {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: products } = await supabase.from('products').select('*');
      
      const totalSales = orders?.reduce((acc, o) => acc + (o.total_price || 0), 0) || 0;
      
      setStats({
        totalOrders: orders?.length || 0,
        totalSales: totalSales,
        totalProducts: products?.length || 0,
        recentOrders: orders?.slice(0, 5) || [],
      });
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Ventes Totales', value: `${stats.totalSales} MAD`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Commandes', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Produits', value: stats.totalProducts, icon: Package, color: 'text-gold' },
    { label: 'Clients', value: stats.totalOrders, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-serif font-bold">Tableau de bord</h1>
        <p className="text-dark/50">Bienvenue dans votre gestion administrative.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-dark/40 font-bold">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-serif font-bold">Dernières commandes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-dark/40">
              <tr>
                <th className="px-6 py-4 font-bold">Client</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Pack Cadeau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.length > 0 ? stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-xs text-dark/40">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-bold">{order.total_price} MAD</td>
                  <td className="px-6 py-4">
                    {order.gift_pack ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-widest">Oui</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-widest">Non</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-dark/30 italic">Aucune commande pour le moment</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
