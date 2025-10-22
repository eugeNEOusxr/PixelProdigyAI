// PixelProdigy Blockchain Node
// Run with: cargo run --bin pixelchain-node

use std::sync::Arc;
use tokio::sync::RwLock;
use pixelchain::{Blockchain, GeneCompressor, Transaction, TransactionType, GeneObject3D, ObjectMetadata, Validator};
use chrono::Utc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("╔════════════════════════════════════════════════════════════╗");
    println!("║  🧬 PIXELPRODIGY BLOCKCHAIN NODE                          ║");
    println!("║  Gene-Compressed 3D Object Ledger                         ║");
    println!("║  Built by Eugene Ousos - Day 1 of Cleanliness            ║");
    println!("╚════════════════════════════════════════════════════════════╝");
    println!();

    // Initialize blockchain
    let mut chain = Blockchain::new();
    println!("✅ Blockchain initialized (Genesis block created)");
    println!("   Height: {}", chain.height());
    println!();

    // Demo: Create a gene-compressed 3D cube
    println!("🧬 DEMO: Creating gene-compressed 3D cube...");
    
    let compressor = GeneCompressor::new(2);
    
    // Cube vertices (8 corners)
    let cube_vertices = vec![
        (-1.0, -1.0, -1.0), (1.0, -1.0, -1.0),
        (1.0, 1.0, -1.0),   (-1.0, 1.0, -1.0),
        (-1.0, -1.0, 1.0),  (1.0, -1.0, 1.0),
        (1.0, 1.0, 1.0),    (-1.0, 1.0, 1.0),
    ];
    
    let gene_data = compressor.compress_vertices(&cube_vertices);
    println!("   Vertices: {}", cube_vertices.len());
    println!("   Original size: {} bytes", cube_vertices.len() * 12);
    println!("   Compressed: {} bytes", gene_data.len());
    println!("   Gene sequence: {}", &gene_data[0..30.min(gene_data.len())]);
    println!();

    // Create transaction
    let gene_object = GeneObject3D {
        id: compressor.hash_gene(&gene_data),
        creator: [1u8; 32],
        gene_data: gene_data.clone(),
        metadata: ObjectMetadata {
            name: "Demo Cube".to_string(),
            category: "primitive".to_string(),
            color: 0xFF6B35, // Orange
            ai_personality: Some("geometric_builder".to_string()),
            precision: 2,
            tags: vec!["demo".to_string(), "cube".to_string()],
        },
        created_at: Utc::now(),
        vertex_count: cube_vertices.len(),
        compressed_size: gene_data.len(),
        original_size: cube_vertices.len() * 12,
    };

    let tx = Transaction::new(
        TransactionType::CreateObject(gene_object),
        [1u8; 32],  // Demo sender
        [1u8; 64],  // Demo signature
        100,        // 100 PIXEL fee
    );

    println!("📝 Transaction created:");
    println!("   ID: {:x}", tx.id[0..4].iter().fold(0u32, |acc, &b| acc * 256 + b as u32));
    println!("   Type: CreateObject");
    println!("   Fee: {} PIXEL", tx.fee);
    println!();

    // Add to transaction pool
    chain.add_transaction(tx)?;
    println!("✅ Transaction added to pool");
    println!();

    // Mine block
    println!("⛏️  Mining block...");
    let validator = Validator::new([2u8; 32], 10000);
    let block = chain.mine_block(validator.pubkey, [2u8; 64])?;
    
    println!("✅ Block mined!");
    println!("   Height: {}", block.height);
    println!("   Hash: {:x}", block.hash[0..4].iter().fold(0u32, |acc, &b| acc * 256 + b as u32));
    println!("   Transactions: {}", block.transactions.len());
    println!("   Objects created: {}", block.gene_stats.objects_created);
    println!("   Total vertices: {}", block.gene_stats.total_vertices);
    println!();

    // Verify chain
    println!("🔍 Verifying blockchain...");
    if chain.verify_chain() {
        println!("✅ Chain verification: PASSED");
    } else {
        println!("❌ Chain verification: FAILED");
    }
    println!();

    // Display chain stats
    let stats = chain.stats();
    println!("📊 BLOCKCHAIN STATISTICS:");
    println!("   Height: {}", stats.height);
    println!("   Total transactions: {}", stats.total_transactions);
    println!("   Gene objects: {}", stats.total_gene_objects);
    println!("   Total vertices: {}", stats.total_vertices);
    println!("   Bytes saved: {} KB", stats.total_bytes_saved / 1024);
    println!();

    // Test decompression
    println!("🔬 Testing decompression...");
    let decompressed = compressor.decompress_vertices(&gene_data);
    println!("   Decompressed vertices: {}", decompressed.len());
    println!("   First vertex: ({:.2}, {:.2}, {:.2})", 
        decompressed[0].0, decompressed[0].1, decompressed[0].2);
    println!();

    println!("🎉 Demo complete! Chain is ready for use.");
    println!();
    println!("💡 Next steps:");
    println!("   1. Integrate with SkyRelics (save buildings to chain)");
    println!("   2. Deploy Solana bridge program");
    println!("   3. Connect Phantom wallet");
    println!("   4. Launch P2P network");
    
    Ok(())
}
