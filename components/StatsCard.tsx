'use client';

import { AIKOData } from '@/lib/solana-mock';

interface StatsCardProps {
  data: AIKOData;
}

export default function StatsCard({ data }: StatsCardProps) {
  const xpToNextLevel = (data.level * 100) - data.xp;
  const xpProgress = ((data.xp % 100) / 100) * 100;
  
  const daysSinceBirth = Math.floor((Date.now() - data.birthday) / (1000 * 60 * 60 * 24));

  return (
    <div className="glass-dark rounded-2xl p-6 space-y-4">
      {/* Level */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-300 font-semibold">Level</span>
          <span className="text-2xl font-bold text-white">{data.level}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {data.xp % 100} / 100 XP ({xpToNextLevel} to next level)
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-900/30 rounded-xl p-3">
          <div className="text-purple-300 text-sm">Total XP</div>
          <div className="text-xl font-bold text-white">{data.xp}</div>
        </div>
        
        <div className="bg-pink-900/30 rounded-xl p-3">
          <div className="text-pink-300 text-sm">Streak</div>
          <div className="text-xl font-bold text-white">🔥 {data.streak}</div>
        </div>
        
        <div className="bg-purple-900/30 rounded-xl p-3">
          <div className="text-purple-300 text-sm">Chats</div>
          <div className="text-xl font-bold text-white">{data.total_interactions}</div>
        </div>
        
        <div className="bg-pink-900/30 rounded-xl p-3">
          <div className="text-pink-300 text-sm">Age</div>
          <div className="text-xl font-bold text-white">{daysSinceBirth}d</div>
        </div>
      </div>

      {/* Evolution Stage */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-3">
        <div className="text-purple-200 text-sm mb-1">Evolution Stage</div>
        <div className="text-lg font-bold text-white capitalize">{data.evolution_stage}</div>
      </div>
    </div>
  );
}