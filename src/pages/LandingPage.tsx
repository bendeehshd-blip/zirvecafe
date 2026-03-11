import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Star, Coffee, Utensils, Wind, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Zirve Cafe",
    "image": "https://picsum.photos/seed/zirvecafe/1200/800",
    "description": "Keyifli Sohbetlerin ve Lezzetin Zirvesi. Hamburger, tost, ızgara, çay ve nargile keyfi.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Çubuklu, Polatlı Sk No:21",
      "addressLocality": "Beykoz",
      "addressRegion": "İstanbul",
      "postalCode": "34805",
      "addressCountry": "TR"
    },
    "telephone": "05368955316",
    "servesCuisine": "Turkish, Fast Food, Cafe",
    "openingHours": "Mo-Su 10:00-02:00"
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30">
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-end max-w-7xl mx-auto">
        <Link 
          to="/admin/login" 
          className="flex items-center gap-2 text-stone-300 hover:text-amber-500 bg-stone-950/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800 transition-colors text-sm font-medium"
        >
          <Lock size={16} />
          Yönetici Girişi
        </Link>
      </div>

      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Zirve Cafe Interior" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter text-amber-50 mb-6 font-serif"
          >
            Zirve Cafe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl text-amber-200/80 font-light tracking-wide mb-10"
          >
            "Keyifli Sohbetlerin ve Lezzetin Zirvesi"
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to="/menu?table=demo" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-stone-950 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              Menüyü İncele
            </Link>
          </motion.div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6 text-amber-50">Hakkımızda</h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-6">
              Beykoz'un kalbinde, sıcak ve samimi bir atmosferde misafirlerimizi ağırlıyoruz. 
              Zirve Cafe, sadece bir kafe değil, dostlarınızla keyifli vakit geçirebileceğiniz, 
              lezzetli yemekler yiyip, en iyi nargile tütünlerini deneyimleyebileceğiniz bir sosyal yaşam alanıdır.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-900 rounded-2xl text-amber-500">
                  <Coffee size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200">Sıcak Ortam</h3>
                  <p className="text-sm text-stone-500">Dost meclisleri için</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-900 rounded-2xl text-amber-500">
                  <Wind size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200">Premium Nargile</h3>
                  <p className="text-sm text-stone-500">Özel karışımlar</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <img 
                src="/2022-06-21.webp" 
                alt="Zirve Cafe Ortam" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
              </div>
              <p className="text-stone-300 font-medium">"Beykoz'un en iyi mekanı"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-24 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4 text-amber-50">Popüler Lezzetler</h2>
            <p className="text-stone-400">Misafirlerimizin en çok tercih ettiği ürünler</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Zirve Burger', desc: 'Özel soslu, çift katlı dana köfte', img: 'hamburger', price: '280 ₺' },
              { name: 'Karışık Tost', desc: 'Bol malzemeli, çıtır çıtır', img: 'toast', price: '100 ₺' },
              { name: 'Özel Nargile', desc: 'Ferahlatıcı meyve karışımları', img: 'hookah', price: '300 ₺' }
            ].map((item, i) => (
              <div key={i} className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${item.img}/600/400`} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-stone-200">{item.name}</h3>
                    <span className="text-amber-500 font-medium">{item.price}</span>
                  </div>
                  <p className="text-stone-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6 text-amber-50">İletişim & Konum</h2>
              <p className="text-stone-400">Bizi ziyaret edin veya rezervasyon için arayın.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-stone-900 rounded-2xl text-amber-500 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-1">Adres</h3>
                  <p className="text-stone-400">Çubuklu, Polatlı Sk No:21<br/>34805 Beykoz / İstanbul</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-4 bg-stone-900 rounded-2xl text-amber-500 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-1">Telefon</h3>
                  <p className="text-stone-400">0536 895 53 16</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-4 bg-stone-900 rounded-2xl text-amber-500 shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 mb-1">Çalışma Saatleri</h3>
                  <p className="text-stone-400">Pazartesi - Pazar<br/>10:00 – 02:00</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] rounded-3xl overflow-hidden border border-stone-800">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3006.182473489247!2d29.0883213!3d41.1087121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab5c8b5b5b5b5%3A0x5b5b5b5b5b5b5b5b!2s%C3%87ubuklu%2C%20Polatl%C3%B1%20Sk.%20No%3A21%2C%2034805%20Beykoz%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1620000000000!5m2!1str!2str" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-stone-900 flex flex-col items-center gap-4 text-stone-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Zirve Cafe. Tüm hakları saklıdır.</p>
        <Link to="/admin/login" className="text-stone-500 hover:text-amber-500 transition-colors">
          Yönetim Paneli
        </Link>
      </footer>
    </div>
  );
}
