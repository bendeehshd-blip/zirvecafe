import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaiterCallsView({ calls, setCalls }: { calls: any[], setCalls: any }) {
  
  const completeCall = async (id: number) => {
    try {
      const res = await fetch(`/api/waiter-calls/${id}/complete`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (res.ok) {
        setCalls(calls.filter(c => c.id !== id));
        toast.success('Çağrı tamamlandı');
      } else {
        toast.error('Tamamlanamadı');
      }
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-amber-500 flex items-center gap-3">
          Garson Çağrıları
          {calls.length > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
              {calls.length} Yeni
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {calls.map(call => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 text-red-500/10">
                <Bell size={120} />
              </div>
              
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Bell size={32} />
              </div>
              
              <h3 className="text-3xl font-bold text-stone-100 mb-2">Masa {call.table_number}</h3>
              
              <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
                <Clock size={14} />
                {new Date(call.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>

              <button 
                onClick={() => completeCall(call.id)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors z-10"
              >
                <Check size={18} />
                Servis Tamamlandı
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {calls.length === 0 && (
          <div className="col-span-full py-24 text-center text-stone-500 border border-dashed border-stone-800 rounded-3xl flex flex-col items-center justify-center">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>Bekleyen garson çağrısı yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
