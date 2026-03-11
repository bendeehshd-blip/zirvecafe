import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, Utensils, CreditCard, Banknote, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersView({ orders, setOrders }: { orders: any[], setOrders: any }) {
  const [filter, setFilter] = useState('active');

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        toast.success('Durum güncellendi');
      } else {
        toast.error('Güncellenemedi');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return o.status !== 'Served';
    if (filter === 'completed') return o.status === 'Served';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order received': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Preparing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Ready': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Served': return 'bg-stone-800 text-stone-500 border-stone-700';
      default: return 'bg-stone-800 text-stone-400 border-stone-700';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'pos': return <Receipt size={16} className="text-amber-400" />;
      case 'cash': return <Banknote size={16} className="text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-amber-500">Gelen Siparişler</h2>
        <div className="flex gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Aktif
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-stone-800 text-stone-200' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Tamamlanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredOrders.map(order => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-stone-800 flex justify-between items-start bg-stone-950/50">
                <div>
                  <h3 className="text-xl font-bold text-stone-100">Masa {order.table_number}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status === 'Order received' ? 'Yeni' :
                   order.status === 'Preparing' ? 'Hazırlanıyor' :
                   order.status === 'Ready' ? 'Hazır' : 'Servis Edildi'}
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-bold text-amber-500">{item.quantity}x</span>
                        <span className="text-stone-300">{item.name}</span>
                      </div>
                      <span className="text-stone-500">{item.price * item.quantity} ₺</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-stone-800 bg-stone-950/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-400">
                    {getPaymentIcon(order.payment_method)}
                    <span className="capitalize">{order.payment_method === 'pos' ? 'Fiziksel POS' : 'Nakit'}</span>
                  </div>
                  <span className="text-lg font-bold text-stone-100">{order.total_price} ₺</span>
                </div>

                {order.status !== 'Served' && (
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => updateStatus(order.id, 'Preparing')}
                      disabled={order.status === 'Preparing' || order.status === 'Ready'}
                      className="flex flex-col items-center justify-center py-2 bg-stone-800 hover:bg-amber-500/20 hover:text-amber-500 text-stone-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <ChefHat size={18} className="mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Hazırla</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'Ready')}
                      disabled={order.status === 'Ready' || order.status === 'Order received'}
                      className="flex flex-col items-center justify-center py-2 bg-stone-800 hover:bg-emerald-500/20 hover:text-emerald-500 text-stone-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Utensils size={18} className="mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Hazır</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'Served')}
                      disabled={order.status !== 'Ready'}
                      className="flex flex-col items-center justify-center py-2 bg-stone-800 hover:bg-blue-500/20 hover:text-blue-500 text-stone-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} className="mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Servis</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 border border-dashed border-stone-800 rounded-3xl">
            Sipariş bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
