import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { db, initDb } from './src/db/index';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = 3000;
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'zirve-cafe-secret-2026';

// Middleware
app.use(express.json());

// Set up uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// --- API Routes ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password, secretKey } = req.body;
  
  // Simple mock authentication
  if (username === 'admin' && password === 'admin123' && secretKey === SECRET_KEY) {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '30d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials or secret key' });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Menu Items
app.get('/api/menu', (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items').all();
  res.json(items);
});

app.post('/api/menu', verifyAdmin, upload.single('image'), (req, res) => {
  const { category, name, description, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  const stmt = db.prepare('INSERT INTO menu_items (category, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(category, name, description, parseFloat(price), imageUrl);
  
  res.json({ id: result.lastInsertRowid, category, name, description, price: parseFloat(price), image_url: imageUrl });
});

app.put('/api/menu/:id', verifyAdmin, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { category, name, description, price } = req.body;
  
  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE menu_items SET category = ?, name = ?, description = ?, price = ?, image_url = ? WHERE id = ?')
      .run(category, name, description, parseFloat(price), imageUrl, id);
    res.json({ id: parseInt(id), category, name, description, price: parseFloat(price), image_url: imageUrl });
  } else {
    db.prepare('UPDATE menu_items SET category = ?, name = ?, description = ?, price = ? WHERE id = ?')
      .run(category, name, description, parseFloat(price), id);
    const existingItem = db.prepare('SELECT image_url FROM menu_items WHERE id = ?').get(id) as { image_url: string };
    res.json({ id: parseInt(id), category, name, description, price: parseFloat(price), image_url: existingItem?.image_url });
  }
});

app.delete('/api/menu/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, message: 'Silinemedi' });
  }
});

// Orders
app.post('/api/orders', (req, res) => {
  const { tableNumber, items, totalPrice, paymentMethod } = req.body;
  
  const stmt = db.prepare('INSERT INTO orders (table_number, total_price, status, payment_method) VALUES (?, ?, ?, ?)');
  const result = stmt.run(tableNumber, totalPrice, 'Order received', paymentMethod);
  const orderId = result.lastInsertRowid;
  
  const insertItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)');
  
  for (const item of items) {
    insertItem.run(orderId, item.id, item.quantity, item.price, item.name);
  }
  
  const order = {
    id: orderId,
    table_number: tableNumber,
    total_price: totalPrice,
    status: 'Order received',
    payment_method: paymentMethod,
    items,
    created_at: new Date().toISOString()
  };
  
  io.emit('new_order', order);
  res.json({ success: true, orderId });
});

app.get('/api/orders', verifyAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const ordersWithItems = orders.map((order: any) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    if (order.created_at && !order.created_at.endsWith('Z')) {
      order.created_at = order.created_at.replace(' ', 'T') + 'Z';
    }
    return { ...order, items };
  });
  res.json(ordersWithItems);
});

app.put('/api/orders/:id/status', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, parseInt(id));
    
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(id));
    io.emit('order_status_updated', order);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Güncellenemedi' });
  }
});

// Waiter Calls
app.post('/api/waiter-call', (req, res) => {
  const { tableNumber } = req.body;
  
  const stmt = db.prepare('INSERT INTO waiter_calls (table_number, status) VALUES (?, ?)');
  const result = stmt.run(tableNumber, 'pending');
  
  const call = {
    id: result.lastInsertRowid,
    table_number: tableNumber,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  io.emit('waiter_called', call);
  res.json({ success: true });
});

app.get('/api/waiter-calls', verifyAdmin, (req, res) => {
  const calls = db.prepare("SELECT * FROM waiter_calls WHERE status = 'pending' ORDER BY created_at DESC").all();
  const formattedCalls = calls.map((call: any) => {
    if (call.created_at && !call.created_at.endsWith('Z')) {
      call.created_at = call.created_at.replace(' ', 'T') + 'Z';
    }
    return call;
  });
  res.json(formattedCalls);
});

app.put('/api/waiter-calls/:id/complete', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE waiter_calls SET status = 'completed' WHERE id = ?").run(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing waiter call:', error);
    res.status(500).json({ success: false, message: 'Tamamlanamadı' });
  }
});

// Tables
app.get('/api/tables', verifyAdmin, (req, res) => {
  const tables = db.prepare('SELECT * FROM tables ORDER BY table_number ASC').all();
  res.json(tables);
});

app.post('/api/tables', verifyAdmin, (req, res) => {
  const { tableNumber, qrCodeUrl } = req.body;
  const stmt = db.prepare('INSERT INTO tables (table_number, qr_code_url) VALUES (?, ?)');
  const result = stmt.run(tableNumber, qrCodeUrl);
  res.json({ id: result.lastInsertRowid, tableNumber, qrCodeUrl });
});

app.delete('/api/tables/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tables WHERE id = ?').run(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ success: false, message: 'Silinemedi' });
  }
});


// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

async function startServer() {
  await initDb();

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
