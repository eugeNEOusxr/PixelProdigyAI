#!/usr/bin/env node
/**
 * Convert existing JSON objects to VLS format
 * Batch processes 47K objects and stores in PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pixelprodigy_vls',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Simple VLS generator from object dimensions
function generateVLS(object) {
    const category = (object.category || 'furniture').toUpperCase();
    const dims = object.physical?.dimensions || { width: 1, height: 1, depth: 1 };
    
    // Basic VLS encoding based on dimensions
    // A = X axis (width), B = Y axis (height), C = Z axis (depth)
    const scaleX = Math.round(dims.width * 10);
    const scaleY = Math.round(dims.height * 10);
    const scaleZ = Math.round(dims.depth * 10);
    
    let vls = `${category}:A${scaleX}B${scaleY}C${scaleZ}`;
    
    // Add edge connections (creates box shape)
    vls += `.A${scaleX}^4B${scaleY}`;  // Front edge with 4 intermediate nodes
    vls += `.B${scaleY}^4C${scaleZ}`;  // Right edge
    vls += `.C${scaleZ}^4A${scaleX}`;  // Back edge
    
    return vls;
}

// Compress VLS code
function compressVLS(vls) {
    return vls
        .replace(/\s+/g, '')
        .replace(/\.+/g, '/')
        .replace(/([A-Z]\d+)\1+/g, (match, group) => {
            const count = match.split(group).length - 1;
            return `${group}*${count}`;
        });
}

// Map object category to personality
function getPersonalityForCategory(category) {
    const mapping = {
        'furniture': 30,      // Interior Designer
        'architecture': 25,   // Residential Architect
        'electronics': 33,    // Industrial Designer
        'vehicles': 20,       // Vehicle Designer
        'nature': 14,         // Organic Naturalist
        'food': 30,           // Interior Designer (table settings)
        'clothing': 21,       // Character Costume Designer
        'tools': 33,          // Industrial Designer
        'art': 1,             // Visionary Artist
        'education': 67       // Financial Advisor
    };
    
    const cat = category.toLowerCase();
    return mapping[cat] || 30;
}

// Process single object file
async function processObjectFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const objects = JSON.parse(content);
        
        const results = [];
        
        for (const obj of objects) {
            const vls = generateVLS(obj);
            const compressed = compressVLS(vls);
            const personalityId = getPersonalityForCategory(obj.category);
            
            results.push({
                objectId: obj.objectId,
                name: obj.metadata.name,
                category: obj.category,
                subCategory: obj.subCategory,
                type: obj.type,
                subType: obj.subType,
                vls,
                compressed,
                personalityId,
                metadata: obj.metadata,
                visual: obj.visual,
                physical: obj.physical
            });
        }
        
        return results;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return [];
    }
}

// Insert objects into database
async function insertObjects(objects) {
    const client = await pool.connect();
    let insertedCount = 0;
    let errorCount = 0;
    
    try {
        await client.query('BEGIN');
        
        for (const obj of objects) {
            try {
                await client.query(
                    `INSERT INTO vls_objects (
                        object_id, name, category, sub_category, type, sub_type,
                        vls_code, vls_compressed, vertex_count,
                        created_by_personality_id,
                        metadata, visual_properties, physical_properties,
                        price_mpt, price_usd, rarity
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    ON CONFLICT (object_id) DO UPDATE SET
                        vls_code = EXCLUDED.vls_code,
                        vls_compressed = EXCLUDED.vls_compressed`,
                    [
                        obj.objectId,
                        obj.name,
                        obj.category,
                        obj.subCategory,
                        obj.type,
                        obj.subType,
                        obj.vls,
                        obj.compressed,
                        (obj.vls.match(/[A-Z]\d+/g) || []).length, // Rough vertex count
                        obj.personalityId,
                        JSON.stringify(obj.metadata),
                        JSON.stringify(obj.visual),
                        JSON.stringify(obj.physical),
                        obj.metadata.price?.myplaceCoins || 0,
                        obj.metadata.price?.usd || 0,
                        obj.metadata.rarity || 'common'
                    ]
                );
                insertedCount++;
            } catch (error) {
                console.error(`Error inserting ${obj.objectId}:`, error.message);
                errorCount++;
            }
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
    
    return { insertedCount, errorCount };
}

// Scan directory recursively
function scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanDirectory(filePath, fileList);
        } else if (file.endsWith('.json') && !file.includes('catalog')) {
            fileList.push(filePath);
        }
    }
    
    return fileList;
}

// Main conversion process
async function main() {
    console.log('🎨 PixelProdigy VLS Conversion Tool');
    console.log('=' .repeat(60));
    console.log();
    
    // Test database connection
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('   Make sure PostgreSQL is running and database is created:');
        console.log('   psql -U postgres');
        console.log('   CREATE DATABASE pixelprodigy_vls;');
        console.log('   \\c pixelprodigy_vls');
        console.log('   \\i schema/vls_schema.sql');
        process.exit(1);
    }
    
    // Find all JSON files
    const generatedDir = path.join(__dirname, '../object_generator/generated_objects');
    console.log('📂 Scanning directory:', generatedDir);
    
    const jsonFiles = scanDirectory(generatedDir);
    console.log(`   Found ${jsonFiles.length} JSON files`);
    console.log();
    
    if (jsonFiles.length === 0) {
        console.log('⚠️  No JSON files found. Run object generator first:');
        console.log('   cd object_generator');
        console.log('   node generator.js');
        process.exit(1);
    }
    
    // Process files
    console.log('🔄 Processing objects...');
    let totalObjects = 0;
    let totalInserted = 0;
    let totalErrors = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < jsonFiles.length; i++) {
        const file = jsonFiles[i];
        const relativePath = path.relative(generatedDir, file);
        
        process.stdout.write(`   [${i + 1}/${jsonFiles.length}] ${relativePath}...`);
        
        const objects = await processObjectFile(file);
        totalObjects += objects.length;
        
        if (objects.length > 0) {
            const { insertedCount, errorCount } = await insertObjects(objects);
            totalInserted += insertedCount;
            totalErrors += errorCount;
            
            console.log(` ✅ ${insertedCount} objects`);
        } else {
            console.log(' ⚠️  No objects');
        }
    }
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log();
    console.log('=' .repeat(60));
    console.log('📊 CONVERSION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`   Total Objects: ${totalObjects.toLocaleString()}`);
    console.log(`   ✅ Inserted: ${totalInserted.toLocaleString()}`);
    console.log(`   ❌ Errors: ${totalErrors.toLocaleString()}`);
    console.log(`   ⏱️  Time: ${elapsedTime}s`);
    console.log(`   📈 Rate: ${Math.round(totalInserted / parseFloat(elapsedTime))} objects/sec`);
    console.log();
    
    // Calculate compression statistics
    try {
        console.log('📊 Calculating compression statistics...');
        await pool.query('SELECT refresh_compression_stats()');
        
        const statsResult = await pool.query(`
            SELECT 
                category,
                object_count,
                ROUND(avg_compression::numeric, 3) as avg_compression,
                ROUND(avg_vertices::numeric, 0) as avg_vertices
            FROM vls_compression_stats
            ORDER BY object_count DESC
            LIMIT 10
        `);
        
        console.log();
        console.log('   Category Breakdown:');
        console.log('   ' + '-'.repeat(58));
        console.log('   Category          | Objects  | Avg Compression | Avg Vertices');
        console.log('   ' + '-'.repeat(58));
        
        for (const row of statsResult.rows) {
            const category = (row.category || 'Unknown').padEnd(17);
            const count = row.object_count.toString().padStart(7);
            const compression = (row.avg_compression || 0).toFixed(3).padStart(15);
            const vertices = Math.round(row.avg_vertices || 0).toString().padStart(12);
            
            console.log(`   ${category} | ${count} | ${compression} | ${vertices}`);
        }
        
        console.log('   ' + '-'.repeat(58));
    } catch (error) {
        console.error('Error calculating stats:', error.message);
    }
    
    console.log();
    console.log('🎯 Next Steps:');
    console.log('   1. Start VLS API server:');
    console.log('      node server/vls_api.js');
    console.log();
    console.log('   2. Open PixelProdigy renderer:');
    console.log('      Open pixelprodigy.html in browser');
    console.log();
    console.log('   3. Test VLS rendering:');
    console.log('      Enter VLS code → Select personality → Render');
    console.log();
    console.log('✨ VLS conversion complete!');
    
    await pool.end();
}

// Run
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
