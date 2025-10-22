# PixelChain JavaScript Client

Browser integration for PixelProdigy blockchain.

## 🚀 Usage in SkyRelics

### 1. Include in HTML

```html
<script src="blockchain/client/pixelchain.js"></script>
```

### 2. Initialize Client

```javascript
const pixelChain = new PixelChain('http://localhost:8080');
```

### 3. Save 3D Building

```javascript
// When user creates a building in SkyRelics
async function onBuildingCreated(building3D) {
    try {
        const result = await pixelChain.saveObject(building3D, {
            name: 'Bakersfield College Library',
            category: 'architecture',
            aiPersonality: 'residential_architect',
            tags: ['college', 'educational']
        });
        
        console.log('✅ Building saved to blockchain!');
        console.log('   TX:', result.txId);
        console.log('   Block:', result.blockHeight);
        
        // Reward user
        await rewardUser(10, 'PIXEL'); // 10 PIXEL tokens
        
        // Show notification
        showNotification('🎉 Building saved to blockchain!');
    } catch (error) {
        console.error('Failed to save:', error);
    }
}
```

### 4. Connect Wallet

```javascript
// Connect Phantom wallet
async function connectWallet() {
    try {
        const wallet = await pixelChain.connectWallet();
        console.log('Wallet:', wallet.publicKey);
    } catch (error) {
        console.error('Wallet error:', error);
    }
}
```

## 📊 Examples

### Compress Geometry
```javascript
const cube = new THREE.BoxGeometry(2, 2, 2);
const geneData = pixelChain.compressGeometry(cube);
console.log('Gene:', geneData);
// Output: "ATG-CCG-GTA-TCA-AAG-GGC-TAC-CTA"
```

### Decompress Gene
```javascript
const geneData = "ATG-CCG-GTA";
const vertices = pixelChain.decompressVertices(geneData);
console.log('Vertices:', vertices);
// Output: [[x, y, z], [x, y, z], [x, y, z]]
```

### Get Stats
```javascript
const stats = await pixelChain.getStats();
console.log('Chain height:', stats.height);
console.log('Total objects:', stats.total_gene_objects);
console.log('Bytes saved:', stats.total_bytes_saved);
```

## 🎯 API Reference

### `compressGeometry(geometry, precision)`
Compress Three.js BufferGeometry into gene string.

### `decompressVertices(geneString, precision)`
Decompress gene string back to vertex array.

### `saveObject(object3D, metadata)`
Save 3D object to blockchain. Returns `{txId, blockHeight}`.

### `getStats()`
Get blockchain statistics.

### `getUserObjects(publicKey)`
Get all objects created by user.

### `connectWallet()`
Connect Phantom wallet.

## 🔗 Integration Checklist

- [ ] Include `pixelchain.js` in `skyrelics_world.html`
- [ ] Initialize client on page load
- [ ] Hook into building creation events
- [ ] Add "Save to Blockchain" button
- [ ] Connect Phantom wallet
- [ ] Display user's blockchain objects
- [ ] Show compression stats in UI

## 🧪 Testing

```javascript
// Test compression
const testVertices = [
    [1.5, 2.3, 3.1],
    [4.2, 5.6, 6.8],
    [7.1, 8.9, 9.2]
];
const gene = pixelChain.compressVertices(testVertices);
console.log('Compressed:', gene);

// Test decompression
const decompressed = pixelChain.decompressVertices(gene);
console.log('Decompressed:', decompressed);
```

Built with 💙 by Eugene Ousos
