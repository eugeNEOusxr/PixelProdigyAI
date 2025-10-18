/**
 * VLS API Server - Middleware between VLS demo and PixelProdigy frontend
 * Handles VLS parsing, personality routing, database operations
 */

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../')));

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pixelprodigy_vls',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// ============================================
// VLS ENDPOINTS
// ============================================

/**
 * Parse VLS code to vertices
 * POST /api/vls/parse
 * Body: { vls: "A5B3C2", personalityId: 30 }
 */
app.post('/api/vls/parse', async (req, res) => {
    try {
        const { vls, personalityId } = req.body;
        
        if (!vls) {
            return res.status(400).json({ error: 'VLS code required' });
        }

        // Load VLS parser
        const VLSParser = require('../object_generator/vls_parser.js');
        const parser = new VLSParser();
        
        // Apply personality morphing if specified
        if (personalityId) {
            const PersonalityMorpher = require('../object_generator/personality_morpher.js');
            const morpher = new PersonalityMorpher();
            const morphedVLS = morpher.morphVLS(vls, personalityId);
            const result = parser.parse(morphedVLS);
            
            return res.json({
                success: true,
                original: vls,
                morphed: morphedVLS,
                vertices: result.vertices,
                edges: result.edges,
                faces: result.faces,
                personalityId
            });
        }
        
        const result = parser.parse(vls);
        res.json({
            success: true,
            vls,
            vertices: result.vertices,
            edges: result.edges,
            faces: result.faces
        });
    } catch (error) {
        console.error('VLS parse error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Compress VLS code
 * POST /api/vls/compress
 * Body: { vls: "A5B3C2.D4E4F4" }
 */
app.post('/api/vls/compress', async (req, res) => {
    try {
        const { vls } = req.body;
        
        if (!vls) {
            return res.status(400).json({ error: 'VLS code required' });
        }

        // Simple compression: remove whitespace, optimize repeated patterns
        let compressed = vls
            .replace(/\s+/g, '')
            .replace(/\.+/g, '/')
            .replace(/([A-Z]\d+)\1+/g, '$1*' + '$&'.match(/\1/g).length);
        
        const compressionRatio = compressed.length / vls.length;
        
        // Cache in database
        await pool.query(
            `INSERT INTO vls_compression_cache (original_vls, compressed_vls, compression_ratio, algorithm)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (original_vls) DO UPDATE SET access_count = vls_compression_cache.access_count + 1`,
            [vls, compressed, compressionRatio, 'pattern_matching']
        );
        
        res.json({
            success: true,
            original: vls,
            compressed,
            originalSize: vls.length,
            compressedSize: compressed.length,
            compressionRatio,
            savings: `${((1 - compressionRatio) * 100).toFixed(1)}%`
        });
    } catch (error) {
        console.error('VLS compress error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get VLS object by ID
 * GET /api/vls/objects/:objectId
 */
app.get('/api/vls/objects/:objectId', async (req, res) => {
    try {
        const { objectId } = req.params;
        
        const result = await pool.query(
            `SELECT * FROM vls_objects_with_personalities WHERE object_id = $1`,
            [objectId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Object not found' });
        }
        
        res.json({
            success: true,
            object: result.rows[0]
        });
    } catch (error) {
        console.error('Get VLS object error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Search VLS objects
 * GET /api/vls/objects?category=furniture&personality=30&limit=20
 */
app.get('/api/vls/objects', async (req, res) => {
    try {
        const { 
            category, 
            personality, 
            rarity, 
            minPrice, 
            maxPrice, 
            search,
            limit = 20, 
            offset = 0 
        } = req.query;
        
        let query = 'SELECT * FROM vls_objects_with_personalities WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            query += ` AND category ILIKE $${paramIndex}`;
            params.push(`%${category}%`);
            paramIndex++;
        }
        
        if (personality) {
            query += ` AND created_by_personality_id = $${paramIndex}`;
            params.push(parseInt(personality));
            paramIndex++;
        }
        
        if (rarity) {
            query += ` AND rarity = $${paramIndex}`;
            params.push(rarity);
            paramIndex++;
        }
        
        if (minPrice) {
            query += ` AND price_mpt >= $${paramIndex}`;
            params.push(parseInt(minPrice));
            paramIndex++;
        }
        
        if (maxPrice) {
            query += ` AND price_mpt <= $${paramIndex}`;
            params.push(parseInt(maxPrice));
            paramIndex++;
        }
        
        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR to_tsvector('english', name) @@ plainto_tsquery('english', $${paramIndex}))`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM vls_objects WHERE 1=1';
        const countParams = params.slice(0, -2); // Remove limit and offset
        
        if (category) countQuery += ` AND category ILIKE $1`;
        if (personality) countQuery += ` AND created_by_personality_id = $${countParams.indexOf(parseInt(personality)) + 1}`;
        if (rarity) countQuery += ` AND rarity = $${countParams.indexOf(rarity) + 1}`;
        
        const countResult = await pool.query(countQuery, countParams);
        
        res.json({
            success: true,
            objects: result.rows,
            total: parseInt(countResult.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Search VLS objects error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create VLS object
 * POST /api/vls/objects
 * Body: { objectId, name, category, vls, personalityId, metadata }
 */
app.post('/api/vls/objects', async (req, res) => {
    try {
        const { 
            objectId, 
            name, 
            category, 
            subCategory,
            type,
            subType,
            vls, 
            vls_compressed,
            personalityId, 
            metadata,
            visualProperties,
            physicalProperties,
            priceMPT,
            priceUSD,
            rarity
        } = req.body;
        
        if (!objectId || !name || !category || !vls) {
            return res.status(400).json({ 
                error: 'Required fields: objectId, name, category, vls' 
            });
        }
        
        // Parse VLS to get vertex count
        const VLSParser = require('../object_generator/vls_parser.js');
        const parser = new VLSParser();
        const parsed = parser.parse(vls);
        const vertexCount = parsed.vertices.length;
        
        const result = await pool.query(
            `INSERT INTO vls_objects (
                object_id, name, category, sub_category, type, sub_type,
                vls_code, vls_compressed, vertex_count,
                created_by_personality_id, metadata, 
                visual_properties, physical_properties,
                price_mpt, price_usd, rarity
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
                objectId, name, category, subCategory, type, subType,
                vls, vls_compressed || vls, vertexCount,
                personalityId, metadata, 
                visualProperties, physicalProperties,
                priceMPT, priceUSD, rarity
            ]
        );
        
        res.json({
            success: true,
            object: result.rows[0]
        });
    } catch (error) {
        console.error('Create VLS object error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get personality dialects
 * GET /api/personalities/:id/dialect
 */
app.get('/api/personalities/:id/dialect', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            `SELECT d.*, p.name as personality_name, p.focus 
             FROM vls_dialects d
             JOIN ai_personalities p ON d.personality_id = p.id
             WHERE d.personality_id = $1`,
            [parseInt(id)]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dialect not found' });
        }
        
        res.json({
            success: true,
            dialect: result.rows[0]
        });
    } catch (error) {
        console.error('Get dialect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all AI personalities
 * GET /api/personalities
 */
app.get('/api/personalities', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM ai_personalities ORDER BY id`
        );
        
        res.json({
            success: true,
            personalities: result.rows
        });
    } catch (error) {
        console.error('Get personalities error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Log VLS generation (multi-AI collaboration)
 * POST /api/vls/generation-log
 */
app.post('/api/vls/generation-log', async (req, res) => {
    try {
        const {
            objectId,
            primaryPersonalityId,
            collaboratingIds,
            workloadPartition,
            generationTimeMs,
            initialVLS,
            finalVLS
        } = req.body;
        
        const result = await pool.query(
            `SELECT log_vls_generation($1, $2, $3, $4, $5, $6, $7) as log_id`,
            [
                objectId,
                primaryPersonalityId,
                collaboratingIds || [],
                workloadPartition || {},
                generationTimeMs,
                initialVLS,
                finalVLS
            ]
        );
        
        res.json({
            success: true,
            logId: result.rows[0].log_id
        });
    } catch (error) {
        console.error('Log generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get compression statistics
 * GET /api/vls/stats
 */
app.get('/api/vls/stats', async (req, res) => {
    try {
        // Refresh materialized view
        await pool.query('SELECT refresh_compression_stats()');
        
        const result = await pool.query(
            `SELECT * FROM vls_compression_stats ORDER BY category, created_by_personality_id`
        );
        
        res.json({
            success: true,
            stats: result.rows
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CONVERSION ENDPOINTS
// ============================================

/**
 * Convert existing JSON object to VLS
 * POST /api/convert/json-to-vls
 */
app.post('/api/convert/json-to-vls', async (req, res) => {
    try {
        const { object, personalityId } = req.body;
        
        if (!object) {
            return res.status(400).json({ error: 'Object data required' });
        }
        
        // Generate VLS from object metadata
        const category = object.category?.toLowerCase() || 'furniture';
        const type = object.type?.toLowerCase() || 'chair';
        const dimensions = object.physical?.dimensions || { width: 1, height: 1, depth: 1 };
        
        // Simple VLS generation (will be enhanced by personality morphing)
        let vls = `${category.toUpperCase()}:`;
        vls += `A${Math.round(dimensions.width * 10)}`;
        vls += `B${Math.round(dimensions.height * 10)}`;
        vls += `C${Math.round(dimensions.depth * 10)}`;
        
        // Apply personality morphing
        if (personalityId) {
            const PersonalityMorpher = require('../object_generator/personality_morpher.js');
            const morpher = new PersonalityMorpher();
            vls = morpher.morphVLS(vls, personalityId);
        }
        
        res.json({
            success: true,
            objectId: object.objectId,
            vls,
            personalityId
        });
    } catch (error) {
        console.error('JSON to VLS conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 VLS API Server running on http://localhost:${PORT}
    
📚 Endpoints:
   POST   /api/vls/parse              - Parse VLS to vertices
   POST   /api/vls/compress           - Compress VLS code
   GET    /api/vls/objects            - Search VLS objects
   GET    /api/vls/objects/:id        - Get object by ID
   POST   /api/vls/objects            - Create VLS object
   GET    /api/personalities          - List AI personalities
   GET    /api/personalities/:id/dialect - Get personality dialect
   POST   /api/vls/generation-log     - Log multi-AI generation
   GET    /api/vls/stats              - Compression statistics
   POST   /api/convert/json-to-vls    - Convert JSON to VLS
   
🗄️  Database: pixelprodigy_vls @ localhost:5432
    `);
});

module.exports = app;
