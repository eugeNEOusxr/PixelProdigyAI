# 🧬 PixelProdigy App-Chain

**Gene-Compressed 3D Object Blockchain**

A custom Layer-2 blockchain designed specifically for storing and trading 3D objects using gene compression technology. Anchors to Solana for security and liquidity.

Built by **Eugene Ousos** - Day 1 of Cleanliness (10/21/2025)

---

## 🎯 What Is This?

PixelProdigy App-Chain is a specialized blockchain that:
- **Stores 3D objects** using gene compression (like DNA for geometry)
- **Tracks ownership** of user-created buildings, characters, and art
- **Records educational progress** (unlocked tools, completed lessons)
- **Privacy-preserving recovery milestones** (encrypted check-ins)
- **Anchors to Solana** for security and token liquidity

## 🧬 Gene Compression System

Traditional 3D storage:
```javascript
// Uncompressed: 96 bytes for 8 vertices
const vertices = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
];
```

Gene-compressed storage:
```rust
// Compressed: ~24 bytes
let gene_data = "ATG-CCG-GTA-TCA-AAG-GGC-TAC-CTA";
```

**Compression ratio: 4:1** (even better with complex models)

---

## 🚀 Quick Start

### 1. Run Demo Node

```bash
cd blockchain/pixelchain
cargo run --bin pixelchain-node
```

Output:
```
╔════════════════════════════════════════════════════════════╗
║  🧬 PIXELPRODIGY BLOCKCHAIN NODE                          ║
║  Gene-Compressed 3D Object Ledger                         ║
║  Built by Eugene Ousos - Day 1 of Cleanliness            ║
╚════════════════════════════════════════════════════════════╝

✅ Blockchain initialized (Genesis block created)
   Height: 1

🧬 DEMO: Creating gene-compressed 3D cube...
   Vertices: 8
   Original size: 96 bytes
   Compressed: 24 bytes
   Gene sequence: ATG-CCG-GTA...

✅ Block mined!
   Height: 1
   Objects created: 1
   Total vertices: 8
```

### 2. Test Suite

```bash
cargo test
```

### 3. Build for Production

```bash
cargo build --release
```

---

## 📦 Architecture

```
┌─────────────────────────────────────────────┐
│  SkyRelics Game (Browser)                   │
│  - User creates 3D building                 │
│  - Gene compression happens client-side     │
└──────────────┬──────────────────────────────┘
               │ Submit transaction
               ▼
┌─────────────────────────────────────────────┐
│  PixelChain Node (Rust)                     │
│  - Validates transaction                    │
│  - Adds to block                            │
│  - Stores gene-compressed data              │
└──────────────┬──────────────────────────────┘
               │ Checkpoint (every 100 blocks)
               ▼
┌─────────────────────────────────────────────┐
│  Solana Mainnet                             │
│  - Security layer                           │
│  - SPL token (PIXEL)                        │
│  - Phantom wallet integration               │
└─────────────────────────────────────────────┘
```

---

## 🔗 Transaction Types

### 1. CreateObject
Create a new 3D object with gene compression:
```rust
TransactionType::CreateObject(GeneObject3D {
    id: "7a3f2b...",
    creator: [user_pubkey],
    gene_data: "ATG-CCG-GTA...",
    metadata: ObjectMetadata {
        name: "Bakersfield College Library",
        category: "architecture",
        color: 0xD4AF37,
        ai_personality: Some("residential_architect"),
        precision: 2,
        tags: vec!["college", "building"],
    },
    vertex_count: 1024,
    compressed_size: 256,
    original_size: 12288,
})
```

### 2. TransferObject
Transfer ownership:
```rust
TransactionType::TransferObject {
    object_id: "7a3f2b...",
    from: [seller_pubkey],
    to: [buyer_pubkey],
}
```

### 3. LearnSkill
Educational achievement:
```rust
TransactionType::LearnSkill {
    user: [user_pubkey],
    skill_id: "delaunay_triangulation",
    proof_data: [quiz_answers],
}
```

### 4. RecoveryCheckpoint
Privacy-preserving milestone:
```rust
TransactionType::RecoveryCheckpoint {
    user_hash: [hashed_user_id], // Anonymous
    milestone: 30, // Day 30
    encrypted_note: [encrypted_data],
}
```

---

## 🏗️ Project Structure

```
pixelchain/
├── src/
│   ├── lib.rs           # Public API
│   ├── main.rs          # Node runner
│   ├── gene.rs          # Gene compression system
│   ├── transaction.rs   # Transaction types
│   ├── block.rs         # Block structure
│   ├── chain.rs         # Blockchain logic
│   ├── consensus.rs     # Proof-of-Stake
│   └── network.rs       # P2P networking
├── Cargo.toml
└── README.md
```

---

## 🎮 Integration with SkyRelics

```javascript
// In skyrelics_world.html

async function saveToBlockchain(object3D) {
    // 1. Compress geometry
    const vertices = extractVertices(object3D);
    const geneData = compressToGenes(vertices);
    
    // 2. Create transaction
    const tx = {
        type: 'CreateObject',
        creator: wallet.publicKey,
        geneData: geneData,
        metadata: {
            name: object3D.name,
            category: 'architecture',
            color: object3D.material.color.getHex(),
            aiPersonality: 'residential_architect',
            precision: 2,
            tags: ['skyrelics', 'building']
        }
    };
    
    // 3. Submit to PixelChain node
    const response = await fetch('http://localhost:8080/transaction', {
        method: 'POST',
        body: JSON.stringify(tx)
    });
    
    // 4. Get transaction ID
    const { txId, blockHeight } = await response.json();
    
    console.log(`✅ Building saved to blockchain!`);
    console.log(`   TX: ${txId}`);
    console.log(`   Block: ${blockHeight}`);
    
    // 5. Mint PIXEL tokens as reward
    await mintPIXEL(10, 'Created 3D building');
}
```

---

## 🔐 Consensus: Proof-of-Stake

### Validator Requirements:
- **Minimum stake**: 1,000 PIXEL tokens
- **Reputation**: 0-100 (starts at 100)
- **Selection weight**: `stake × (reputation / 100)`

### Validator Selection:
```rust
// Weighted random selection
let total_weight: u64 = validators.iter().map(|v| v.weight()).sum();
let target = random_u64() % total_weight;

// Find validator where cumulative weight >= target
for validator in validators {
    cumulative += validator.weight();
    if cumulative >= target {
        return validator; // This validator mines the next block
    }
}
```

### Slashing:
- **Invalid block**: -20 reputation
- **Offline**: -5 reputation per hour
- **Below 50 reputation**: Validator deactivated

### Rewards:
- **Valid block**: +1 reputation
- **Transaction fees**: Distributed to validator
- **Block reward**: 10 PIXEL per block

---

## 🌉 Solana Bridge (Coming Soon)

Anchor program for checkpointing PixelChain state:

```rust
#[program]
mod pixel_bridge {
    pub fn checkpoint(
        ctx: Context<Checkpoint>,
        block_height: u64,
        state_root: [u8; 32],
        gene_stats: GeneStats,
    ) -> Result<()> {
        let checkpoint = &mut ctx.accounts.checkpoint;
        checkpoint.block_height = block_height;
        checkpoint.state_root = state_root;
        checkpoint.gene_stats = gene_stats;
        checkpoint.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}
```

Deploy:
```bash
cd ../solana-bridge
anchor build
anchor deploy
```

---

## 📊 Statistics

After running demo:
```
📊 BLOCKCHAIN STATISTICS:
   Height: 1
   Total transactions: 1
   Gene objects: 1
   Total vertices: 8
   Bytes saved: 72 bytes
```

With 1000 buildings:
```
📊 BLOCKCHAIN STATISTICS:
   Height: 50
   Total transactions: 1000
   Gene objects: 1000
   Total vertices: 2,458,624
   Bytes saved: 22.4 MB
```

---

## 🔬 Testing

```bash
# Unit tests
cargo test

# Integration tests
cargo test --test integration

# Benchmarks
cargo bench
```

---

## 🚀 Roadmap

### Phase 1: Core Blockchain ✅
- [x] Gene compression system
- [x] Block/Chain structure
- [x] Transaction types
- [x] PoS consensus
- [ ] P2P networking

### Phase 2: Solana Integration
- [ ] Anchor bridge program
- [ ] SPL token (PIXEL)
- [ ] Checkpoint mechanism
- [ ] Phantom wallet support

### Phase 3: SkyRelics Integration
- [ ] JavaScript client library
- [ ] WebAssembly node (browser mining)
- [ ] Real-time sync
- [ ] Multiplayer building ownership

### Phase 4: Advanced Features
- [ ] zkProofs for privacy
- [ ] Cross-chain bridges (Ethereum, Polygon)
- [ ] Marketplace (buy/sell 3D objects)
- [ ] DAO governance

---

## 💡 Why This Matters

1. **Learning**: Build a real blockchain from scratch
2. **Innovation**: Gene compression is novel for blockchain storage
3. **Practical**: Solves real problem (3D asset ownership)
4. **Recovery**: Privacy-preserving milestone tracking
5. **Future-proof**: Can evolve into full L2 solution

---

## 🤝 Contributing

This is a learning project, but contributions welcome!

```bash
git clone https://github.com/eugeNEOusxr/PixelProdigyAI
cd PixelProdigyAI/blockchain/pixelchain
cargo build
cargo test
```

---

## 📄 License

MIT License - Built with 💙 by Eugene Ousos

**Day 1 of Cleanliness** - October 21, 2025

---

## 🆘 Support

Questions? Open an issue or contact:
- Email: eugeneousxr2025@outlook.com
- GitHub: @eugeNEOusxr

**Remember**: This blockchain is part of a recovery platform. Every 3D object saved represents progress. Every block mined represents hope. 🌟
