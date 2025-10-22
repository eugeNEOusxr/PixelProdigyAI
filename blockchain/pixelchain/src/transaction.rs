// Transaction types for gene-compressed 3D objects

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use chrono::{DateTime, Utc};

use crate::{Hash, PublicKey, Signature};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    /// Create a new 3D object with gene-compressed data
    CreateObject(GeneObject3D),
    
    /// Transfer ownership of a 3D object
    TransferObject {
        object_id: String,
        from: PublicKey,
        to: PublicKey,
    },
    
    /// Update object metadata (color, name, etc.)
    UpdateMetadata {
        object_id: String,
        metadata: ObjectMetadata,
    },
    
    /// Educational achievement (unlock tool, complete lesson)
    LearnSkill {
        user: PublicKey,
        skill_id: String,
        proof_data: Vec<u8>,
    },
    
    /// Mint achievement token
    MintAchievement {
        recipient: PublicKey,
        achievement_type: String,
        metadata: String,
    },
    
    /// Recovery milestone (privacy-preserving)
    RecoveryCheckpoint {
        user_hash: Hash, // Anonymous user ID
        milestone: u32,  // Day count
        encrypted_note: Vec<u8>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneObject3D {
    /// Unique identifier (gene hash)
    pub id: String,
    
    /// Creator's public key
    pub creator: PublicKey,
    
    /// Gene-compressed vertex data
    pub gene_data: String,
    
    /// Object metadata
    pub metadata: ObjectMetadata,
    
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    
    /// Compression stats
    pub vertex_count: usize,
    pub compressed_size: usize,
    pub original_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectMetadata {
    pub name: String,
    pub category: String,
    pub color: u32, // RGB hex
    pub ai_personality: Option<String>,
    pub precision: u8,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    /// Transaction ID (hash of content)
    pub id: Hash,
    
    /// Transaction type and data
    pub tx_type: TransactionType,
    
    /// Timestamp
    pub timestamp: DateTime<Utc>,
    
    /// Sender's public key
    pub sender: PublicKey,
    
    /// Digital signature
    pub signature: Signature,
    
    /// Gas fee (in PIXEL tokens)
    pub fee: u64,
}

impl Transaction {
    pub fn new(
        tx_type: TransactionType,
        sender: PublicKey,
        signature: Signature,
        fee: u64,
    ) -> Self {
        let timestamp = Utc::now();
        let mut tx = Self {
            id: [0u8; 32],
            tx_type,
            timestamp,
            sender,
            signature,
            fee,
        };
        tx.id = tx.calculate_hash();
        tx
    }

    /// Calculate transaction hash
    pub fn calculate_hash(&self) -> Hash {
        let mut hasher = Sha256::new();
        hasher.update(bincode::serialize(&self.tx_type).unwrap());
        hasher.update(self.timestamp.to_rfc3339());
        hasher.update(&self.sender);
        hasher.update(&self.signature);
        hasher.update(&self.fee.to_le_bytes());
        
        let result = hasher.finalize();
        let mut hash = [0u8; 32];
        hash.copy_from_slice(&result);
        hash
    }

    /// Verify transaction signature (simplified)
    pub fn verify(&self) -> bool {
        // TODO: Implement Ed25519 signature verification
        // For now, just check that signature is not empty
        self.signature != [0u8; 64]
    }

    /// Get transaction size in bytes
    pub fn size(&self) -> usize {
        bincode::serialize(self).unwrap().len()
    }

    /// Check if transaction creates a 3D object
    pub fn is_object_creation(&self) -> bool {
        matches!(self.tx_type, TransactionType::CreateObject(_))
    }

    /// Extract gene data if this is an object creation
    pub fn get_gene_data(&self) -> Option<&str> {
        match &self.tx_type {
            TransactionType::CreateObject(obj) => Some(&obj.gene_data),
            _ => None,
        }
    }
}

/// Transaction pool for pending transactions
#[derive(Debug, Default)]
pub struct TransactionPool {
    pending: Vec<Transaction>,
    max_size: usize,
}

impl TransactionPool {
    pub fn new(max_size: usize) -> Self {
        Self {
            pending: Vec::new(),
            max_size,
        }
    }

    pub fn add(&mut self, tx: Transaction) -> Result<(), String> {
        if self.pending.len() >= self.max_size {
            return Err("Transaction pool full".to_string());
        }
        
        if !tx.verify() {
            return Err("Invalid transaction signature".to_string());
        }
        
        self.pending.push(tx);
        Ok(())
    }

    pub fn get_pending(&self) -> &[Transaction] {
        &self.pending
    }

    pub fn remove(&mut self, tx_id: &Hash) {
        self.pending.retain(|tx| tx.id != *tx_id);
    }

    pub fn clear(&mut self) {
        self.pending.clear();
    }

    pub fn len(&self) -> usize {
        self.pending.len()
    }

    pub fn is_empty(&self) -> bool {
        self.pending.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transaction_hash() {
        let tx = Transaction::new(
            TransactionType::CreateObject(GeneObject3D {
                id: "test".to_string(),
                creator: [1u8; 32],
                gene_data: "ATG-CCG".to_string(),
                metadata: ObjectMetadata {
                    name: "Test Cube".to_string(),
                    category: "primitive".to_string(),
                    color: 0xFF0000,
                    ai_personality: None,
                    precision: 2,
                    tags: vec!["test".to_string()],
                },
                created_at: Utc::now(),
                vertex_count: 8,
                compressed_size: 24,
                original_size: 96,
            }),
            [1u8; 32],
            [1u8; 64],
            100,
        );
        
        assert_ne!(tx.id, [0u8; 32]);
    }
}
