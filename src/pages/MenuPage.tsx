import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingCart, Plus, Minus, X, CreditCard, Banknote, Receipt } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos'>('pos');
  
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenuItems(data);
        const cats = Array.from(new Set(data.map((item: MenuItem) => item.category))) as string[];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0]);
      });

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on('order_status_updated', (order) => {
      if (order.table_number.toString() === tableNumber) {
        setActiveOrder(order);
        toast.success(`Sipariş Durumu: ${order.status}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tableNumber]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} sepete eklendi`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCallWaiter = async () => {
    if (!tableNumber) {
      toast.error('Masa numarası bulunamadı!');
      return;
    }
    try {
      await fetch('/api/waiter-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber })
      });
      toast.success('Garson çağrıldı, lütfen bekleyin.');
    } catch (err) {
      toast.error('Bir hata oluştu.');
    }
  };

  const submitOrder = async () => {
    if (!tableNumber) {
      toast.error('Masa numarası bulunamadı! Lütfen QR kodu tekrar okutun.');
      return;
    }
    if (cart.length === 0) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: cart,
          totalPrice: cartTotal,
          paymentMethod
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success('Siparişiniz alındı! Garsonumuz yakında masanıza gelecektir.', { duration: 5000 });
        setCart([]);
        setIsCartOpen(false);
        setActiveOrder({ status: 'Order received', total_price: cartTotal });
      }
    } catch (err) {
      toast.error('Sipariş gönderilemedi.');
    }
  };

  if (!tableNumber) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-200 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Masa Bulunamadı</h1>
          <p className="text-stone-400">Lütfen masanızdaki QR kodu okutarak menüye erişin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif font-bold text-amber-500">Zirve Cafe</h1>
            <p className="text-xs text-stone-400">Masa {tableNumber}</p>
          </div>
          <button 
            onClick={handleCallWaiter}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-stone-700"
          >
            <Bell size={16} className="text-amber-500" />
            Garson Çağır
          </button>
        </div>
        
        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar px-4 pb-4 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-amber-500 text-stone-950' 
                  : 'bg-stone-900 text-stone-400 border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Active Order Status */}
      {activeOrder && (
        <div className="mx-4 mt-4 p-4 bg-stone-900 border border-amber-500/30 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-amber-500">Aktif Siparişiniz</h3>
            <span className="text-sm font-bold">{activeOrder.total_price} ₺</span>
          </div>
          <p className="text-xs text-stone-400 mb-3">Siparişiniz alındı! Garsonumuz yakında masanıza gelecektir.</p>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full bg-amber-500 transition-all duration-500 ${
                activeOrder.status === 'Order received' ? 'w-1/4' :
                activeOrder.status === 'Preparing' ? 'w-1/2' :
                activeOrder.status === 'Ready' ? 'w-3/4' :
                activeOrder.status === 'Served' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <span className="text-xs font-medium text-stone-300 w-24 text-right">
              {activeOrder.status === 'Order received' ? 'Alındı' :
               activeOrder.status === 'Preparing' ? 'Hazırlanıyor' :
               activeOrder.status === 'Ready' ? 'Hazır' :
               activeOrder.status === 'Served' ? 'Servis Edildi' : activeOrder.status}
            </span>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <main className="p-4 space-y-6">
        {menuItems.filter(item => item.category === activeCategory).map(item => (
          <div key={item.id} className="flex gap-4 bg-stone-900 p-3 rounded-2xl border border-stone-800">
            <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-800">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="flex flex-col flex-1 justify-between py-1">
              <div>
                <h3 className="font-medium text-stone-100 leading-tight mb-1">{item.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-amber-500">{item.price} ₺</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Sticky Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-amber-500 text-stone-950 py-4 px-6 rounded-2xl font-semibold flex justify-between items-center shadow-[0_10px_40px_rgba(245,158,11,0.3)]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-stone-950/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <span>Sepeti Görüntüle</span>
              </div>
              <span>{cartTotal} ₺</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-stone-900 rounded-t-3xl z-50 max-h-[90vh] flex flex-col border-t border-stone-800"
            >
              <div className="p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-semibold text-stone-100">Sepetiniz</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-stone-400 hover:text-stone-200">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">Sepetiniz boş.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-200">{item.name}</h4>
                        <span className="text-sm text-amber-500">{item.price} ₺</span>
                      </div>
                      <div className="flex items-center gap-3 bg-stone-800 rounded-full p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-200">
                          <Minus size={16} />
                        </button>
                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-200">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {cart.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-800">
                    <h3 className="font-medium text-stone-300 mb-4">Ödeme Yöntemi</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('pos')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === 'pos' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-stone-700 text-stone-400'}`}
                      >
                        <Receipt size={24} className="mb-2" />
                        <span className="text-xs font-medium">Fiziksel POS</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-stone-700 text-stone-400'}`}
                      >
                        <Banknote size={24} className="mb-2" />
                        <span className="text-xs font-medium">Nakit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="p-4 border-t border-stone-800 bg-stone-900 shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-stone-400">Toplam</span>
                    <span className="text-2xl font-bold text-stone-100">{cartTotal} ₺</span>
                  </div>
                  <button 
                    onClick={submitOrder}
                    className="w-full bg-amber-500 text-stone-950 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-colors"
                  >
                    Siparişi Onayla
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
