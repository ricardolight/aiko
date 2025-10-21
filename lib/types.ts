// lib/types.ts

export interface AIKOData {
  owner: string;
  level: number;
  xp: number;
  totalInteractions: number;
  lastInteraction: number;
  streak: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface UserSession {
  wallet: string;
  aikoPDA?: string;
  connected: boolean;
}

export type EvolutionStage = 'egg' | 'baby' | 'young' | 'mature';

export function getEvolutionStage(level: number): EvolutionStage {
  if (level < 5) return 'egg';
  if (level < 10) return 'baby';
  if (level < 20) return 'young';
  return 'mature';
}

export function getEvolutionEmoji(stage: EvolutionStage): string {
  const emojis = {
    egg: '🥚',
    baby: '🐣',
    young: '🌸',
    mature: '✨'
  };
  return emojis[stage];
}