// programs/aiko-program/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r");

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
        aiko.last_interaction = clock.unix_timestamp; // Tetap pakai timestamp sekarang
        aiko.streak = 0; // Akan di-set ke 1 di first interaction
        aiko.user_name = String::new();
        aiko.user_country = String::new();
        aiko.memory_flags = 0;
        
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
        
        // ✅ FIXED STREAK LOGIC - TRUE DAILY STREAK 
        let one_day: i64 = 86400; // seconds in a day
        let last_interaction_day = aiko.last_interaction / one_day;
        let current_day = now / one_day;
        
        // ✅ PERBAIKAN: Pakai total_interactions untuk first interaction detection
        if aiko.total_interactions == 1 {
            // First interaction ever - start streak at 1
            aiko.streak = 1;
            msg!("🎊 First interaction! Streak started: {} day", aiko.streak);
        } else if current_day == last_interaction_day {
            // Same day - maintain streak (NO INCREMENT)
            msg!("📅 Same day - streak maintained: {}", aiko.streak);
        } else if current_day == last_interaction_day + 1 {
            // Next day - continue streak (+1)
            aiko.streak = aiko.streak.checked_add(1).unwrap();
            msg!("🔥 Streak continues: {} days", aiko.streak);
        } else {
            // Missed one or more days - reset streak to 1
            aiko.streak = 1;
            msg!("💔 Streak reset to 1 (missed {} days)", current_day - last_interaction_day);
        }
        
        aiko.last_interaction = now;
        
        msg!("💬 Interaction #{}", aiko.total_interactions);
        msg!("✨ XP: {} | Level: {} | Streak: {}", aiko.xp, aiko.level, aiko.streak);
        
        Ok(())
    }

    /// Update AIKO memory with user information
    pub fn update_memory(ctx: Context<UpdateMemory>, name: String, country: String, flags: u8) -> Result<()> {
        let aiko = &mut ctx.accounts.aiko;
        
        // Validate string lengths to prevent storage issues
        if name.len() > 32 {
            return Err(ErrorCode::StringTooLong.into());
        }
        if country.len() > 32 {
            return Err(ErrorCode::StringTooLong.into());
        }
        
        aiko.user_name = name;
        aiko.user_country = country;
        aiko.memory_flags = flags;
        
        msg!("🧠 Memory updated for: {}", aiko.owner);
        msg!("📝 Name: {}, Country: {}, Flags: {}", aiko.user_name, aiko.user_country, aiko.memory_flags);
        
        Ok(())
    }
}

/// Account structure for AIKO with memory system
#[account]
pub struct AIKO {
    pub owner: Pubkey,              // 32 bytes
    pub level: u8,                  // 1 byte
    pub xp: u64,                    // 8 bytes
    pub total_interactions: u64,    // 8 bytes
    pub last_interaction: i64,      // 8 bytes
    pub streak: u64,                // 8 bytes
    pub user_name: String,          // 4 + 32 bytes (max 32 chars)
    pub user_country: String,       // 4 + 32 bytes (max 32 chars)
    pub memory_flags: u8,           // 1 byte
}

impl AIKO {
    // Calculate space needed
    // 8 (discriminator) + 32 + 1 + 8 + 8 + 8 + 8 + (4+32) + (4+32) + 1 = 146 bytes
    pub const LEN: usize = 8 + 32 + 1 + 8 + 8 + 8 + 8 + 36 + 36 + 1;
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

/// Context for update memory instruction
#[derive(Accounts)]
pub struct UpdateMemory<'info> {
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
    
    #[msg("String too long - maximum 32 characters")]
    StringTooLong,
}

/// Memory flags constants
pub mod memory_flags {
    pub const KNOWS_NAME: u8 = 0x01;      // 00000001
    pub const KNOWS_COUNTRY: u8 = 0x02;   // 00000010  
    pub const KNOWS_INTERESTS: u8 = 0x04; // 00000100
    pub const KNOWS_PERSONALITY: u8 = 0x08; // 00001000
}