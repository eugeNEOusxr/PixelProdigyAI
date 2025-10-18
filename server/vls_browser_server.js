const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from object_browser
app.use(express.static(path.join(__dirname, '../object_browser')));
app.use(express.static(path.join(__dirname, '../')));

// SQLite connection
const db = new sqlite3.Database('./pixelprodigy.db', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Connected to pixelprodigy.db');
    }
});

// API Endpoints

// Get all objects with pagination
app.get('/api/objects', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const tier = req.query.tier;
    
    let query = 'SELECT * FROM vls_objects';
    let countQuery = 'SELECT COUNT(*) as total FROM vls_objects';
    const params = [];
    const whereConditions = [];
    
    if (category) {
        whereConditions.push('name LIKE ?');
        params.push(`%${category}%`);
    }
    
    if (tier) {
        whereConditions.push('tier = ?');
        params.push(tier);
    }
    
    if (whereConditions.length > 0) {
        const whereClause = ' WHERE ' + whereConditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Get total count
    db.get(countQuery, params.slice(0, -2), (err, countRow) => {
        if (err) {
            console.error('Error counting objects:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        // Get objects
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error fetching objects:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            res.json({
                objects: rows,
                pagination: {
                    page,
                    limit,
                    total: countRow.total,
                    totalPages: Math.ceil(countRow.total / limit)
                }
            });
        });
    });
});

// Get single object
app.get('/api/objects/:id', (req, res) => {
    db.get('SELECT * FROM vls_objects WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(row || { error: 'Object not found' });
    });
});

// Get categories
app.get('/api/categories', (req, res) => {
    db.all(`
        SELECT DISTINCT 
            CASE 
                WHEN name LIKE '%furniture%' THEN 'furniture'
                WHEN name LIKE '%vehicle%' THEN 'vehicles'
                WHEN name LIKE '%nature%' THEN 'nature'
                WHEN name LIKE '%tool%' THEN 'tools'
                WHEN name LIKE '%architecture%' THEN 'architecture'
                WHEN name LIKE '%food%' THEN 'food'
                WHEN name LIKE '%electronics%' THEN 'electronics'
                ELSE 'misc'
            END as category,
            COUNT(*) as count
        FROM vls_objects
        GROUP BY category
        ORDER BY count DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(rows);
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        totalObjects: 'SELECT COUNT(*) as count FROM vls_objects',
        avgCompression: 'SELECT AVG(compression_ratio) as avg FROM vls_objects',
        tierDistribution: 'SELECT tier, COUNT(*) as count FROM vls_objects GROUP BY tier',
        totalCities: 'SELECT COUNT(*) as count FROM cities_real'
    };
    
    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], (err, rows) => {
            if (!err) {
                results[key] = rows;
            }
            completed++;
            
            if (completed === totalQueries) {
                res.json(results);
            }
        });
    });
});

// Search objects
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    
    db.all(`
        SELECT * FROM vls_objects 
        WHERE name LIKE ? OR vls_code LIKE ?
        LIMIT ?
    `, [`%${searchTerm}%`, `%${searchTerm}%`, limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(rows);
    });
});

// Get random objects
app.get('/api/random', (req, res) => {
    const count = parseInt(req.query.count) || 10;
    
    db.all(`
        SELECT * FROM vls_objects 
        ORDER BY RANDOM() 
        LIMIT ?
    `, [count], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(rows);
    });
});

// Health check
app.get('/health', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM vls_objects', (err, row) => {
        res.json({ 
            status: 'healthy', 
            objectCount: row ? row.count : 0,
            timestamp: new Date().toISOString()
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 PixelProdigy AI - Object Browser Server');
    console.log('='.repeat(60));
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Object Browser: http://localhost:${PORT}/index.html`);
    console.log(`🔧 API Endpoint: http://localhost:${PORT}/api`);
    console.log('='.repeat(60));
    
    // Load initial stats
    db.get('SELECT COUNT(*) as count FROM vls_objects', (err, row) => {
        if (!err && row) {
            console.log(`📦 Objects in database: ${row.count}`);
        }
    });
});

module.exports = app;
