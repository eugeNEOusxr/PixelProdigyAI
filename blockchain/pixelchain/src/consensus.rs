// Proof-of-Stake consensus for PixelProdigy

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::{PublicKey, Hash};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Validator {
    /// Validator's public key
    pub pubkey: PublicKey,
    
    /// Staked PIXEL tokens
    pub stake: u64,
    
    /// Total blocks validated
    pub blocks_validated: u64,
    
    /// Reputation score (0-100)
    pub reputation: u8,
    
    /// Whether validator is active
    pub is_active: bool,
}

impl Validator {
    pub fn new(pubkey: PublicKey, stake: u64) -> Self {
        Self {
            pubkey,
            stake,
            blocks_validated: 0,
            reputation: 100,
            is_active: true,
        }
    }

    /// Calculate validator weight (for selection probability)
    pub fn weight(&self) -> u64 {
        if !self.is_active {
            return 0;
        }
        // Weight = stake × reputation percentage
        (self.stake * self.reputation as u64) / 100
    }
}

#[derive(Debug)]
pub struct ValidatorSet {
    validators: HashMap<String, Validator>,
    min_stake: u64,
}

impl ValidatorSet {
    pub fn new(min_stake: u64) -> Self {
        Self {
            validators: HashMap::new(),
            min_stake,
        }
    }

    /// Register new validator
    pub fn register(&mut self, validator: Validator) -> Result<(), String> {
        if validator.stake < self.min_stake {
            return Err(format!("Stake too low. Minimum: {}", self.min_stake));
        }

        let key = hex::encode(&validator.pubkey);
        self.validators.insert(key, validator);
        Ok(())
    }

    /// Select validator for next block (weighted random)
    pub fn select_validator(&self, seed: &Hash) -> Option<&Validator> {
        let total_weight: u64 = self.validators.values().map(|v| v.weight()).sum();
        if total_weight == 0 {
            return None;
        }

        // Use seed for deterministic selection
        let target = u64::from_le_bytes(seed[0..8].try_into().unwrap()) % total_weight;
        
        let mut cumulative = 0u64;
        for validator in self.validators.values() {
            cumulative += validator.weight();
            if cumulative >= target {
                return Some(validator);
            }
        }

        None
    }

    /// Slash validator (reduce reputation for misbehavior)
    pub fn slash(&mut self, pubkey: &PublicKey, amount: u8) {
        let key = hex::encode(pubkey);
        if let Some(validator) = self.validators.get_mut(&key) {
            validator.reputation = validator.reputation.saturating_sub(amount);
            if validator.reputation < 50 {
                validator.is_active = false;
            }
        }
    }

    /// Reward validator (increase reputation for good behavior)
    pub fn reward(&mut self, pubkey: &PublicKey) {
        let key = hex::encode(pubkey);
        if let Some(validator) = self.validators.get_mut(&key) {
            validator.blocks_validated += 1;
            validator.reputation = (validator.reputation + 1).min(100);
        }
    }

    pub fn get_validator(&self, pubkey: &PublicKey) -> Option<&Validator> {
        let key = hex::encode(pubkey);
        self.validators.get(&key)
    }

    pub fn total_stake(&self) -> u64 {
        self.validators.values().map(|v| v.stake).sum()
    }

    pub fn active_count(&self) -> usize {
        self.validators.values().filter(|v| v.is_active).count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validator_weight() {
        let validator = Validator::new([1u8; 32], 1000);
        assert_eq!(validator.weight(), 1000); // 1000 stake × 100% reputation
    }

    #[test]
    fn test_validator_set() {
        let mut set = ValidatorSet::new(100);
        let validator = Validator::new([1u8; 32], 1000);
        assert!(set.register(validator).is_ok());
        assert_eq!(set.active_count(), 1);
    }
}
