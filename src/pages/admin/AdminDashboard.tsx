import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LayoutDashboard, QrCode, Bell, UtensilsCrossed, LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

import OrdersView from './views/OrdersView';
import WaiterCallsView from './views/WaiterCallsView';
import TableManagerView from './views/TableManagerView';
import MenuEditorView from './views/MenuEditorView';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Real-time state
  const [orders, setOrders] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Initial fetch
    fetchData(token);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Socket connection
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`Yeni Sipariş: Masa ${order.table_number}`);
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Sipariş', {
          body: `Masa ${order.table_number} yeni bir sipariş verdi.`,
          icon: '/favicon.ico'
        });
      }

      // Play sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
      navigate('/admin');
    });

    socket.on('waiter_called', (call) => {
      setWaiterCalls(prev => [call, ...prev]);
      toast.error(`Garson Çağrısı: Masa ${call.table_number}`, { icon: '🔔' });
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Garson Çağrısı', {
          body: `Masa ${call.table_number} garson çağırıyor.`,
          icon: '/favicon.ico'
        });
      }

      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
      navigate('/admin/waiter-calls');
    });

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const fetchData = async (token: string) => {
    try {
      const [ordersRes, callsRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/waiter-calls', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (ordersRes.status === 401 || callsRes.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (callsRes.ok) setWaiterCalls(await callsRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Gelen Siparişler', icon: LayoutDashboard },
    { path: '/admin/waiter-calls', label: 'Garson Çağrıları', icon: Bell, badge: waiterCalls.length },
    { path: '/admin/tables', label: 'QR Masa Yönetimi', icon: QrCode },
    { path: '/admin/menu', label: 'Menü Yönetimi', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-xl font-serif font-bold text-amber-500 hover:text-amber-400 transition-colors">Zirve Admin</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 border-r border-stone-800 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <Link to="/" className="block group">
            <h1 className="text-2xl font-serif font-bold text-amber-500 group-hover:text-amber-400 transition-colors">Zirve Cafe</h1>
            <p className="text-xs text-stone-500 mt-1 group-hover:text-stone-400 transition-colors">Yönetim Paneli</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<OrdersView orders={orders} setOrders={setOrders} />} />
          <Route path="/waiter-calls" element={<WaiterCallsView calls={waiterCalls} setCalls={setWaiterCalls} />} />
          <Route path="/tables" element={<TableManagerView />} />
          <Route path="/menu" element={<MenuEditorView />} />
        </Routes>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
