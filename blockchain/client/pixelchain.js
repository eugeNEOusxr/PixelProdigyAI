// PixelChain JavaScript Client
// Browser integration for SkyRelics

class PixelChain {
    constructor(nodeUrl = 'http://localhost:8080') {
        this.nodeUrl = nodeUrl;
        this.wallet = null;
    }

    // ═══════════════════════════════════════════════════════════
    // GENE COMPRESSION (Client-side)
    // ═══════════════════════════════════════════════════════════

    /**
     * Compress Three.js geometry into gene string
     * @param {THREE.BufferGeometry} geometry
     * @param {number} precision - Decimal places (default: 2)
     * @returns {string} Gene sequence
     */
    compressGeometry(geometry, precision = 2) {
        const positions = geometry.attributes.position.array;
        const vertices = [];
        
        // Extract vertices
        for (let i = 0; i < positions.length; i += 3) {
            vertices.push([
                positions[i],
                positions[i + 1],
                positions[i + 2]
            ]);
        }
        
        return this.compressVertices(vertices, precision);
    }

    /**
     * Compress vertex array to gene string
     * @param {Array<[number, number, number]>} vertices
     * @param {number} precision
     * @returns {string} Gene sequence like "ATG-CCG-GTA"
     */
    compressVertices(vertices, precision = 2) {
        const GENE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let geneSequence = '';
        
        for (let i = 0; i < vertices.length; i++) {
            const [x, y, z] = vertices[i];
            
            // Quantize to precision
            const qx = Math.round(x * Math.pow(10, precision));
            const qy = Math.round(y * Math.pow(10, precision));
            const qz = Math.round(z * Math.pow(10, precision));
            
            // Encode as codon (3 characters)
            const xChar = GENE_ALPHABET[Math.abs(qx) % 64];
            const yChar = GENE_ALPHABET[Math.abs(qy) % 64];
            const zChar = GENE_ALPHABET[Math.abs(qz) % 64];
            
            geneSequence += `${xChar}${yChar}${zChar}`;
            
            // Add separator every 3 codons
            if ((i + 1) % 3 === 0 && i < vertices.length - 1) {
                geneSequence += '-';
            }
        }
        
        return geneSequence;
    }

    /**
     * Decompress gene string back to vertices
     * @param {string} geneString
     * @param {number} precision
     * @returns {Array<[number, number, number]>}
     */
    decompressVertices(geneString, precision = 2) {
        const GENE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        const codons = geneString.split('-');
        const vertices = [];
        const divisor = Math.pow(10, precision);
        
        for (const codonGroup of codons) {
            for (let i = 0; i < codonGroup.length; i += 3) {
                const xChar = codonGroup[i];
                const yChar = codonGroup[i + 1];
                const zChar = codonGroup[i + 2];
                
                if (xChar && yChar && zChar) {
                    const x = GENE_ALPHABET.indexOf(xChar) / divisor;
                    const y = GENE_ALPHABET.indexOf(yChar) / divisor;
                    const z = GENE_ALPHABET.indexOf(zChar) / divisor;
                    
                    vertices.push([x, y, z]);
                }
            }
        }
        
        return vertices;
    }

    /**
     * Calculate gene hash
     */
    async hashGene(geneString) {
        const encoder = new TextEncoder();
        const data = encoder.encode(geneString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ═══════════════════════════════════════════════════════════
    // BLOCKCHAIN OPERATIONS
    // ═══════════════════════════════════════════════════════════

    /**
     * Save 3D object to blockchain
     * @param {THREE.Object3D} object3D
     * @param {Object} metadata
     * @returns {Promise<{txId, blockHeight}>}
     */
    async saveObject(object3D, metadata = {}) {
        // Compress geometry
        const geneData = this.compressGeometry(object3D.geometry);
        const geneHash = await this.hashGene(geneData);
        
        // Calculate stats
        const vertexCount = object3D.geometry.attributes.position.count;
        const originalSize = vertexCount * 12; // 3 floats × 4 bytes
        const compressedSize = geneData.length;
        
        // Create transaction
        const transaction = {
            type: 'CreateObject',
            data: {
                id: geneHash,
                creator: this.wallet?.publicKey || '0'.repeat(64),
                gene_data: geneData,
                metadata: {
                    name: metadata.name || object3D.name || 'Unnamed Object',
                    category: metadata.category || 'architecture',
                    color: object3D.material?.color?.getHex() || 0xFFFFFF,
                    ai_personality: metadata.aiPersonality || null,
                    precision: 2,
                    tags: metadata.tags || []
                },
                vertex_count: vertexCount,
                compressed_size: compressedSize,
                original_size: originalSize
            },
            sender: this.wallet?.publicKey || '0'.repeat(64),
            signature: '0'.repeat(128), // TODO: Real signing
            fee: 100
        };
        
        // Submit to node
        const response = await fetch(`${this.nodeUrl}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit transaction');
        }
        
        const result = await response.json();
        
        console.log('✅ Object saved to blockchain!');
        console.log(`   TX: ${result.txId}`);
        console.log(`   Compressed: ${originalSize} → ${compressedSize} bytes`);
        console.log(`   Ratio: ${(originalSize / compressedSize).toFixed(2)}:1`);
        
        return result;
    }

    /**
     * Get blockchain statistics
     */
    async getStats() {
        const response = await fetch(`${this.nodeUrl}/stats`);
        return await response.json();
    }

    /**
     * Get user's objects
     */
    async getUserObjects(publicKey) {
        const response = await fetch(`${this.nodeUrl}/user/${publicKey}/objects`);
        return await response.json();
    }

    /**
     * Verify chain integrity
     */
    async verifyChain() {
        const response = await fetch(`${this.nodeUrl}/verify`);
        const result = await response.json();
        return result.valid;
    }

    // ═══════════════════════════════════════════════════════════
    // WALLET INTEGRATION
    // ═══════════════════════════════════════════════════════════

    /**
     * Connect Phantom wallet
     */
    async connectWallet() {
        if (!window.solana) {
            throw new Error('Phantom wallet not found');
        }
        
        const response = await window.solana.connect();
        this.wallet = {
            publicKey: response.publicKey.toString()
        };
        
        console.log('✅ Wallet connected:', this.wallet.publicKey);
        return this.wallet;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.PixelChain = PixelChain;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PixelChain };
}
