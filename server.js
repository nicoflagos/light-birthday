const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'wishes_db.json');
app.use(cors());
app.use(bodyParser.json());

// Serve static files (the site) from the project root
app.use(express.static(__dirname));

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

// Create a wish (auto-approved)
app.post('/api/wishes', (req, res) => {
  const { name, message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }
  const db = readDB();
  const wish = {
    id: nanoid(),
    name: (name||'').slice(0,100),
    message: message.slice(0,1000),
    time: new Date().toISOString(),
    status: 'approved'
  };
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
