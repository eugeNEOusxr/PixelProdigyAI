const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// SQLite connection (in-memory mode for speed)
const db = new sqlite3.Database('./pixelprodigy.db');

// Keep database in memory cache for speed
let object_cache = {};
let city_cache = {};

// Load data on startup
app.on('ready', () => {
    console.log('📂 Loading objects into cache...');
    db.all('SELECT * FROM vls_objects', (err, rows) => {
        if (rows) rows.forEach(row => object_cache[row.id] = row);
        console.log(`✅ Loaded ${Object.keys(object_cache).length} objects`);
    });
    
    db.all('SELECT * FROM cities_skyrelics', (err, rows) => {
        if (rows) rows.forEach(row => city_cache[row.id] = row);
        console.log(`✅ Loaded ${Object.keys(city_cache).length} cities`);
    });
});

// Fast endpoints
app.get('/api/objects/:id', (req, res) => {
    res.json(object_cache[req.params.id] || {});
});

app.get('/api/cities/skyrelics', (req, res) => {
    res.json(Object.values(city_cache));
});

app.get('/api/cities/real', (req, res) => {
    db.all('SELECT * FROM cities_real', (err, rows) => {
        res.json(rows || []);
    });
});

// Batch render endpoint
app.post('/api/batch/render', (req, res) => {
    const { ids, tier } = req.body;
    const results = ids.map(id => object_cache[id]).filter(Boolean);
    res.json(results);
});

// WebSocket for multiplayer terrain
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('🎮 Player connected');
    
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        
        if (data.type === 'DESTRUCTION') {
            // Broadcast to all players
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'TERRAIN_DESTROYED',
                        position: data.position,
                        radius: data.radius
                    }));
                }
            });
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', objects: Object.keys(object_cache).length });
});

app.listen(3000, () => {
    console.log('✅ VLS Gaming API running on http://localhost:3000');
});

module.exports = app;
