import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Upload, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuEditorView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      toast.error('Menü yüklenemedi');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCategory('');
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setCategory(item.category);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setImagePreview(item.image_url || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingId ? `/api/menu/${editingId}` : '/api/menu';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (editingId) {
          setItems(items.map(i => i.id === editingId ? savedItem : i));
          toast.success('Ürün güncellendi');
        } else {
          setItems([...items, savedItem]);
          toast.success('Ürün eklendi');
        }
        resetForm();
      } else {
        toast.error(editingId ? 'Ürün güncellenemedi' : 'Ürün eklenemedi');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
        toast.success('Ürün silindi');
      } else {
        toast.error('Silinemedi');
      }
    } catch (err) {
      toast.error('Silinemedi');
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-amber-500">Menü Yönetimi</h2>
      </div>

      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl relative">
        {editingId && (
          <button 
            onClick={resetForm}
            className="absolute top-6 right-6 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X size={24} />
          </button>
        )}
        <h3 className="text-lg font-medium text-stone-200 mb-6">
          {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </h3>
        <form onSubmit={saveItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Kategori</label>
              <input
                type="text"
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Örn: Hamburgerler"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500"
                list="category-list"
              />
              <datalist id="category-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Ürün Adı</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Fiyat (₺)</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Açıklama</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500 h-24 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-stone-400 mb-1">Ürün Görseli</label>
            <div 
              className="border-2 border-dashed border-stone-800 rounded-2xl h-64 flex flex-col items-center justify-center relative overflow-hidden bg-stone-950/50 hover:bg-stone-950 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-stone-500">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">Görsel Yüklemek İçin Tıklayın</p>
                  <p className="text-xs mt-1 opacity-70">PNG, JPG, WEBP</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
              {editingId ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-serif font-bold text-stone-200">Mevcut Ürünler</h3>
        
        {categories.map(cat => (
          <div key={cat} className="space-y-4">
            <h4 className="text-lg font-medium text-amber-500 border-b border-stone-800 pb-2">{cat}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.filter(i => i.category === cat).map(item => (
                <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-stone-200 truncate pr-2">{item.name}</h5>
                      <span className="text-amber-500 font-bold shrink-0">{item.price} ₺</span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        Düzenle
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
