'use client';

import { AIKOData } from '@/lib/solana-mock';

interface AikoAvatarProps {
  data: AIKOData;
  size?: 'small' | 'medium' | 'large';
}

export default function AikoAvatar({ data, size = 'medium' }: AikoAvatarProps) {
  const sizeClasses = {
    small: 'w-12 h-12 text-2xl',
    medium: 'w-20 h-20 text-4xl',
    large: 'w-32 h-32 text-6xl'
  };

  const stageEmojis = {
    egg: '🥚',
    hatchling: '🐣',
    companion: '🌸',
    soulmate: '✨'
  };

  const stageColors = {
    egg: 'from-yellow-400 to-orange-400',
    hatchling: 'from-pink-400 to-rose-400',
    companion: 'from-purple-400 to-pink-400',
    soulmate: 'from-purple-500 via-pink-500 to-yellow-500'
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br ${stageColors[data.evolution_stage]} shadow-lg animate-float`}>
        <span className="animate-pulse">{stageEmojis[data.evolution_stage]}</span>
      </div>
      {data.level > 1 && (
        <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg">
          {data.level}
        </div>
      )}
    </div>
  );
}