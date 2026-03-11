import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, QrCode, Download, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

export default function TableManagerView() {
  const [tables, setTables] = useState<any[]>([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) setTables(await res.json());
    } catch (err) {
      toast.error('Masalar yüklenemedi');
    }
  };

  const createTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const num = parseInt(newTableNum);
      if (isNaN(num)) throw new Error('Geçersiz masa numarası');

      const url = `${window.location.origin}/menu?table=${num}`;
      const qrDataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 });

      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ tableNumber: num, qrCodeUrl: qrDataUrl })
      });

      if (res.ok) {
        const newTable = await res.json();
        setTables([...tables, newTable]);
        setNewTableNum('');
        toast.success('Masa oluşturuldu');
      } else {
        toast.error('Masa oluşturulamadı');
      }
    } catch (err: any) {
      toast.error(err.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (id: number) => {
    if (!confirm('Masayı silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        setTables(tables.filter(t => t.id !== id));
        toast.success('Masa silindi');
      } else {
        toast.error('Silinemedi');
      }
    } catch (err) {
      toast.error('Silinemedi');
    }
  };

  const downloadQR = (qrUrl: string, tableNum: number) => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `masa-${tableNum}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = (qrUrl: string, tableNum: number) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Masa ${tableNum} QR Kod</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
              img { width: 300px; height: 300px; }
              h1 { margin-top: 20px; font-size: 24px; }
            </style>
          </head>
          <body>
            <img src="${qrUrl}" />
            <h1>Masa ${tableNum}</h1>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-amber-500">QR Masa Yönetimi</h2>
      </div>

      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl">
        <h3 className="text-lg font-medium text-stone-200 mb-4">Yeni Masa Ekle</h3>
        <form onSubmit={createTable} className="flex gap-4">
          <input
            type="number"
            required
            value={newTableNum}
            onChange={e => setNewTableNum(e.target.value)}
            placeholder="Masa Numarası (örn: 5)"
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            Ekle
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {tables.map(table => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
                <h3 className="text-xl font-bold text-stone-100">Masa {table.table_number}</h3>
                <button 
                  onClick={() => deleteTable(table.id)}
                  className="text-stone-500 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-6 flex-1 flex flex-col items-center justify-center bg-white">
                <img src={table.qr_code_url} alt={`Masa ${table.table_number} QR`} className="w-48 h-48 object-contain" />
              </div>

              <div className="p-4 grid grid-cols-2 gap-2 border-t border-stone-800 bg-stone-950/50">
                <button 
                  onClick={() => downloadQR(table.qr_code_url, table.table_number)}
                  className="flex items-center justify-center gap-2 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  İndir
                </button>
                <button 
                  onClick={() => printQR(table.qr_code_url, table.table_number)}
                  className="flex items-center justify-center gap-2 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium"
                >
                  <Printer size={16} />
                  Yazdır
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tables.length === 0 && (
          <div className="col-span-full py-24 text-center text-stone-500 border border-dashed border-stone-800 rounded-3xl flex flex-col items-center justify-center">
            <QrCode size={48} className="mb-4 opacity-20" />
            <p>Henüz masa eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}
