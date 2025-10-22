use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};

declare_id!("PixB1dgeGeneCompressed3DObjectsAnchor11111111");

#[program]
pub mod pixel_bridge {
    use super::*;

    /// Initialize the bridge authority and state
    pub fn initialize(
        ctx: Context<Initialize>,
        app_chain_genesis_hash: [u8; 32],
    ) -> Result<()> {
        let bridge_state = &mut ctx.accounts.bridge_state;
        bridge_state.authority = ctx.accounts.authority.key();
        bridge_state.app_chain_genesis = app_chain_genesis_hash;
        bridge_state.last_checkpoint_height = 0;
        bridge_state.last_checkpoint_hash = [0u8; 32];
        bridge_state.total_objects_bridged = 0;
        bridge_state.pixel_token_mint = ctx.accounts.pixel_token_mint.key();
        
        msg!("🌉 PixelProdigy Bridge initialized!");
        msg!("Genesis hash: {:?}", app_chain_genesis_hash);
        
        Ok(())
    }

    /// Checkpoint app-chain state to Solana (called by validators)
    pub fn checkpoint(
        ctx: Context<Checkpoint>,
        app_chain_height: u64,
        state_root: [u8; 32],
        merkle_root: [u8; 32],
    ) -> Result<()> {
        let bridge_state = &mut ctx.accounts.bridge_state;
        
        // Verify checkpoint is newer than last
        require!(
            app_chain_height > bridge_state.last_checkpoint_height,
            BridgeError::CheckpointNotNewer
        );
        
        // Store checkpoint
        bridge_state.last_checkpoint_height = app_chain_height;
        bridge_state.last_checkpoint_hash = state_root;
        
        msg!("✅ Checkpoint submitted!");
        msg!("Height: {}", app_chain_height);
        msg!("State root: {:?}", state_root);
        msg!("Merkle root: {:?}", merkle_root);
        
        // Emit event for indexers
        emit!(CheckpointEvent {
            height: app_chain_height,
            state_root,
            merkle_root,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Bridge a 3D object from app-chain to Solana (mint achievement token)
    pub fn bridge_object(
        ctx: Context<BridgeObject>,
        gene_data: Vec<u8>,
        object_hash: [u8; 32],
        creator: Pubkey,
        metadata: ObjectMetadata,
    ) -> Result<()> {
        let bridge_state = &mut ctx.accounts.bridge_state;
        
        // Verify gene data is valid (basic check)
        require!(
            !gene_data.is_empty() && gene_data.len() <= 10_000,
            BridgeError::InvalidGeneData
        );
        
        // Create object account
        let object_account = &mut ctx.accounts.object_account;
        object_account.creator = creator;
        object_account.object_hash = object_hash;
        object_account.gene_data = gene_data.clone();
        object_account.metadata = metadata.clone();
        object_account.bridged_at = Clock::get()?.unix_timestamp;
        object_account.bridge_state = bridge_state.key();
        
        // Mint PIXEL tokens as reward
        let reward_amount = calculate_reward(&metadata);
        
        let seeds = &[
            b"bridge_authority",
            &[ctx.bumps.bridge_authority],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.pixel_token_mint.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.bridge_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::mint_to(cpi_ctx, reward_amount)?;
        
        // Update bridge stats
        bridge_state.total_objects_bridged += 1;
        
        msg!("🎨 3D Object bridged!");
        msg!("Creator: {}", creator);
        msg!("Object hash: {:?}", object_hash);
        msg!("Gene data size: {} bytes", gene_data.len());
        msg!("Reward: {} PIXEL tokens", reward_amount);
        msg!("Category: {}", metadata.category);
        
        emit!(ObjectBridgedEvent {
            creator,
            object_hash,
            gene_data_size: gene_data.len() as u32,
            reward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Claim achievement badge (non-transferable NFT for learning milestones)
    pub fn claim_achievement(
        ctx: Context<ClaimAchievement>,
        achievement_type: AchievementType,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        let achievement = &mut ctx.accounts.achievement_account;
        
        achievement.owner = ctx.accounts.user.key();
        achievement.achievement_type = achievement_type;
        achievement.proof_hash = proof_hash;
        achievement.claimed_at = Clock::get()?.unix_timestamp;
        achievement.bridge_state = ctx.accounts.bridge_state.key();
        
        msg!("🏆 Achievement claimed!");
        msg!("User: {}", ctx.accounts.user.key());
        msg!("Type: {:?}", achievement_type);
        
        emit!(AchievementClaimedEvent {
            user: ctx.accounts.user.key(),
            achievement_type,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Verify an object exists on the app-chain (using merkle proof)
    pub fn verify_object(
        ctx: Context<VerifyObject>,
        object_hash: [u8; 32],
        merkle_proof: Vec<[u8; 32]>,
    ) -> Result<bool> {
        let bridge_state = &ctx.accounts.bridge_state;
        
        // Verify merkle proof against last checkpoint
        let is_valid = verify_merkle_proof(
            &object_hash,
            &merkle_proof,
            &bridge_state.last_checkpoint_hash,
        );
        
        msg!("🔍 Object verification: {}", is_valid);
        
        Ok(is_valid)
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT STRUCTS
// ═══════════════════════════════════════════════════════════════════

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + BridgeState::INIT_SPACE,
        seeds = [b"bridge_state"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(
        seeds = [b"bridge_authority"],
        bump
    )]
    /// CHECK: This is the PDA that will mint tokens
    pub bridge_authority: UncheckedAccount<'info>,
    
    pub pixel_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Checkpoint<'info> {
    #[account(
        mut,
        seeds = [b"bridge_state"],
        bump,
        has_one = authority
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(object_hash: [u8; 32])]
pub struct BridgeObject<'info> {
    #[account(
        mut,
        seeds = [b"bridge_state"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(
        seeds = [b"bridge_authority"],
        bump
    )]
    /// CHECK: PDA for minting
    pub bridge_authority: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + ObjectAccount::INIT_SPACE,
        seeds = [b"object", object_hash.as_ref()],
        bump
    )]
    pub object_account: Account<'info, ObjectAccount>,
    
    #[account(mut)]
    pub pixel_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimAchievement<'info> {
    #[account(
        seeds = [b"bridge_state"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(
        init,
        payer = user,
        space = 8 + AchievementAccount::INIT_SPACE,
        seeds = [b"achievement", user.key().as_ref(), &[achievement_type as u8]],
        bump
    )]
    pub achievement_account: Account<'info, AchievementAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyObject<'info> {
    #[account(
        seeds = [b"bridge_state"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
}

// ═══════════════════════════════════════════════════════════════════
// STATE ACCOUNTS
// ═══════════════════════════════════════════════════════════════════

#[account]
#[derive(InitSpace)]
pub struct BridgeState {
    pub authority: Pubkey,
    pub app_chain_genesis: [u8; 32],
    pub last_checkpoint_height: u64,
    pub last_checkpoint_hash: [u8; 32],
    pub total_objects_bridged: u64,
    pub pixel_token_mint: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct ObjectAccount {
    pub creator: Pubkey,
    pub object_hash: [u8; 32],
    #[max_len(10_000)]
    pub gene_data: Vec<u8>,
    pub metadata: ObjectMetadata,
    pub bridged_at: i64,
    pub bridge_state: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct AchievementAccount {
    pub owner: Pubkey,
    pub achievement_type: AchievementType,
    pub proof_hash: [u8; 32],
    pub claimed_at: i64,
    pub bridge_state: Pubkey,
}

// ═══════════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct ObjectMetadata {
    #[max_len(64)]
    pub name: String,
    #[max_len(32)]
    pub category: String,
    pub vertex_count: u32,
    pub triangle_count: u32,
    pub compression_ratio: u16, // e.g., 85 = 85%
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum AchievementType {
    FirstObject = 0,
    TenObjects = 1,
    HundredObjects = 2,
    MasterBuilder = 3,
    Mathematician = 4,
    Architect = 5,
    RecoveryMilestone = 6,
    CommunityHelper = 7,
}

// ═══════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════

#[event]
pub struct CheckpointEvent {
    pub height: u64,
    pub state_root: [u8; 32],
    pub merkle_root: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct ObjectBridgedEvent {
    pub creator: Pubkey,
    pub object_hash: [u8; 32],
    pub gene_data_size: u32,
    pub reward_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct AchievementClaimedEvent {
    pub user: Pubkey,
    pub achievement_type: AchievementType,
    pub timestamp: i64,
}

// ═══════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════

#[error_code]
pub enum BridgeError {
    #[msg("Checkpoint height must be greater than last checkpoint")]
    CheckpointNotNewer,
    
    #[msg("Invalid gene data: empty or too large")]
    InvalidGeneData,
    
    #[msg("Merkle proof verification failed")]
    InvalidMerkleProof,
    
    #[msg("Object already bridged")]
    ObjectAlreadyBridged,
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

fn calculate_reward(metadata: &ObjectMetadata) -> u64 {
    let base_reward = 100_000_000; // 100 PIXEL (with 6 decimals)
    
    // Bonus for complexity
    let complexity_bonus = (metadata.vertex_count / 100) as u64 * 1_000_000;
    
    // Bonus for compression efficiency
    let compression_bonus = (metadata.compression_ratio as u64) * 500_000;
    
    base_reward + complexity_bonus + compression_bonus
}

fn verify_merkle_proof(
    leaf: &[u8; 32],
    proof: &[[u8; 32]],
    root: &[u8; 32],
) -> bool {
    use sha2::{Sha256, Digest};
    
    let mut current_hash = *leaf;
    
    for proof_element in proof {
        let mut hasher = Sha256::new();
        if current_hash < *proof_element {
            hasher.update(&current_hash);
            hasher.update(proof_element);
        } else {
            hasher.update(proof_element);
            hasher.update(&current_hash);
        }
        current_hash = hasher.finalize().into();
    }
    
    current_hash == *root
}
