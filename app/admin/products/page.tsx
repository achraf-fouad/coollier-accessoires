'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Upload, X, Loader2, Image as ImageIcon, Package } from 'lucide-react';
import Image from 'next/image';
import { ensureValidImageUrl } from '@/lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 150,
    category: 'bracelets',
    stock: 50,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Dynamic Bundles & Variants
  const [bundles, setBundles] = useState<any[]>([
    { name: '1 PIÈCE', items_count: 1, price: 150, badge: 'ESSENTIAL', is_hot: false },
    { name: '2 PIÈCES', items_count: 2, price: 250, badge: 'VELOORA PACK', is_hot: true },
    { name: '3 PIÈCES', items_count: 3, price: 350, badge: 'ULTIMATE TRIO', is_hot: false },
  ]);
  const [variants, setVariants] = useState<string[]>(['Modèle Standard']);
  
  // Multiple images state
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '']);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  const handleUploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload all new files
      const finalUrls = [...imageUrls];
      for (let i = 0; i < 3; i++) {
        if (imageFiles[i]) {
          try {
            finalUrls[i] = await handleUploadImage(imageFiles[i]!);
          } catch (uploadErr: any) {
            alert("Erreur Upload (Image " + (i+1) + ") : " + (uploadErr.message || JSON.stringify(uploadErr)));
            setLoading(false);
            return;
          }
        }
      }

      // Check if image is at least present
      if (!finalUrls[0]) finalUrls[0] = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800';

      const productBody = { 
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        image: finalUrls[0],
        metadata: { 
          images: finalUrls,
          bundles: bundles,
          variants: variants 
        } 
      };

      let error;
      if (editingId) {
        const { error: err } = await supabase.from('products').update(productBody).eq('id', editingId);
        error = err;
      } else {
        const { error: err } = await supabase.from('products').insert([productBody]);
        error = err;
      }

      if (error) {
        alert("Erreur Base de données : " + error.message);
        setLoading(false);
        return;
      }

      setIsAddModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert('Erreur inattendue : ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    setImageUrls(product.metadata?.images || [product.image, '', '']);
    setBundles(product.metadata?.bundles || [
      { name: '1 PIÈCE', items_count: 1, price: 150, badge: 'ESSENTIAL', is_hot: false }
    ]);
    setVariants(product.metadata?.variants || ['Modèle Standard']);
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 150, category: 'bracelets', stock: 50 });
    setEditingId(null);
    setImageFiles([null, null, null]);
    setImageUrls(['', '', '']);
    setBundles([
      { name: '1 PIÈCE', items_count: 1, price: 150, badge: 'ESSENTIAL', is_hot: false },
      { name: '2 PIÈCES', items_count: 2, price: 250, badge: 'VELOORA PACK', is_hot: true },
    ]);
    setVariants(['Modèle Standard']);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center font-sans">
        <div>
          <h1 className="text-4xl font-serif font-black tracking-tight text-dark">Gestion Catalogue</h1>
          <p className="text-dark/40 text-sm font-medium uppercase tracking-[0.2em] mt-1">Éditez vos bijoux "Veloora Style"</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-3 px-8 py-4 bg-accent-purple text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent-purple/20 uppercase tracking-widest text-xs"
        >
          <Plus size={20} />
          <span>Nouveau Bijou</span>
        </button>
      </header>

      {/* Product List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-dark/5 overflow-hidden font-sans">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] uppercase tracking-[0.3em] text-dark/40 font-black">
            <tr>
              <th className="px-8 py-6">Vignette</th>
              <th className="px-8 py-6">Produit</th>
              <th className="px-8 py-6">Catégorie</th>
              <th className="px-8 py-6">Prix</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-accent-purple/[0.02] transition-colors group text-sm">
                <td className="px-8 py-4">
                  <div className="relative w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                    <Image src={ensureValidImageUrl(p.image)} alt={p.name} fill className="object-cover" />
                  </div>
                </td>
                <td className="px-8 py-4">
                  <p className="font-black text-dark uppercase tracking-tight">{p.name}</p>
                  <p className="text-xs text-dark/30 font-medium mt-1 truncate max-w-[200px]">{p.description}</p>
                </td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 bg-beige text-gold text-[10px] font-black rounded-full uppercase tracking-widest border border-gold/10">
                    {p.category}
                  </span>
                </td>
                <td className="px-8 py-4 font-black text-accent-purple">{p.price} MAD</td>
                <td className="px-8 py-4">
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => handleEdit(p)} className="p-3 text-dark/20 hover:text-accent-purple hover:bg-accent-purple/5 rounded-xl transition-all"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-3 text-dark/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Package className="text-dark/10" size={40} />
            </div>
            <p className="text-dark/30 font-bold uppercase tracking-widest text-xs">Votre catalogue est vide</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h2 className="text-3xl font-serif font-black tracking-tight">{editingId ? 'Modifier le Bijou' : 'Ajouter un Bijou'}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em] ml-1">Nom du produit</label>
                  <input 
                    required type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="ex: Tulip Bracelets Platinum"
                    className="w-full p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em] ml-1">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="bracelets">Bracelets</option>
                    <option value="collier">Colliers</option>
                    <option value="bagues">Bagues</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em] ml-1">Prix de Vente (MAD)</label>
                  <input 
                    required type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold text-accent-purple"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em] ml-1">Stock Initial</label>
                  <input 
                    required type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em] ml-1">Description Marketing</label>
                <textarea 
                  required rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez l'élégance de ce bijou..."
                  className="w-full p-6 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-accent-purple transition-all font-bold resize-none leading-relaxed"
                />
              </div>

              {/* Multiple Images Upload */}
              <div className="space-y-5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] uppercase font-black text-dark/40 tracking-[0.2em]">Galerie Photos (Min 3 Recommandé)</label>
                  <span className="text-[9px] font-black text-accent-purple bg-accent-purple/10 px-3 py-1 rounded-full uppercase tracking-tighter">Style Veloora Ready</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((idx) => (
                    <label 
                      key={idx}
                      className="group relative aspect-[3/4] border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-accent-purple hover:bg-accent-purple/[0.02] transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                      {imageFiles[idx] || imageUrls[idx] ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={imageFiles[idx] ? URL.createObjectURL(imageFiles[idx]!) : ensureValidImageUrl(imageUrls[idx])} 
                            alt={`Preview ${idx + 1}`} 
                            fill 
                            className="object-cover" 
                          />
                          <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3 p-4">
                          <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-accent-purple/10 transition-colors">
                            <ImageIcon size={24} className="text-gray-400 group-hover:text-accent-purple transition-colors" />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-dark/30 text-center">
                            {idx === 0 ? 'Image Principale' : `Vue #${idx + 1}`}
                          </p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          const nextFiles = [...imageFiles];
                          nextFiles[idx] = file;
                          setImageFiles(nextFiles);
                        }} 
                      />
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-dark/30 italic text-center font-medium">Les images seront optimisées automatiquement pour le chargement rapide.</p>
              </div>

              {/* Dynamic Packs / Bundles */}
              <div className="space-y-6 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-dark">Gestion des Packs (Bundles)</h3>
                  <button 
                    type="button" 
                    onClick={() => setBundles([...bundles, { name: '', items_count: 1, price: 0, badge: '', is_hot: false }])}
                    className="text-[10px] font-black text-accent-purple uppercase tracking-widest border-b-2 border-accent-purple"
                  >
                    + Ajouter un pack
                  </button>
                </div>
                
                <div className="space-y-4">
                  {bundles.map((b, idx) => (
                    <div key={idx} className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-dark/30 ml-1">Nom du pack</label>
                        <input 
                          type="text" value={b.name} 
                          onChange={(e) => {
                            const n = [...bundles];
                            n[idx].name = e.target.value;
                            setBundles(n);
                          }}
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold"
                          placeholder="ex: Starter Pack"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-dark/30 ml-1">Qté Items</label>
                        <input 
                          type="number" value={b.items_count} 
                          onChange={(e) => {
                            const n = [...bundles];
                            n[idx].items_count = Number(e.target.value);
                            setBundles(n);
                          }}
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-dark/30 ml-1">Prix Pack</label>
                        <input 
                          type="number" value={b.price} 
                          onChange={(e) => {
                            const n = [...bundles];
                            n[idx].price = Number(e.target.value);
                            setBundles(n);
                          }}
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-accent-purple"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-dark/30 ml-1">Badge (Optionnel)</label>
                        <input 
                          type="text" value={b.badge} 
                          onChange={(e) => {
                            const n = [...bundles];
                            n[idx].badge = e.target.value;
                            setBundles(n);
                          }}
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold"
                          placeholder="ex: -50% OFF"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" checked={b.is_hot} 
                          onChange={(e) => {
                            const n = [...bundles];
                            n[idx].is_hot = e.target.checked;
                            setBundles(n);
                          }}
                          className="w-4 h-4 accent-accent-purple"
                        />
                        <label className="text-[9px] uppercase font-black text-dark/30">Mettre en avant 🔥</label>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setBundles(bundles.filter((_, i) => i !== idx))}
                        className="p-3 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants Selection */}
              <div className="space-y-6 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-dark">Modèles / Variantes de choix</h3>
                  <button 
                    type="button" 
                    onClick={() => setVariants([...variants, ''])}
                    className="text-[10px] font-black text-accent-purple uppercase tracking-widest border-b-2 border-accent-purple"
                  >
                    + Ajouter un modèle
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <input 
                        type="text" value={v} 
                        onChange={(e) => {
                          const n = [...variants];
                          n[idx] = e.target.value;
                          setVariants(n);
                        }}
                        className="flex-grow p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-bold"
                        placeholder="Nom du modèle (ex: Or Blanc / Pierre Bleue)"
                      />
                      <button 
                        type="button" 
                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={loading}
                  className="w-full py-7 bg-dark text-white font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-accent-purple shadow-2xl shadow-dark/10 hover:shadow-accent-purple/20 transition-all active:scale-95 flex items-center justify-center space-x-4 text-sm"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span>Publier dans le Catalogue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
