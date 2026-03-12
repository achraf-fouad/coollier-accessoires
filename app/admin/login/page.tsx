'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message || 'Identifiants invalides');
      setLoading(false);
    } else {
      if (isSignUp) {
        alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setIsSignUp(false);
        setLoading(false);
      } else {
        router.push('/admin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-dark text-white text-center">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/30">
            <Lock className="text-gold" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">{isSignUp ? 'Créer un accès' : 'Espace Admin'}</h1>
          <p className="text-white/60 text-sm mt-2 font-medium uppercase tracking-widest">Coollier Accessories</p>
        </div>
        
        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-dark/40 tracking-widest">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-gold transition-colors"
              placeholder="admin@coollier.ma"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-dark/40 tracking-widest">Mot de passe</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-5 bg-dark text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <span>{isSignUp ? 'S\'inscrire' : 'Se connecter'}</span>}
          </button>

          <div className="text-center pt-4">
             <button 
               type="button" 
               onClick={() => setIsSignUp(!isSignUp)}
               className="text-xs text-dark/40 hover:text-gold uppercase tracking-widest"
             >
               {isSignUp ? 'Déjà un compte ? Se connecter' : 'Créer le compte administrateur'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
