'use client';

interface Achievement {
  id: number;
  name: string;
  unlocked: boolean;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Props {
  aikoData: {
    totalInteractions: any;
    streak: any;
    level: number;
    xp: any;
  };
  knowsName: boolean;
  knowsCountry: boolean;
  onClose: () => void;
}

const AchievementSystem = ({ aikoData, knowsName, knowsCountry, onClose }: Props) => {
  const achievements: Achievement[] = [
    { 
      id: 1, 
      name: "First Steps", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 1, 
      icon: "👶", 
      description: "First message",
      rarity: 'common'
    },
    { 
      id: 2, 
      name: "Conversationalist", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 10, 
      icon: "💬", 
      description: "10 chats",
      rarity: 'common'
    },
    { 
      id: 3, 
      name: "Week Warrior", 
      unlocked: Number(aikoData.streak.toString()) >= 7, 
      icon: "🔥", 
      description: "7 day streak",
      rarity: 'rare'
    },
    { 
      id: 4, 
      name: "Dedicated", 
      unlocked: Number(aikoData.streak.toString()) >= 30, 
      icon: "⭐", 
      description: "30 day streak",
      rarity: 'epic'
    },
    { 
      id: 5, 
      name: "Hatchling", 
      unlocked: aikoData.level >= 5, 
      icon: "🐣", 
      description: "Level 5",
      rarity: 'rare'
    },
    { 
      id: 6, 
      name: "Companion", 
      unlocked: aikoData.level >= 10, 
      icon: "🌸", 
      description: "Level 10",
      rarity: 'epic'
    },
    { 
      id: 7, 
      name: "Soulmate", 
      unlocked: aikoData.level >= 20, 
      icon: "✨", 
      description: "Level 20",
      rarity: 'legendary'
    },
    { 
      id: 8, 
      name: "Memory Keeper", 
      unlocked: knowsName && knowsCountry, 
      icon: "🧠", 
      description: "Complete profile",
      rarity: 'common'
    },
    { 
      id: 9, 
      name: "Century Club", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 100, 
      icon: "💯", 
      description: "100 interactions",
      rarity: 'epic'
    },
    { 
      id: 10, 
      name: "XP Master", 
      unlocked: Number(aikoData.xp.toString()) >= 1000, 
      icon: "🎯", 
      description: "1000 XP earned",
      rarity: 'epic'
    },
    { 
      id: 11, 
      name: "Early Adopter", 
      unlocked: true, 
      icon: "🚀", 
      description: "Joined AIKO",
      rarity: 'rare'
    },
    { 
      id: 12, 
      name: "Legendary", 
      unlocked: aikoData.level >= 50, 
      icon: "👑", 
      description: "Level 50",
      rarity: 'legendary'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  const getRarityGradient = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return 'from-gray-800/50 to-gray-900/50 border-gray-700/30';
    
    const gradients = {
      common: 'from-slate-500/20 to-slate-600/20 border-slate-400/40',
      rare: 'from-blue-500/20 to-cyan-500/20 border-blue-400/40',
      epic: 'from-purple-500/20 to-pink-500/20 border-purple-400/40',
      legendary: 'from-amber-500/20 to-orange-500/20 border-amber-400/40',
    };
    return gradients[rarity as keyof typeof gradients];
  };

  const getRarityGlow = (rarity: string) => {
    const glows = {
      common: 'shadow-slate-500/20',
      rare: 'shadow-blue-500/30',
      epic: 'shadow-purple-500/40',
      legendary: 'shadow-amber-500/50',
    };
    return glows[rarity as keyof typeof glows];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#1a1625] to-[#0f0519] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Compact Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                🏆
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Achievement Gallery</h3>
                <p className="text-sm text-gray-400">{unlockedCount} of {totalCount} collected · {Math.round(progress)}% complete</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content - NO SCROLL, Bento Grid */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6 glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Collection Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full transition-all duration-1000 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Bento Grid - 4x3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((achievement, i) => (
              <div
                key={achievement.id}
                className={`group relative rounded-2xl bg-gradient-to-br ${getRarityGradient(achievement.rarity, achievement.unlocked)} border p-4 transition-all duration-300 ${
                  achievement.unlocked 
                    ? `hover:scale-105 hover:${getRarityGlow(achievement.rarity)} cursor-pointer` 
                    : 'opacity-40'
                }`}
                style={{
                  animationDelay: `${i * 30}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                {/* Rarity Badge */}
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                    {achievement.rarity === 'legendary' && <span className="text-amber-400">★ Legendary</span>}
                    {achievement.rarity === 'epic' && <span className="text-purple-400">◆ Epic</span>}
                    {achievement.rarity === 'rare' && <span className="text-blue-400">● Rare</span>}
                    {achievement.rarity === 'common' && <span className="text-gray-400">○ Common</span>}
                  </div>
                )}

                {/* Icon */}
                <div className={`text-5xl mb-3 transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'group-hover:scale-110 group-hover:-rotate-6' 
                    : 'grayscale opacity-30'
                }`}>
                  {achievement.icon}
                </div>

                {/* Text */}
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-xs ${
                    achievement.unlocked ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {achievement.description}
                  </p>
                </div>

                {/* Status Icon */}
                <div className="absolute bottom-2 right-2 text-lg">
                  {achievement.unlocked ? '✅' : '🔒'}
                </div>

                {/* Shine Effect */}
                {achievement.unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                )}
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{unlockedCount}</div>
              <div className="text-xs text-gray-400">Unlocked</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-500 mb-1">{totalCount - unlockedCount}</div>
              <div className="text-xs text-gray-400">Locked</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-400">Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;