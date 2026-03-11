import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database(path.join(dbDir, 'zirve-cafe.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS waiter_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL UNIQUE,
    qr_code_url TEXT NOT NULL
  );
`);

// Seed initial menu data if empty
export async function initDb() {
  const count = db.prepare('SELECT count(*) as count FROM menu_items').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO menu_items (category, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)');
    
    const initialData = [
      ['Hamburgerler', 'Classic Hamburger', '150g dana köfte, marul, domates, turşu', 180, 'https://picsum.photos/seed/hamburger/400/300'],
      ['Hamburgerler', 'Cheeseburger', '150g dana köfte, cheddar peyniri, marul, domates', 200, 'https://picsum.photos/seed/cheeseburger/400/300'],
      ['Hamburgerler', 'Double Burger', '300g dana köfte, çift cheddar, karamelize soğan', 280, 'https://picsum.photos/seed/doubleburger/400/300'],
      ['Tostlar', 'Kaşarlı Tost', 'Bol kaşar peynirli klasik tost', 80, 'https://picsum.photos/seed/toast/400/300'],
      ['Tostlar', 'Sucuklu Tost', 'Kasap sucuklu özel tost', 90, 'https://picsum.photos/seed/sucuklutost/400/300'],
      ['Tostlar', 'Karışık Tost', 'Sucuk ve kaşar peynirli', 100, 'https://picsum.photos/seed/karisiktost/400/300'],
      ['Izgara Ürünleri', 'Izgara Tavuk', 'Özel soslu ızgara tavuk göğsü, pilav ve salata ile', 220, 'https://picsum.photos/seed/grilledchicken/400/300'],
      ['Izgara Ürünleri', 'Izgara Köfte', 'Kasap köfte, közlenmiş biber ve domates ile', 250, 'https://picsum.photos/seed/meatballs/400/300'],
      ['Atıştırmalıklar', 'Patates Kızartması', 'Çıtır patates kızartması', 70, 'https://picsum.photos/seed/fries/400/300'],
      ['Atıştırmalıklar', 'Soğan Halkası', '10 adet çıtır soğan halkası', 65, 'https://picsum.photos/seed/onionrings/400/300'],
      ['Çay & Sıcak İçecekler', 'Çay', 'İnce belli bardakta taze demlenmiş çay', 20, 'https://picsum.photos/seed/turkishtea/400/300'],
      ['Çay & Sıcak İçecekler', 'Orolet', 'Sıcak orman meyveli içecek', 35, 'https://picsum.photos/seed/orolet/400/300'],
      ['Soğuk İçecekler', 'Kola', 'Kutu kola', 45, 'https://picsum.photos/seed/cola/400/300'],
      ['Soğuk İçecekler', 'Ayran', 'Köpüklü yayık ayranı', 35, 'https://picsum.photos/seed/ayran/400/300'],
      ['Soğuk İçecekler', 'Limonata', 'Ev yapımı taze naneli limonata', 55, 'https://picsum.photos/seed/lemonade/400/300'],
      ['Nargile', 'Nargile Elma', 'Çift elma aromalı nargile', 300, 'https://picsum.photos/seed/hookah/400/300'],
      ['Nargile', 'Nargile Nane', 'Ferahlatıcı nane aromalı nargile', 300, 'https://picsum.photos/seed/hookahmint/400/300'],
      ['Nargile', 'Nargile Çilek', 'Tatlı çilek aromalı nargile', 300, 'https://picsum.photos/seed/hookahstrawberry/400/300'],
    ];

    for (const item of initialData) {
      insert.run(...item);
    }
  }

  // Seed 50 tables
  const tableCount = db.prepare('SELECT count(*) as count FROM tables').get() as { count: number };
  const hasLocalhost = db.prepare("SELECT count(*) as count FROM tables WHERE qr_code_url LIKE '%localhost%'").get() as { count: number };
  
  if (tableCount.count < 50 || hasLocalhost.count > 0) {
    db.prepare('DELETE FROM tables').run();
    const insertTable = db.prepare('INSERT INTO tables (table_number, qr_code_url) VALUES (?, ?)');
    const baseUrl = process.env.APP_URL || 'https://ais-dev-whpzreybd6ycwtfvdsoj4h-614809961163.europe-west2.run.app';
    
    console.log('Generating 50 tables and QR codes...');
    for (let i = 1; i <= 50; i++) {
      const url = `${baseUrl}/menu?table=${i}`;
      const qrDataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 });
      insertTable.run(i, qrDataUrl);
    }
    console.log('50 tables generated successfully.');
  }
}

export { db };
