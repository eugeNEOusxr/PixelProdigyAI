// Block structure for PixelProdigy blockchain

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use chrono::{DateTime, Utc};

use crate::{Hash, Transaction};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    /// Block height (index in chain)
    pub height: u64,
    
    /// Timestamp when block was created
    pub timestamp: DateTime<Utc>,
    
    /// Transactions in this block
    pub transactions: Vec<Transaction>,
    
    /// Hash of previous block
    pub previous_hash: Hash,
    
    /// Merkle root of transactions
    pub merkle_root: Hash,
    
    /// Block hash
    pub hash: Hash,
    
    /// Validator who created this block
    pub validator: [u8; 32],
    
    /// Validator signature
    pub signature: [u8; 64],
    
    /// Gene compression statistics for this block
    pub gene_stats: GeneStats,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GeneStats {
    /// Total 3D objects created in this block
    pub objects_created: u32,
    
    /// Total vertices compressed
    pub total_vertices: usize,
    
    /// Total bytes saved by compression
    pub bytes_saved: usize,
    
    /// Average compression ratio
    pub avg_compression_ratio: f32,
}

impl Block {
    /// Create genesis block (first block in chain)
    pub fn genesis() -> Self {
        let timestamp = Utc::now();
        let mut block = Self {
            height: 0,
            timestamp,
            transactions: vec![],
            previous_hash: [0u8; 32],
            merkle_root: [0u8; 32],
            hash: [0u8; 32],
            validator: [0u8; 32],
            signature: [0u8; 64],
            gene_stats: GeneStats::default(),
        };
        block.hash = block.calculate_hash();
        block
    }

    /// Create new block from transactions
    pub fn new(
        height: u64,
        transactions: Vec<Transaction>,
        previous_hash: Hash,
        validator: [u8; 32],
        signature: [u8; 64],
    ) -> Self {
        let timestamp = Utc::now();
        let merkle_root = Self::calculate_merkle_root(&transactions);
        let gene_stats = Self::calculate_gene_stats(&transactions);
        
        let mut block = Self {
            height,
            timestamp,
            transactions,
            previous_hash,
            merkle_root,
            hash: [0u8; 32],
            validator,
            signature,
            gene_stats,
        };
        block.hash = block.calculate_hash();
        block
    }

    /// Calculate block hash
    pub fn calculate_hash(&self) -> Hash {
        let mut hasher = Sha256::new();
        hasher.update(&self.height.to_le_bytes());
        hasher.update(self.timestamp.to_rfc3339());
        hasher.update(&self.previous_hash);
        hasher.update(&self.merkle_root);
        hasher.update(&self.validator);
        
        let result = hasher.finalize();
        let mut hash = [0u8; 32];
        hash.copy_from_slice(&result);
        hash
    }

    /// Calculate Merkle root of transactions
    fn calculate_merkle_root(transactions: &[Transaction]) -> Hash {
        if transactions.is_empty() {
            return [0u8; 32];
        }
        
        let mut hashes: Vec<Hash> = transactions.iter().map(|tx| tx.id).collect();
        
        while hashes.len() > 1 {
            let mut next_level = Vec::new();
            for chunk in hashes.chunks(2) {
                let mut hasher = Sha256::new();
                hasher.update(&chunk[0]);
                if chunk.len() > 1 {
                    hasher.update(&chunk[1]);
                }
                let result = hasher.finalize();
                let mut hash = [0u8; 32];
                hash.copy_from_slice(&result);
                next_level.push(hash);
            }
            hashes = next_level;
        }
        
        hashes[0]
    }

    /// Calculate gene compression stats for block
    fn calculate_gene_stats(transactions: &[Transaction]) -> GeneStats {
        let mut stats = GeneStats::default();
        
        for tx in transactions {
            if let Some(gene_data) = tx.get_gene_data() {
                stats.objects_created += 1;
                // Parse gene stats from transaction
                // This is simplified - real impl would extract from GeneObject3D
                stats.total_vertices += gene_data.len() / 3; // Rough estimate
                stats.bytes_saved += gene_data.len() * 4; // Rough estimate
            }
        }
        
        if stats.objects_created > 0 {
            stats.avg_compression_ratio = stats.bytes_saved as f32 / (stats.total_vertices * 12) as f32;
        }
        
        stats
    }

    /// Verify block integrity
    pub fn verify(&self) -> bool {
        // Check hash matches
        let calculated_hash = self.calculate_hash();
        if calculated_hash != self.hash {
            return false;
        }
        
        // Check merkle root
        let calculated_merkle = Self::calculate_merkle_root(&self.transactions);
        if calculated_merkle != self.merkle_root {
            return false;
        }
        
        // Verify all transactions
        for tx in &self.transactions {
            if !tx.verify() {
                return false;
            }
        }
        
        true
    }

    /// Get total transaction fees in block
    pub fn total_fees(&self) -> u64 {
        self.transactions.iter().map(|tx| tx.fee).sum()
    }

    /// Get block size in bytes
    pub fn size(&self) -> usize {
        bincode::serialize(self).unwrap().len()
    }

    /// Check if block contains object creation transactions
    pub fn has_gene_objects(&self) -> bool {
        self.transactions.iter().any(|tx| tx.is_object_creation())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_genesis_block() {
        let genesis = Block::genesis();
        assert_eq!(genesis.height, 0);
        assert_eq!(genesis.previous_hash, [0u8; 32]);
        assert!(genesis.verify());
    }

    #[test]
    fn test_block_hash() {
        let genesis = Block::genesis();
        let calculated = genesis.calculate_hash();
        assert_eq!(genesis.hash, calculated);
    }
}
