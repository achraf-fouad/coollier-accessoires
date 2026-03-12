'use client';

import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If on login page, don't redirect
        if (pathname === '/admin/login') {
          setLoading(false);
          return;
        }
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
        if (pathname === '/admin/login') {
          router.push('/admin');
        }
      }
      setLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  // If we're on login page, just show children without the layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { label: 'Produits', href: '/admin/products', icon: Package },
    { label: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-8 border-b border-white/10">
          <Link href="/admin" className="text-2xl font-serif font-bold tracking-tight text-gold">
            Coollier Admin
          </Link>
        </div>
        
        <nav className="flex-grow p-4 mt-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-gold text-white' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-white/60 hover:text-white transition-colors">
            <Package size={20} />
            <span className="text-sm font-medium">Voir le site</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-10 overflow-auto text-dark min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
