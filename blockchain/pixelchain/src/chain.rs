// Blockchain implementation for PixelProdigy

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

use crate::{Block, Transaction, Hash, TransactionPool};

#[derive(Debug)]
pub struct Blockchain {
    /// Chain of blocks
    blocks: Vec<Block>,
    
    /// Transaction pool for pending transactions
    tx_pool: TransactionPool,
    
    /// Index: object_id -> block_height (for quick lookups)
    object_index: HashMap<String, u64>,
    
    /// Index: user_pubkey -> created_objects
    user_index: HashMap<String, Vec<String>>,
    
    /// Current difficulty for consensus
    difficulty: u32,
}

impl Blockchain {
    /// Create new blockchain with genesis block
    pub fn new() -> Self {
        let genesis = Block::genesis();
        Self {
            blocks: vec![genesis],
            tx_pool: TransactionPool::new(10000),
            object_index: HashMap::new(),
            user_index: HashMap::new(),
            difficulty: 1,
        }
    }

    /// Add transaction to pool
    pub fn add_transaction(&mut self, tx: Transaction) -> Result<(), String> {
        self.tx_pool.add(tx)
    }

    /// Mine new block (called by validator)
    pub fn mine_block(&mut self, validator: [u8; 32], signature: [u8; 64]) -> Result<Block, String> {
        if self.tx_pool.is_empty() {
            return Err("No transactions to mine".to_string());
        }

        let transactions: Vec<Transaction> = self.tx_pool.get_pending().to_vec();
        let previous_hash = self.get_latest_block().hash;
        let height = self.height();

        let block = Block::new(height, transactions, previous_hash, validator, signature);

        // Verify block before adding
        if !block.verify() {
            return Err("Invalid block".to_string());
        }

        // Update indices
        for tx in &block.transactions {
            if let Some(gene_data) = tx.get_gene_data() {
                let obj_id = format!("{:x}", tx.id[0..8].iter().fold(0u64, |acc, &b| acc * 256 + b as u64));
                self.object_index.insert(obj_id.clone(), block.height);
                
                let user_key = hex::encode(&tx.sender);
                self.user_index.entry(user_key).or_insert_with(Vec::new).push(obj_id);
            }
        }

        // Clear mined transactions from pool
        for tx in &block.transactions {
            self.tx_pool.remove(&tx.id);
        }

        self.blocks.push(block.clone());
        Ok(block)
    }

    /// Get latest block
    pub fn get_latest_block(&self) -> &Block {
        self.blocks.last().unwrap()
    }

    /// Get block by height
    pub fn get_block(&self, height: u64) -> Option<&Block> {
        self.blocks.get(height as usize)
    }

    /// Get current chain height
    pub fn height(&self) -> u64 {
        self.blocks.len() as u64
    }

    /// Verify entire chain
    pub fn verify_chain(&self) -> bool {
        // Check genesis block
        if self.blocks.is_empty() || self.blocks[0].height != 0 {
            return false;
        }

        // Verify each block and its link to previous
        for i in 1..self.blocks.len() {
            let current = &self.blocks[i];
            let previous = &self.blocks[i - 1];

            // Check height sequence
            if current.height != previous.height + 1 {
                return false;
            }

            // Check hash chain
            if current.previous_hash != previous.hash {
                return false;
            }

            // Verify block integrity
            if !current.verify() {
                return false;
            }
        }

        true
    }

    /// Get objects created by user
    pub fn get_user_objects(&self, user_pubkey: &str) -> Vec<String> {
        self.user_index.get(user_pubkey).cloned().unwrap_or_default()
    }

    /// Find block containing object
    pub fn find_object_block(&self, object_id: &str) -> Option<&Block> {
        self.object_index.get(object_id)
            .and_then(|&height| self.get_block(height))
    }

    /// Get total gene objects on chain
    pub fn total_gene_objects(&self) -> usize {
        self.object_index.len()
    }

    /// Get chain statistics
    pub fn stats(&self) -> ChainStats {
        let mut total_txs = 0;
        let mut total_objects = 0;
        let mut total_vertices = 0;
        let mut total_bytes_saved = 0;

        for block in &self.blocks {
            total_txs += block.transactions.len();
            total_objects += block.gene_stats.objects_created;
            total_vertices += block.gene_stats.total_vertices;
            total_bytes_saved += block.gene_stats.bytes_saved;
        }

        ChainStats {
            height: self.height(),
            total_transactions: total_txs,
            total_gene_objects: total_objects as usize,
            total_vertices,
            total_bytes_saved,
            pending_transactions: self.tx_pool.len(),
        }
    }

    /// Export chain to JSON
    pub fn export_json(&self) -> String {
        serde_json::to_string_pretty(&self.blocks).unwrap()
    }

    /// Get state root for Solana anchoring
    pub fn get_state_root(&self) -> Hash {
        self.get_latest_block().hash
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainStats {
    pub height: u64,
    pub total_transactions: usize,
    pub total_gene_objects: usize,
    pub total_vertices: usize,
    pub total_bytes_saved: usize,
    pub pending_transactions: usize,
}

impl Default for Blockchain {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_blockchain_creation() {
        let chain = Blockchain::new();
        assert_eq!(chain.height(), 1);
        assert!(chain.verify_chain());
    }

    #[test]
    fn test_chain_verification() {
        let chain = Blockchain::new();
        assert!(chain.verify_chain());
    }
}
