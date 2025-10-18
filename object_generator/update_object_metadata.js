#!/usr/bin/env node
/**
 * Update Object Metadata - Links JSON objects to real 3D models
 * 
 * This script:
 * 1. Scans all object JSON files
 * 2. Checks if corresponding GLB model exists
 * 3. Updates visual.model.hasRealModel and path
 * 4. Saves updated JSON files
 */

const fs = require('fs');
const path = require('path');

class MetadataUpdater {
    constructor() {
        this.objectsDir = path.join(__dirname, 'generated_objects');
        this.modelsDir = path.join(__dirname, 'generated_objects', 'models');
        this.stats = {
            total: 0,
            withRealModels: 0,
            procedural: 0,
            updated: 0
        };
    }

    /**
     * Find all JSON files recursively
     */
    findJSONFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip models directory
                if (!filePath.includes('/models')) {
                    this.findJSONFiles(filePath, fileList);
                }
            } else if (file.endsWith('.json') && file !== 'catalog.json') {
                fileList.push(filePath);
            }
        });

        return fileList;
    }

    /**
     * Check if GLB model exists for this object
     */
    findGLBModel(objectData) {
        const category = objectData.category?.toLowerCase() || '';
        const type = objectData.type?.toLowerCase() || '';
        const objectId = objectData.objectId || '';

        // Possible model locations
        const possiblePaths = [
            // Based on objectId
            path.join(this.modelsDir, category, `${objectId}.glb`),
            // Based on type
            path.join(this.modelsDir, category, `${type}.glb`),
            // Based on name (sanitized)
            path.join(this.modelsDir, category, `${objectData.metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}.glb`)
        ];

        for (const modelPath of possiblePaths) {
            if (fs.existsSync(modelPath)) {
                // Return relative path from object_browser
                return path.relative(
                    path.join(__dirname, '..', 'object_browser'),
                    modelPath
                ).replace(/\\/g, '/');
            }
        }

        return null;
    }

    /**
     * Update single object file
     */
    updateObject(jsonPath) {
        try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            const objectData = JSON.parse(content);
            
            this.stats.total++;

            // Find corresponding GLB model
            const modelPath = this.findGLBModel(objectData);

            // Update visual.model section
            if (!objectData.visual) {
                objectData.visual = {};
            }
            if (!objectData.visual.model) {
                objectData.visual.model = {};
            }

            const hasChanged = 
                objectData.visual.model.hasRealModel !== !!modelPath ||
                objectData.visual.model.path !== (modelPath || `/procedural/${objectData.category}/${objectData.type}`);

            if (modelPath) {
                // Real model found
                objectData.visual.model.hasRealModel = true;
                objectData.visual.model.format = "GLB";
                objectData.visual.model.path = `../object_generator/${modelPath}`;
                objectData.visual.model.source = "AI_GENERATED_FROM_IMAGE";
                this.stats.withRealModels++;
            } else {
                // Use procedural generation
                objectData.visual.model.hasRealModel = false;
                objectData.visual.model.format = "PROCEDURAL";
                objectData.visual.model.path = `/procedural/${objectData.category}/${objectData.type}`;
                objectData.visual.model.source = "PROCEDURAL_GENERATION";
                this.stats.procedural++;
            }

            // Save if changed
            if (hasChanged) {
                fs.writeFileSync(jsonPath, JSON.stringify(objectData, null, 2));
                this.stats.updated++;
            }

            return true;

        } catch (error) {
            console.error(`❌ Error processing ${jsonPath}:`, error.message);
            return false;
        }
    }

    /**
     * Update all objects
     */
    updateAll() {
        console.log('🔄 Scanning for object files...\n');

        const jsonFiles = this.findJSONFiles(this.objectsDir);
        console.log(`📦 Found ${jsonFiles.length} object files\n`);

        console.log('🔗 Linking objects to 3D models...\n');

        const progressInterval = Math.max(1, Math.floor(jsonFiles.length / 20));

        jsonFiles.forEach((file, index) => {
            this.updateObject(file);

            if ((index + 1) % progressInterval === 0 || index === jsonFiles.length - 1) {
                const percent = Math.round(((index + 1) / jsonFiles.length) * 100);
                process.stdout.write(`\r⏳ Progress: ${percent}% (${index + 1}/${jsonFiles.length})`);
            }
        });

        console.log('\n');
        this.printStats();
    }

    /**
     * Print statistics
     */
    printStats() {
        const percentReal = ((this.stats.withRealModels / this.stats.total) * 100).toFixed(1);
        const percentProcedural = ((this.stats.procedural / this.stats.total) * 100).toFixed(1);

        console.log('=' .repeat(60));
        console.log('📊 UPDATE COMPLETE');
        console.log('=' .repeat(60));
        console.log(`Total objects:        ${this.stats.total.toLocaleString()}`);
        console.log(`With real 3D models:  ${this.stats.withRealModels.toLocaleString()} (${percentReal}%)`);
        console.log(`Procedural only:      ${this.stats.procedural.toLocaleString()} (${percentProcedural}%)`);
        console.log(`Files updated:        ${this.stats.updated.toLocaleString()}`);
        console.log('=' .repeat(60));

        if (this.stats.withRealModels === 0) {
            console.log('\n⚠️  No real 3D models found!');
            console.log('To add real models:');
            console.log('1. Run: python3 image_scraper.py');
            console.log('2. Run: python3 image_to_3d_converter.py');
            console.log('3. Run this script again');
        } else {
            console.log(`\n✅ ${this.stats.withRealModels} objects now have photo-realistic 3D models!`);
            console.log(`📈 Visual quality improved by ${percentReal}%`);
        }

        console.log('\n💡 Next step: Open object browser to see real 3D models');
        console.log('   http://localhost:8001/object_browser/\n');
    }

    /**
     * List models by category
     */
    listModelsByCategory() {
        console.log('\n📂 3D Models by Category:\n');

        const categories = fs.readdirSync(this.modelsDir);
        
        categories.forEach(category => {
            const categoryPath = path.join(this.modelsDir, category);
            if (fs.statSync(categoryPath).isDirectory()) {
                const models = fs.readdirSync(categoryPath).filter(f => f.endsWith('.glb'));
                if (models.length > 0) {
                    console.log(`  ${category}: ${models.length} models`);
                }
            }
        });
    }
}

// ============================================
// MAIN EXECUTION
// ============================================

function main() {
    console.log('🎨 PixelProdigy AI - Object Metadata Updater');
    console.log('=' .repeat(60));
    console.log('This script links object JSON files to real 3D models\n');

    const updater = new MetadataUpdater();

    // Check if models directory exists
    if (!fs.existsSync(updater.modelsDir)) {
        console.log('⚠️  Models directory not found!');
        console.log(`Creating: ${updater.modelsDir}\n`);
        fs.mkdirSync(updater.modelsDir, { recursive: true });
        
        console.log('To generate 3D models:');
        console.log('1. Run: python3 image_scraper.py (scrape product images)');
        console.log('2. Run: python3 image_to_3d_converter.py (convert to 3D)');
        console.log('3. Run this script again to link them');
        console.log('\nFor now, all objects will use procedural generation.\n');
    } else {
        // List existing models
        updater.listModelsByCategory();
        console.log('');
    }

    // Update all objects
    updater.updateAll();
}

if (require.main === module) {
    main();
}

module.exports = MetadataUpdater;
