// Gene Compression System for 3D Objects
// Converts Three.js geometry into compact gene sequences

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;

/// Gene alphabet for encoding 3D vertex data
/// Each character represents a specific geometric operation
const GENE_ALPHABET: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneCompressor {
    precision: u8,
    dictionary: HashMap<String, String>,
}

impl GeneCompressor {
    pub fn new(precision: u8) -> Self {
        Self {
            precision,
            dictionary: HashMap::new(),
        }
    }

    /// Compress 3D vertex array into gene string
    /// Input: [(x, y, z), (x, y, z), ...]
    /// Output: "ATG-CCG-GTA-..." (gene sequence)
    pub fn compress_vertices(&self, vertices: &[(f32, f32, f32)]) -> String {
        let mut gene_sequence = String::new();
        
        for (i, (x, y, z)) in vertices.iter().enumerate() {
            // Quantize to precision
            let qx = (x * 10f32.powi(self.precision as i32)).round() as i32;
            let qy = (y * 10f32.powi(self.precision as i32)).round() as i32;
            let qz = (z * 10f32.powi(self.precision as i32)).round() as i32;
            
            // Encode as gene codon (3 characters)
            let codon = self.encode_codon(qx, qy, qz);
            gene_sequence.push_str(&codon);
            
            // Add separator every 3 codons (like DNA base pairs)
            if (i + 1) % 3 == 0 && i < vertices.len() - 1 {
                gene_sequence.push('-');
            }
        }
        
        gene_sequence
    }

    /// Decompress gene string back to vertices
    pub fn decompress_vertices(&self, gene_string: &str) -> Vec<(f32, f32, f32)> {
        let codons: Vec<&str> = gene_string.split('-').collect();
        let mut vertices = Vec::new();
        
        for codon_group in codons {
            let chars: Vec<char> = codon_group.chars().collect();
            for chunk in chars.chunks(3) {
                if chunk.len() == 3 {
                    let (x, y, z) = self.decode_codon(&chunk.iter().collect::<String>());
                    vertices.push((x, y, z));
                }
            }
        }
        
        vertices
    }

    /// Encode 3D coordinate into 3-character gene codon
    fn encode_codon(&self, x: i32, y: i32, z: i32) -> String {
        let x_char = GENE_ALPHABET.chars().nth((x.abs() % 64) as usize).unwrap();
        let y_char = GENE_ALPHABET.chars().nth((y.abs() % 64) as usize).unwrap();
        let z_char = GENE_ALPHABET.chars().nth((z.abs() % 64) as usize).unwrap();
        format!("{}{}{}", x_char, y_char, z_char)
    }

    /// Decode gene codon back to 3D coordinate
    fn decode_codon(&self, codon: &str) -> (f32, f32, f32) {
        let chars: Vec<char> = codon.chars().collect();
        if chars.len() != 3 {
            return (0.0, 0.0, 0.0);
        }
        
        let x_idx = GENE_ALPHABET.find(chars[0]).unwrap_or(0) as i32;
        let y_idx = GENE_ALPHABET.find(chars[1]).unwrap_or(0) as i32;
        let z_idx = GENE_ALPHABET.find(chars[2]).unwrap_or(0) as i32;
        
        let divisor = 10f32.powi(self.precision as i32);
        (
            x_idx as f32 / divisor,
            y_idx as f32 / divisor,
            z_idx as f32 / divisor,
        )
    }

    /// Calculate gene hash (for blockchain storage)
    pub fn hash_gene(&self, gene_string: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(gene_string.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Compress with delta encoding (for animation frames)
    pub fn compress_with_delta(&self, base: &[(f32, f32, f32)], target: &[(f32, f32, f32)]) -> String {
        let mut deltas = Vec::new();
        for (i, (base_v, target_v)) in base.iter().zip(target.iter()).enumerate() {
            let delta = (
                target_v.0 - base_v.0,
                target_v.1 - base_v.1,
                target_v.2 - base_v.2,
            );
            deltas.push(delta);
        }
        self.compress_vertices(&deltas)
    }
}

/// Statistics for gene compression efficiency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionStats {
    pub original_bytes: usize,
    pub compressed_bytes: usize,
    pub compression_ratio: f32,
    pub vertex_count: usize,
}

impl CompressionStats {
    pub fn calculate(vertices: &[(f32, f32, f32)], gene_string: &str) -> Self {
        let original_bytes = vertices.len() * 12; // 3 floats × 4 bytes
        let compressed_bytes = gene_string.len();
        
        Self {
            original_bytes,
            compressed_bytes,
            compression_ratio: original_bytes as f32 / compressed_bytes as f32,
            vertex_count: vertices.len(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gene_compression() {
        let compressor = GeneCompressor::new(2);
        let vertices = vec![
            (1.5, 2.3, 3.1),
            (4.2, 5.6, 6.8),
            (7.1, 8.9, 9.2),
        ];
        
        let gene = compressor.compress_vertices(&vertices);
        assert!(!gene.is_empty());
        
        let decompressed = compressor.decompress_vertices(&gene);
        assert_eq!(decompressed.len(), vertices.len());
    }

    #[test]
    fn test_gene_hash() {
        let compressor = GeneCompressor::new(2);
        let gene = "ATG-CCG-GTA";
        let hash = compressor.hash_gene(gene);
        assert_eq!(hash.len(), 64); // SHA256 hex = 64 chars
    }
}
