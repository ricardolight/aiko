// programs/aiko-program/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("2668WLa5dqMYiScYQGSe3txNtVuG3iToc3fNyuMb3yLB");

#[program]
pub mod aiko_program {
    use super::*;

    /// Initialize a new AIKO companion
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let aiko = &mut ctx.accounts.aiko;
        let clock = Clock::get()?;
        
        aiko.owner = ctx.accounts.user.key();
        aiko.level = 1;
        aiko.xp = 0;
        aiko.total_interactions = 0;
        aiko.last_interaction = clock.unix_timestamp;
        aiko.streak = 0;
        
        msg!("🌸 AIKO hatched for: {}", aiko.owner);
        msg!("🥚 Starting at Level 1");
        
        Ok(())
    }

    /// Record an interaction with AIKO
    pub fn interact(ctx: Context<Interact>) -> Result<()> {
        let aiko = &mut ctx.accounts.aiko;
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        
        // Add XP (10 per interaction)
        aiko.xp = aiko.xp.checked_add(10).unwrap();
        aiko.total_interactions = aiko.total_interactions.checked_add(1).unwrap();
        
        // Calculate level (100 XP per level)
        let new_level = (aiko.xp / 100) + 1;
        let leveled_up = new_level > aiko.level as u64;
        
        if leveled_up {
            aiko.level = new_level as u8;
            msg!("🎉 Level up! New level: {}", aiko.level);
        }
        
        // Update streak
        let time_diff = now - aiko.last_interaction;
        let one_day: i64 = 86400; // seconds in a day
        
        if time_diff > 0 && time_diff < one_day {
            // Same day or within 24h - continue streak
            aiko.streak = aiko.streak.checked_add(1).unwrap();
            msg!("🔥 Streak: {} days", aiko.streak);
        } else if time_diff >= one_day && time_diff < (one_day * 2) {
            // Next day - continue streak
            aiko.streak = aiko.streak.checked_add(1).unwrap();
            msg!("🔥 Streak continues: {} days", aiko.streak);
        } else if time_diff >= (one_day * 2) {
            // Missed a day - reset streak
            aiko.streak = 1;
            msg!("💔 Streak reset to 1");
        }
        
        aiko.last_interaction = now;
        
        msg!("💬 Interaction #{}", aiko.total_interactions);
        msg!("✨ XP: {} | Level: {}", aiko.xp, aiko.level);
        
        Ok(())
    }

    
}

/// Account structure for AIKO
#[account]
pub struct AIKO {
    pub owner: Pubkey,              // 32 bytes
    pub level: u8,                  // 1 byte
    pub xp: u64,                    // 8 bytes
    pub total_interactions: u64,    // 8 bytes
    pub last_interaction: i64,      // 8 bytes
    pub streak: u64,                // 8 bytes
}

impl AIKO {
    // Calculate space needed
    // 8 (discriminator) + 32 + 1 + 8 + 8 + 8 + 8 = 73 bytes
    pub const LEN: usize = 8 + 32 + 1 + 8 + 8 + 8 + 8;
}

/// Context for initialize instruction
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = AIKO::LEN,
        seeds = [b"aiko", user.key().as_ref()],
        bump
    )]
    pub aiko: Account<'info, AIKO>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Context for interact instruction
#[derive(Accounts)]
pub struct Interact<'info> {
    #[account(
        mut,
        seeds = [b"aiko", user.key().as_ref()],
        bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub aiko: Account<'info, AIKO>,
    
    /// CHECK: Owner verification via has_one constraint
    pub owner: AccountInfo<'info>,
    
    pub user: Signer<'info>,
}

/// Custom error codes
#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to interact with this AIKO")]
    Unauthorized,
}