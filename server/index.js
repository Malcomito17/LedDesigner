import express from 'express';
import initSqlJs from 'sql.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 80;

// Database setup
const dbDir = process.env.DB_DIR || path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'leddesigner.db');
fs.mkdirSync(dbDir, { recursive: true });

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alias TEXT UNIQUE NOT NULL COLLATE NOCASE,
      pin_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      data TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  saveDb();
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function hashPin(pin, salt) {
  return crypto.createHash('sha256').update(pin + salt).digest('hex');
}

function findUser(alias) {
  const stmt = db.prepare('SELECT * FROM users WHERE alias = ?');
  stmt.bind([alias]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// Middleware
app.use(express.json({ limit: '5mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [alias, pin] = decoded.split(':');
    const user = findUser(alias);
    if (!user || hashPin(pin, user.alias) !== user.pin_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', (req, res) => {
  const { alias, pin } = req.body;
  if (!alias || !pin || alias.length < 3 || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'Alias (min 3 chars) y PIN (4 dígitos) requeridos' });
  }

  if (findUser(alias)) {
    return res.status(409).json({ error: 'Alias ya registrado' });
  }

  const pinHash = hashPin(pin, alias);
  db.run('INSERT INTO users (alias, pin_hash) VALUES (?, ?)', [alias, pinHash]);
  saveDb();

  const token = Buffer.from(`${alias}:${pin}`).toString('base64');
  res.json({ ok: true, token, alias });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { alias, pin } = req.body;
  if (!alias || !pin) {
    return res.status(400).json({ error: 'Alias y PIN requeridos' });
  }

  const user = findUser(alias);
  if (!user || hashPin(pin, user.alias) !== user.pin_hash) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = Buffer.from(`${alias}:${pin}`).toString('base64');
  res.json({ ok: true, token, alias });
});

// Get synced data
app.get('/api/sync', authenticate, (req, res) => {
  const stmt = db.prepare('SELECT data, updated_at FROM user_data WHERE user_id = ?');
  stmt.bind([req.user.id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    try {
      res.json({ data: JSON.parse(row.data), updatedAt: row.updated_at });
    } catch {
      res.json({ data: null });
    }
  } else {
    stmt.free();
    res.json({ data: null });
  }
});

// Save synced data
app.put('/api/sync', authenticate, (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'No data' });

  const dataStr = JSON.stringify(data);
  const existing = db.prepare('SELECT user_id FROM user_data WHERE user_id = ?');
  existing.bind([req.user.id]);
  const exists = existing.step();
  existing.free();

  if (exists) {
    db.run("UPDATE user_data SET data = ?, updated_at = datetime('now') WHERE user_id = ?", [dataStr, req.user.id]);
  } else {
    db.run('INSERT INTO user_data (user_id, data) VALUES (?, ?)', [req.user.id, dataStr]);
  }
  saveDb();
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
  res.send('OK');
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LED Designer API running on port ${PORT}`);
  });
});
