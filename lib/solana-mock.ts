export interface AIKOData {
  owner: string;
  level: number;
  xp: number;
  total_interactions: number;
  last_interaction: number;
  streak: number;
  birthday: number;
  evolution_stage: 'egg' | 'hatchling' | 'companion' | 'soulmate';
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  message?: string;
  data?: AIKOData;
  levelUp?: boolean;
  evolutionUp?: boolean;
}

export class MockSolanaService {
  private storageKey = 'aiko_data_v2';

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateSignature(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let signature = '5';
    for (let i = 0; i < 87; i++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
  }

  private getEvolutionStage(level: number): AIKOData['evolution_stage'] {
    if (level >= 20) return 'soulmate';
    if (level >= 10) return 'companion';
    if (level >= 5) return 'hatchling';
    return 'egg';
  }

  async initialize(walletAddress: string): Promise<TransactionResult> {
    await this.delay(2000);

    const aiko: AIKOData = {
      owner: walletAddress,
      level: 1,
      xp: 0,
      total_interactions: 0,
      last_interaction: Date.now(),
      streak: 0,
      birthday: Date.now(),
      evolution_stage: 'egg'
    };

    localStorage.setItem(`${this.storageKey}_${walletAddress}`, JSON.stringify(aiko));

    return {
      signature: this.generateSignature(),
      success: true,
      message: "🥚 AIKO's egg has appeared! It's glowing with warm energy...",
      data: aiko
    };
  }

  async interact(walletAddress: string): Promise<TransactionResult> {
    await this.delay(1200);

    const stored = localStorage.getItem(`${this.storageKey}_${walletAddress}`);
    if (!stored) {
      return {
        signature: '',
        success: false,
        message: "AIKO not found! Please initialize first."
      };
    }

    const aiko: AIKOData = JSON.parse(stored);
    const oldLevel = aiko.level;
    const oldStage = aiko.evolution_stage;

    // Add XP
    aiko.xp += 10;
    aiko.total_interactions += 1;

    // Calculate level (100 XP per level)
    aiko.level = Math.floor(aiko.xp / 100) + 1;
    const leveledUp = aiko.level > oldLevel;

    // Check evolution
    aiko.evolution_stage = this.getEvolutionStage(aiko.level);
    const evolutionUp = aiko.evolution_stage !== oldStage;

    // Update streak
    const now = Date.now();
    const timeDiff = now - aiko.last_interaction;
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeDiff < oneDay) {
      // Same day
    } else if (timeDiff < oneDay * 2) {
      // Next day
      aiko.streak += 1;
    } else {
      // Missed days
      aiko.streak = 1;
    }

    aiko.last_interaction = now;

    localStorage.setItem(`${this.storageKey}_${walletAddress}`, JSON.stringify(aiko));

    let message = undefined;
    if (evolutionUp) {
      const stageMessages = {
        hatchling: "🐣 AIKO is hatching! Your companion is coming to life!",
        companion: "🌸 AIKO has blossomed! Your bond is growing stronger!",
        soulmate: "✨ AIKO has reached its final form! You're soulmates now!"
      };
      message = stageMessages[aiko.evolution_stage as keyof typeof stageMessages];
    } else if (leveledUp) {
      message = `🎉 Level up! AIKO is now Level ${aiko.level}!`;
    }

    return {
      signature: this.generateSignature(),
      success: true,
      message,
      data: aiko,
      levelUp: leveledUp,
      evolutionUp: evolutionUp
    };
  }

  async getAIKO(walletAddress: string): Promise<AIKOData | null> {
    await this.delay(300);
    const stored = localStorage.getItem(`${this.storageKey}_${walletAddress}`);
    if (!stored) return null;
    return JSON.parse(stored);
  }

  async exists(walletAddress: string): Promise<boolean> {
    const stored = localStorage.getItem(`${this.storageKey}_${walletAddress}`);
    return !!stored;
  }

  getMockWallet(): string {
    let mockWallet = localStorage.getItem('mock_wallet_address');
    if (!mockWallet) {
      mockWallet = '7' + Array(43).fill(0).map(() => 
        'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
          Math.floor(Math.random() * 58)
        ]
      ).join('');
      localStorage.setItem('mock_wallet_address', mockWallet);
    }
    return mockWallet;
  }
}

export const solanaService = new MockSolanaService();