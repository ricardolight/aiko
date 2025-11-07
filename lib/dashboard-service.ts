// lib/dashboard-service.ts
import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r');
const RPC_URL = 'https://rpc.testnet.carv.io/rpc';

export interface GlobalStats {
  totalUsers: number;
  totalInteractions: number;
  averageLevel: number;
  highestLevel: number;
  activeToday: number;
  totalXP: number;
  highestStreak: number;
}

export interface TopUser {
  rank: number;
  address: string;
  level: number;
  xp: number;
  streak: number;
  interactions: number;
}

export interface RecentActivity {
  user: string;
  action: 'level_up' | 'streak_updated' | 'memory_updated' | 'interaction' | 'evolution';
  level?: number;
  streak?: number;
  detail?: string;
  xp?: number;
  timestamp: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    console.log('📊 Fetching global stats from CARV SVM...');
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Get all AIKO accounts
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          dataSize: 146, // AIKO account size
        },
      ],
    });
    
    console.log(`✅ Found ${accounts.length} AIKO accounts`);
    
    let totalXP = 0;
    let totalInteractions = 0;
    let highestLevel = 0;
    let highestStreak = 0;
    const levels: number[] = [];
    let activeToday = 0;
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);
    
    // Parse each account
    for (const { account } of accounts) {
      try {
        const data = account.data;
        
        // Parse fields (based on your Rust struct)
        // Discriminator: 8 bytes (skip)
        // Owner: 32 bytes (skip)
        // At offset 40:
        const level = data.readUInt8(40);
        
        // XP: 8 bytes at offset 41
        const xp = Number(data.slice(41, 49).readBigUInt64LE());
        
        // Total interactions: 8 bytes at offset 49
        const interactions = Number(data.slice(49, 57).readBigUInt64LE());
        
        // Last interaction: 8 bytes at offset 57
        const lastInteraction = Number(data.slice(57, 65).readBigUInt64LE());
        
        // Streak: 8 bytes at offset 65
        const streak = Number(data.slice(65, 73).readBigUInt64LE());
        
        // Accumulate stats
        totalXP += xp;
        totalInteractions += interactions;
        levels.push(level);
        
        if (level > highestLevel) highestLevel = level;
        if (streak > highestStreak) highestStreak = streak;
        
        // Check if active today
        if (lastInteraction >= oneDayAgo) {
          activeToday++;
        }
        
      } catch (e) {
        console.warn('⚠️ Failed to parse account:', e);
      }
    }
    
    const averageLevel = levels.length > 0 
      ? levels.reduce((a, b) => a + b, 0) / levels.length 
      : 0;
    
    const stats = {
      totalUsers: accounts.length,
      totalInteractions,
      averageLevel: Math.round(averageLevel * 10) / 10,
      highestLevel,
      highestStreak,
      activeToday,
      totalXP,
    };
    
    console.log('✅ Global stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Failed to fetch global stats:', error);
    // Return fallback data
    return {
      totalUsers: 0,
      totalInteractions: 0,
      averageLevel: 0,
      highestLevel: 0,
      highestStreak: 0,
      activeToday: 0,
      totalXP: 0,
    };
  }
}

export async function getTopUsers(limit = 10): Promise<TopUser[]> {
  try {
    console.log('🏆 Fetching top users from CARV SVM...');
    const connection = new Connection(RPC_URL, 'confirmed');
    
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [{ dataSize: 146 }],
    });
    
    const users = accounts.map(({ account, pubkey }) => {
      const data = account.data;
      
      // Parse owner (offset 8-40)
      const owner = new PublicKey(data.slice(8, 40));
      
      // Parse data
      const level = data.readUInt8(40);
      const xp = Number(data.slice(41, 49).readBigUInt64LE());
      const interactions = Number(data.slice(49, 57).readBigUInt64LE());
      const streak = Number(data.slice(65, 73).readBigUInt64LE());
      
      return {
        address: owner.toBase58(),
        level,
        xp,
        interactions,
        streak,
      };
    });
    
    // Sort by level DESC, then XP DESC
    users.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    });
    
    const topUsers = users.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      address: user.address.slice(0, 4) + '...' + user.address.slice(-4),
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      interactions: user.interactions,
    }));
    
    console.log('✅ Top users:', topUsers);
    return topUsers;
    
  } catch (error) {
    console.error('❌ Failed to fetch top users:', error);
    return [];
  }
}

export async function getRecentActivities(limit = 10): Promise<RecentActivity[]> {
  try {
    console.log('⚡ Fetching recent activities...');
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Get recent blocks/signatures
    const signatures = await connection.getSignaturesForAddress(
      PROGRAM_ID,
      { limit: 20 }
    );
    
    const activities: RecentActivity[] = [];
    
    for (const sig of signatures.slice(0, limit)) {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (!tx) continue;
        
        // Extract user address
        const userAddress = tx.transaction.message.accountKeys[0].pubkey.toBase58();
        const shortAddress = userAddress.slice(0, 4) + '...' + userAddress.slice(-4);
        
        // Determine activity type based on instruction
        const activity: RecentActivity = {
          user: shortAddress,
          action: 'interaction',
          xp: 10,
          timestamp: (sig.blockTime || 0) * 1000,
        };
        
        activities.push(activity);
      } catch (e) {
        // Skip failed transactions
      }
    }
    
    console.log('✅ Recent activities:', activities.length);
    return activities;
    
  } catch (error) {
    console.error('❌ Failed to fetch recent activities:', error);
    return [];
  }
}