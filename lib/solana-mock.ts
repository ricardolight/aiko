export interface AIKOData {
  owner: string;
  level: number;
  xp: number;
  total_interactions: number;
  last_interaction: number;
  streak: number;
  birthday: number;
  evolution_stage: 'egg' | 'hatchling' | 'companion' | 'soulmate';
  userName: string;
  userCountry: string;
  memoryFlags: number;
}


// Helper function to get evolution stage from level
export function getEvolutionStage(level: number): 'egg' | 'hatchling' | 'companion' | 'soulmate' {
  if (level >= 20) return 'soulmate';
  if (level >= 10) return 'companion';
  if (level >= 5) return 'hatchling';
  return 'egg';
}

// Helper function to convert blockchain data to AIKOData
export function blockchainToAIKOData(blockchainData: any): AIKOData {
  const level = blockchainData.level || 1;
  
  return {
    owner: blockchainData.owner?.toBase58() || '',
    level: level,
    xp: blockchainData.xp?.toNumber() || 0,
    total_interactions: blockchainData.totalInteractions?.toNumber() || 0,
    last_interaction: blockchainData.lastInteraction?.toNumber() || 0,
    streak: blockchainData.streak?.toNumber() || 0,
    evolution_stage: getEvolutionStage(level),
    userName: blockchainData.userName || '',
    userCountry: blockchainData.userCountry || '',
    memoryFlags: blockchainData.memoryFlags || 0,
  };
}
