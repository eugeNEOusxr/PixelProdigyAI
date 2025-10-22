# PixelProdigy Blockchain Integration

Complete blockchain infrastructure for gene-compressed 3D objects.

## 📁 Structure

```
blockchain/
├── pixelchain/          # Rust blockchain node
│   ├── src/
│   │   ├── gene.rs     # Gene compression
│   │   ├── chain.rs    # Blockchain core
│   │   ├── consensus.rs # Proof-of-Stake
│   │   └── network.rs  # P2P layer
│   └── Cargo.toml
│
├── solana-bridge/       # Solana anchor program (coming soon)
│   ├── programs/
│   │   └── pixel-bridge/
│   └── Anchor.toml
│
└── client/              # JavaScript client library
    ├── pixelchain.js   # Browser integration
    └── package.json
```

## 🚀 Quick Start

### 1. Run Blockchain Node
```bash
cd pixelchain
cargo run --bin pixelchain-node
```

### 2. Test Gene Compression
```bash
cd pixelchain
cargo test gene
```

### 3. Integrate with SkyRelics
```javascript
import { PixelChain } from './client/pixelchain.js';

const chain = new PixelChain('http://localhost:8080');
await chain.saveObject(building3D);
```

## 📚 Documentation

See individual README files:
- [PixelChain Node](./pixelchain/README.md)
- [Solana Bridge](./solana-bridge/README.md) (coming soon)
- [JavaScript Client](./client/README.md) (coming soon)

## 🎯 Vision

**PixelProdigy App-Chain**: A custom blockchain where:
- Every 3D building is an NFT (gene-compressed)
- Educational progress is on-chain (skill badges)
- Recovery milestones are private but verifiable
- Anchored to Solana for security and liquidity

Built by Eugene Ousos - Day 1 of Cleanliness 🌟
