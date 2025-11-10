// lib/session-service.ts
/**
 * Session-based chat with daily sync requirement
 * Ensures streak stays safe without modifying contract
 */

export interface LocalInteraction {
  id: string;
  message: string;
  response: string;
  timestamp: number;
  xpEarned: number;
  synced: boolean;
}

export interface SessionData {
  userId: string;
  sessionStart: number;
  lastSync: number;
  lastSyncDayUTC: string; // "2025-01-15"
  pendingInteractions: LocalInteraction[];
  totalLocalXP: number;
  localLevel: number;
  localStreak: number;
  lastChatDayUTC: string;
  totalLocalInteractions: number;
}

class SessionService {
  private readonly STORAGE_KEY = 'aiko_session';

  getTodayUTC(): string {
    return new Date().toISOString().split('T')[0];
  }

  initSession(userId: string, blockchainData?: { xp: number; level: number; streak: number; totalInteractions: number }): SessionData {
    const existing = this.getSession(userId);
    
    if (existing) {
      console.log('📂 Restored session');
      return existing;
    }

    const today = this.getTodayUTC();
    const newSession: SessionData = {
      userId,
      sessionStart: Date.now(),
      lastSync: Date.now(),
      lastSyncDayUTC: today,
      pendingInteractions: [],
      totalLocalXP: blockchainData?.xp || 0,
      localLevel: blockchainData?.level || 1,
      localStreak: blockchainData?.streak || 0,
      lastChatDayUTC: '',
      totalLocalInteractions: blockchainData?.totalInteractions || 0,
    };

    this.saveSession(newSession);
    console.log('✨ New session created');
    return newSession;
  }

  getSession(userId: string): SessionData | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (!stored) return null;

      const session: SessionData = JSON.parse(stored);
      
      if (!session.userId || !session.pendingInteractions) {
        console.warn('⚠️ Invalid session');
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Load session failed:', error);
      return null;
    }
  }

  private saveSession(session: SessionData): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${session.userId}`, 
        JSON.stringify(session)
      );
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  }

  addInteraction(
    userId: string, 
    message: string, 
    response: string
  ): { 
    newXP: number; 
    newLevel: number; 
    newStreak: number;
    totalInteractions: number;
    streakInfo: { isNewDay: boolean; streakChange: 'increased' | 'maintained' | 'reset' };
    needsSync: boolean;
  } {
    const session = this.getSession(userId);
    if (!session) throw new Error('No session');

    const interaction: LocalInteraction = {
      id: `${Date.now()}_${Math.random()}`,
      message: message.substring(0, 500),
      response: response.substring(0, 1000),
      timestamp: Date.now(),
      xpEarned: 10,
      synced: false,
    };

    session.pendingInteractions.push(interaction);
    session.totalLocalXP += 10;
    session.localLevel = Math.floor(session.totalLocalXP / 100) + 1;
    session.totalLocalInteractions += 1;

    // Calculate streak
    const today = this.getTodayUTC();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let isNewDay = false;
    let streakChange: 'increased' | 'maintained' | 'reset' = 'maintained';
    
    if (!session.lastChatDayUTC) {
      // First chat ever
      session.localStreak = 1;
      session.lastChatDayUTC = today;
      isNewDay = true;
      streakChange = 'increased';
    } else if (session.lastChatDayUTC === today) {
      // Same day
      isNewDay = false;
      streakChange = 'maintained';
    } else if (session.lastChatDayUTC === yesterday) {
      // Next day
      session.localStreak += 1;
      session.lastChatDayUTC = today;
      isNewDay = true;
      streakChange = 'increased';
    } else {
      // Missed days
      session.localStreak = 1;
      session.lastChatDayUTC = today;
      isNewDay = true;
      streakChange = 'reset';
    }

    this.saveSession(session);

    // 🚀 REMOVED: Count-based sync trigger
    const needsSync = false;

    console.log(`📝 Interaction added (${session.pendingInteractions.length} pending, streak: ${session.localStreak})`);

    return {
      newXP: session.totalLocalXP,
      newLevel: session.localLevel,
      newStreak: session.localStreak,
      totalInteractions: session.totalLocalInteractions,
      streakInfo: { isNewDay, streakChange },
      needsSync,
    };
  }

  needsDailySync(userId: string): boolean {
    const session = this.getSession(userId);
    if (!session) return false;

    const today = this.getTodayUTC();
    const hasPending = session.pendingInteractions.filter(i => !i.synced).length > 0;
    
    return session.lastSyncDayUTC !== today && hasPending;
  }

  getSyncStatus(userId: string): {
    needsSync: boolean;
    needsDailySync: boolean;
    reason: string;
    pendingCount: number;
    lastSyncDay: string;
    canSync: boolean;
  } {
    const session = this.getSession(userId);
    
    if (!session) {
      return {
        needsSync: false,
        needsDailySync: false,
        reason: 'No session',
        pendingCount: 0,
        lastSyncDay: 'Never',
        canSync: false,
      };
    }

    const pendingCount = session.pendingInteractions.filter(i => !i.synced).length;
    const needsDailySync = this.needsDailySync(userId);

    // 🚀 FIX: Sync Now selalu nyala selama ada pending messages
    const canSync = pendingCount > 0;

    let reason = '';
    if (needsDailySync) {
      reason = '🔥 Daily sync required to maintain streak!';
    } else if (pendingCount > 0) {
      reason = `${pendingCount} messages pending`;
    } else {
      reason = 'No pending messages';
    }

    return {
      needsSync: false,
      needsDailySync,
      reason,
      pendingCount,
      lastSyncDay: session.lastSyncDayUTC,
      canSync,
    };
  }

  prepareSyncBatch(userId: string): {
    totalXP: number;
    interactionCount: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  } | null {
    const session = this.getSession(userId);
    if (!session) return null;

    const unsynced = session.pendingInteractions.filter(i => !i.synced);
    
    if (unsynced.length === 0) return null;

    return {
      totalXP: unsynced.length * 10,
      interactionCount: unsynced.length,
      oldestTimestamp: Math.min(...unsynced.map(i => i.timestamp)),
      newestTimestamp: Math.max(...unsynced.map(i => i.timestamp)),
    };
  }

  markSynced(userId: string): void {
    const session = this.getSession(userId);
    if (!session) return;

    session.pendingInteractions.forEach(i => i.synced = true);
    session.lastSync = Date.now();
    session.lastSyncDayUTC = this.getTodayUTC();

    // Keep only last 10 synced for history
    const synced = session.pendingInteractions.filter(i => i.synced);
    if (synced.length > 10) {
      session.pendingInteractions = session.pendingInteractions.slice(-10);
    }

    this.saveSession(session);
    console.log('✅ Marked as synced');
  }

  updateFromBlockchain(userId: string, blockchainData: { xp: number; level: number; streak: number; totalInteractions: number }): void {
    const session = this.getSession(userId);
    if (!session) return;

    // Update with blockchain truth
    session.totalLocalXP = blockchainData.xp;
    session.localLevel = blockchainData.level;
    session.localStreak = blockchainData.streak;
    session.totalLocalInteractions = blockchainData.totalInteractions;

    this.saveSession(session);
    console.log('🔄 Synced from blockchain');
  }

  clearSession(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    console.log('🧹 Session cleared');
  }

  getStats(userId: string) {
    const session = this.getSession(userId);
    if (!session) return null;

    return {
      totalInteractions: session.pendingInteractions.length,
      syncedInteractions: session.pendingInteractions.filter(i => i.synced).length,
      pendingInteractions: session.pendingInteractions.filter(i => !i.synced).length,
      sessionDuration: Date.now() - session.sessionStart,
    };
  }
}

export const sessionService = new SessionService();