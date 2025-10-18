/**
 * Personality Morpher for Vertex Language System
 * Transforms base VLS strings according to AI personality profiles
 * 
 * Eugene Ousos - PixelProdigy AI
 */

class PersonalityMorpher {
    constructor() {
        // Personality style modifiers
        this.styleModifiers = {
            luxury: {
                nodeMultiplier: 2.0,        // Double smoothness
                addSuffix: '-AE',           // Add spiral accents
                materialTemplate: '+m0.2r0.8a[${color}]g0.9',
                lightingTemplate: '+4[0,2,0]'
            },
            minimalist: {
                nodeMultiplier: 0.5,        // Reduce detail
                removeCurves: true,
                materialTemplate: '+m0.1r0.6a[${color}]',
                lightingTemplate: '+2[5,10,5]'
            },
            industrial: {
                snapToPowerOf2: true,       // Precise engineering
                straightenCurves: true,
                materialTemplate: '+m0.9r0.2a[${color}]p1',
                lightingTemplate: '+2[5,10,5]'
            },
            organic: {
                addCurves: true,            // Bezier everything
                subdivisionBoost: 8,
                materialTemplate: '+m0.0r0.9a[${color}]b1w0.3',
                lightingTemplate: '+6[forest_hdri]+1[0.3]'
            },
            aerodynamic: {
                lowerStance: true,          // Reduce height
                addRotation: true,
                materialTemplate: '+m0.95r0.15a[${color}]c1e0.2',
                lightingTemplate: '+2[10,15,0]+7[cockpit]'
            },
            vintage: {
                addPatina: true,
                materialTemplate: '+m0.3r0.9a[${color}]b0.8w0.1',
                lightingTemplate: '+1[0.4]+2[3,8,5]'
            },
            futuristic: {
                addGlow: true,
                sharpEdges: true,
                materialTemplate: '+m0.8r0.1a[${color}]e0.5c1',
                lightingTemplate: '+2[10,12,10]+4[0,3,0]e1'
            },
            rustic: {
                addImperfections: true,
                materialTemplate: '+m0.0r1.0a[${color}]b1n1',
                lightingTemplate: '+6[barn_hdri]+1[0.25]'
            }
        };
        
        // Color palettes for different personalities
        this.colorPalettes = {
            luxury: ['#c9a97a', '#d4af37', '#f5deb3', '#daa520'],      // Gold/beige tones
            industrial: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'],  // Gray/steel tones
            organic: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],     // Wood/earth tones
            aerodynamic: ['#ff0000', '#000000', '#c0c0c0', '#ffffff'], // Racing colors
            minimalist: ['#ffffff', '#f5f5f5', '#e0e0e0', '#cccccc'],  // White/gray
            vintage: ['#8B7355', '#A68064', '#C9B299', '#8B4513'],     // Brown/tan
            futuristic: ['#00ffff', '#ff00ff', '#00ff00', '#ffffff'],  // Neon colors
            rustic: ['#654321', '#8B4513', '#A0522D', '#D2691E']       // Dark wood tones
        };
    }
    
    /**
     * Morph VLS string based on personality profile
     * @param {string} baseVLS - Base VLS string
     * @param {object} personalityProfile - Personality data
     * @returns {string} - Morphed VLS string
     */
    morphVLS(baseVLS, personalityProfile) {
        console.log(`🎨 Morphing VLS for Personality #${personalityProfile.id}: ${personalityProfile.name}`);
        console.log(`   Base: ${baseVLS}`);
        
        let morphed = baseVLS;
        
        // Determine style from personality
        const style = this.inferStyle(personalityProfile);
        console.log(`   Inferred style: ${style}`);
        
        // Apply style modifiers
        if (this.styleModifiers[style]) {
            morphed = this.applyStyleModifiers(morphed, style);
        }
        
        // Apply material preferences
        morphed = this.applyMaterialPreferences(morphed, personalityProfile, style);
        
        // Apply color palette
        morphed = this.applyColorPalette(morphed, personalityProfile, style);
        
        // Apply lighting preferences
        morphed = this.applyLightingPreferences(morphed, style);
        
        console.log(`   Result: ${morphed}`);
        console.log(`   Compression: ${baseVLS.length} → ${morphed.length} chars (${((morphed.length / baseVLS.length) * 100).toFixed(0)}%)`);
        
        return morphed;
    }
    
    /**
     * Infer style from personality profile
     */
    inferStyle(profile) {
        const name = profile.name.toLowerCase();
        const focus = (profile.focus || '').toLowerCase();
        
        if (name.includes('interior') || focus.includes('luxury')) return 'luxury';
        if (name.includes('industrial') || focus.includes('precision')) return 'industrial';
        if (name.includes('naturalist') || name.includes('organic')) return 'organic';
        if (name.includes('vehicle') || focus.includes('aerodynamic')) return 'aerodynamic';
        if (name.includes('minimalist') || focus.includes('minimal')) return 'minimalist';
        if (focus.includes('vintage') || focus.includes('retro')) return 'vintage';
        if (focus.includes('futuristic') || name.includes('sci-fi')) return 'futuristic';
        if (focus.includes('rustic') || focus.includes('natural')) return 'rustic';
        
        return 'minimalist'; // Default
    }
    
    /**
     * Apply style-specific transformations
     */
    applyStyleModifiers(vls, style) {
        const modifier = this.styleModifiers[style];
        let result = vls;
        
        // Node density adjustments
        if (modifier.nodeMultiplier) {
            result = result.replace(/\^(\d+)/g, (match, num) => {
                const newNum = Math.ceil(parseInt(num) * modifier.nodeMultiplier);
                return `^${newNum}`;
            });
        }
        
        // Snap to powers of 2 (industrial precision)
        if (modifier.snapToPowerOf2) {
            result = result.replace(/\^(\d+)/g, (match, num) => {
                const n = parseInt(num);
                const powerOf2 = Math.pow(2, Math.round(Math.log2(n)));
                return `^${powerOf2}`;
            });
        }
        
        // Straighten curves (industrial/minimalist)
        if (modifier.straightenCurves) {
            result = result.replace(/BA/g, 'A');    // Bezier → straight
            result = result.replace(/CC/g, 'Q');    // Curve → extrude
        }
        
        // Add curves (organic)
        if (modifier.addCurves) {
            result = result.replace(/A-A/g, 'BA^8-BA^8');  // Straight → bezier
        }
        
        // Add subdivision (organic)
        if (modifier.subdivisionBoost) {
            result = result + `-S^${modifier.subdivisionBoost}`;
        }
        
        // Lower stance (aerodynamic)
        if (modifier.lowerStance) {
            result = result.replace(/EEE/g, 'EE');
            result = result.replace(/KKK/g, 'KK');
        }
        
        // Add rotation (aerodynamic)
        if (modifier.addRotation) {
            result = result + '-DC-P-P';  // Diagonal scale + rotations
        }
        
        // Add spiral accents (luxury)
        if (modifier.addSuffix) {
            result = result + modifier.addSuffix;
        }
        
        return result;
    }
    
    /**
     * Apply material properties based on personality
     */
    applyMaterialPreferences(vls, profile, style) {
        const modifier = this.styleModifiers[style];
        if (!modifier.materialTemplate) return vls;
        
        // Get color from personality or style
        const color = profile.accentColor || this.getRandomColor(style);
        
        // Replace placeholder in template
        const materialString = modifier.materialTemplate.replace('${color}', color);
        
        return vls + materialString;
    }
    
    /**
     * Apply color palette
     */
    applyColorPalette(vls, profile, style) {
        // If VLS already has a color, replace it
        const hasColor = vls.match(/a\[#[0-9a-fA-F]{6}\]/);
        if (hasColor) {
            const newColor = profile.accentColor || this.getRandomColor(style);
            return vls.replace(/a\[#[0-9a-fA-F]{6}\]/, `a[${newColor}]`);
        }
        return vls;
    }
    
    /**
     * Apply lighting preferences
     */
    applyLightingPreferences(vls, style) {
        const modifier = this.styleModifiers[style];
        if (!modifier.lightingTemplate) return vls;
        
        // Only add if no lighting exists
        if (!vls.match(/\+\d/)) {
            return vls + modifier.lightingTemplate;
        }
        return vls;
    }
    
    /**
     * Get random color from style palette
     */
    getRandomColor(style) {
        const palette = this.colorPalettes[style] || this.colorPalettes.minimalist;
        return palette[Math.floor(Math.random() * palette.length)];
    }
    
    /**
     * Generate VLS from scratch based on personality
     */
    generateVLS(objectType, personalityProfile) {
        console.log(`🎨 Generating VLS for ${objectType} with Personality #${personalityProfile.id}`);
        
        // Base templates for common objects
        const baseTemplates = {
            'office_chair': 'EEE-AC-QQQ-AA-AA-BE',
            'dining_chair': 'EEE-AC-QQ-AA-AA-BE',
            'sofa': 'EE-ACCC-QQQ-AA-AA-BE',
            'table': 'EEE-ACCC-Q-AA',
            'desk': 'EEE-ACCC-Q',
            'lamp': 'E-Q-EE-Q',
            'plant': 'E-AE-AE-AE',
            'car': 'EE-ACCC-DA-AA-AA',
            'building': 'EEEEEE-ACCC-Q-Q-Q'
        };
        
        // Get base template
        const base = baseTemplates[objectType] || baseTemplates['office_chair'];
        
        // Morph it with personality
        return this.morphVLS(base, personalityProfile);
    }
    
    /**
     * Batch morph multiple objects
     */
    batchMorph(objects, personalityProfile) {
        return objects.map(obj => ({
            ...obj,
            vls: this.morphVLS(obj.vls || this.generateVLS(obj.type, personalityProfile), personalityProfile),
            personalityId: personalityProfile.id,
            personalityName: personalityProfile.name
        }));
    }
    
    /**
     * Create LOD variants
     */
    createLODVariants(baseVLS, levels = [16, 8, 4, 2]) {
        return levels.map((level, index) => {
            let lod = baseVLS;
            
            // Reduce node density
            lod = lod.replace(/\^(\d+)/g, (match, num) => {
                const reduced = Math.max(level, Math.ceil(parseInt(num) * (level / levels[0])));
                return `^${reduced}`;
            });
            
            // Remove details at lower LODs
            if (index > 0) {
                lod = lod.replace(/-AE/g, '');           // Remove spirals
                lod = lod.replace(/-BE\^\d+/g, '-BE^2'); // Simplify bevels
            }
            if (index > 1) {
                lod = lod.replace(/-S\^\d+/g, '');       // Remove subdivision
                lod = lod.replace(/-CC/g, '');           // Remove curves
            }
            if (index > 2) {
                lod = lod.replace(/-AA\^\d+/g, '-AA^2'); // Minimal armrests
            }
            
            return {
                level: index,
                distance: [0, 10, 50, 100][index],
                vls: lod,
                complexity: this.calculateComplexity(lod)
            };
        });
    }
    
    /**
     * Calculate VLS complexity score
     */
    calculateComplexity(vls) {
        let score = 0;
        
        // Count operations
        score += (vls.match(/-/g) || []).length * 5;
        
        // Count power operations
        const powers = vls.match(/\^(\d+)/g);
        if (powers) {
            powers.forEach(p => {
                score += parseInt(p.slice(1));
            });
        }
        
        // Triple ops are most complex
        score += (vls.match(/[A-Z]{3}/g) || []).length * 50;
        
        // Double ops are medium
        score += (vls.match(/[A-Z]{2}/g) || []).length * 20;
        
        return score;
    }
    
    /**
     * Optimize VLS for transmission
     */
    optimize(vls) {
        let optimized = vls;
        
        // Merge consecutive same operations: AAA → A^3
        optimized = optimized.replace(/([A-Z])\1\1+/g, (match, char) => {
            return `${char}^${match.length}`;
        });
        
        // Remove redundant resets
        optimized = optimized.replace(/-Z-Z/g, '-Z');
        
        // Combine material operations
        optimized = optimized.replace(/\+m([0-9.]+)\+r([0-9.]+)/g, '+m$1r$2');
        
        return optimized;
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalityMorpher;
}
