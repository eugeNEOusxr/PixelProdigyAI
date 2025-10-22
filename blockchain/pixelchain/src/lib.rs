// PixelProdigy App-Chain - Gene-Compressed 3D Object Blockchain
// Built by Eugene Ousos - Day 1 of Cleanliness (10/21/2025)

pub mod block;
pub mod chain;
pub mod transaction;
pub mod consensus;
pub mod network;
pub mod gene;

pub use block::Block;
pub use chain::Blockchain;
pub use transaction::{Transaction, TransactionType, GeneObject3D};
pub use consensus::Validator;
pub use gene::GeneCompressor;

// Re-export commonly used types
pub type Hash = [u8; 32];
pub type PublicKey = [u8; 32];
pub type Signature = [u8; 64];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chain_creation() {
        let chain = Blockchain::new();
        assert_eq!(chain.height(), 1); // Genesis block
    }
}
