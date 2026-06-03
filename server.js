const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'wishes_db.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'birthday2026';

app.use(cors());
app.use(bodyParser.json());

// Serve static files (the site) from the project root
app.use(express.static(__dirname));

// Admin auth middleware
function checkAdminAuth(req, res, next) {
  const pwd = req.get('X-Admin-Password') || req.body?.adminPassword;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeDB(arr) {
  fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2));
}

// Create a wish (status: pending)
app.post('/api/wishes', (req, res) => {
  const { name, message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }
  const db = readDB();
  const wish = { id: nanoid(), name: (name||'').slice(0,100), message: message.slice(0,1000), time: new Date().toISOString(), status: 'pending' };
  db.push(wish);
  writeDB(db);
  res.json({ success: true, wish });
});

// List wishes, optional ?status=approved|pending|all
app.get('/api/wishes', (req, res) => {
  const status = req.query.status || 'approved';
  const db = readDB();
  let out = db;
  if (status !== 'all') {
    out = db.filter(w => w.status === status);
  }
  res.json({ wishes: out });
});

// Approve a wish
app.post('/api/wishes/:id/approve', checkAdminAuth, (req, res) => {
  const id = req.params.id;
  const db = readDB();
  const idx = db.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[idx].status = 'approved';
  writeDB(db);
  res.json({ success: true, wish: db[idx] });
});

// Delete a wish
app.delete('/api/wishes/:id', checkAdminAuth, (req, res) => {
  const id = req.params.id;
  let db = readDB();
  const idx = db.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.splice(idx, 1)[0];
  writeDB(db);
  res.json({ success: true, removed });
});

// Export all wishes as JSON
app.get('/api/wishes/export/json', checkAdminAuth, (req, res) => {
  const db = readDB();
  res.setHeader('Content-Disposition', 'attachment; filename="birthday-wishes.json"');
  res.json(db);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
