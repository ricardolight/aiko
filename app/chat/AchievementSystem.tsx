'use client';

interface Achievement {
  id: number;
  name: string;
  unlocked: boolean;
  icon: string;
  description: string;
  category: 'milestone' | 'social' | 'dedication' | 'mastery';
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
      description: "Send your first message",
      category: 'milestone'
    },
    { 
      id: 2, 
      name: "Conversationalist", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 10, 
      icon: "💬", 
      description: "Have 10 conversations",
      category: 'social'
    },
    { 
      id: 3, 
      name: "Week Warrior", 
      unlocked: Number(aikoData.streak.toString()) >= 7, 
      icon: "🔥", 
      description: "Maintain a 7-day streak",
      category: 'dedication'
    },
    { 
      id: 4, 
      name: "Dedicated Friend", 
      unlocked: Number(aikoData.streak.toString()) >= 30, 
      icon: "⭐", 
      description: "Maintain a 30-day streak",
      category: 'dedication'
    },
    { 
      id: 5, 
      name: "Hatchling", 
      unlocked: aikoData.level >= 5, 
      icon: "🐣", 
      description: "Reach Level 5",
      category: 'milestone'
    },
    { 
      id: 6, 
      name: "Companion", 
      unlocked: aikoData.level >= 10, 
      icon: "🌸", 
      description: "Reach Level 10",
      category: 'milestone'
    },
    { 
      id: 7, 
      name: "Soulmate", 
      unlocked: aikoData.level >= 20, 
      icon: "✨", 
      description: "Reach Level 20",
      category: 'milestone'
    },
    { 
      id: 8, 
      name: "Memory Keeper", 
      unlocked: knowsName && knowsCountry, 
      icon: "🧠", 
      description: "Complete your profile",
      category: 'social'
    },
    { 
      id: 9, 
      name: "Century Club", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 100, 
      icon: "💯", 
      description: "Reach 100 interactions",
      category: 'mastery'
    },
    { 
      id: 10, 
      name: "XP Master", 
      unlocked: Number(aikoData.xp.toString()) >= 1000, 
      icon: "🎯", 
      description: "Earn 1000 XP",
      category: 'mastery'
    },
    { 
      id: 11, 
      name: "Early Adopter", 
      unlocked: true, 
      icon: "🚀", 
      description: "Join AIKO on CARV SVM",
      category: 'social'
    },
    { 
      id: 12, 
      name: "Legendary", 
      unlocked: aikoData.level >= 50, 
      icon: "👑", 
      description: "Reach Level 50",
      category: 'mastery'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  const getCategoryColor = (category: string) => {
    const colors = {
      milestone: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      social: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      dedication: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      mastery: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    };
    return colors[category as keyof typeof colors];
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      milestone: { emoji: '🎯', name: 'Milestone' },
      social: { emoji: '💙', name: 'Social' },
      dedication: { emoji: '🔥', name: 'Dedication' },
      mastery: { emoji: '⚡', name: 'Mastery' },
    };
    return badges[category as keyof typeof badges];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-3xl w-full glass-card rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🏆</span> Achievements
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Unlock badges as you grow with AIKO
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar with Stats */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{unlockedCount}/{totalCount}</div>
              <div className="text-sm text-gray-400">Achievements Unlocked</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-400">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          {totalCount - unlockedCount > 0 && (
            <p className="text-xs text-center text-gray-500">
              🎯 {totalCount - unlockedCount} more to complete your collection!
            </p>
          )}
        </div>

        {/* Achievements Grid - 2 Columns */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const categoryBadge = getCategoryBadge(achievement.category);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl transition-all relative overflow-hidden group ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} hover:scale-[1.02]` 
                      : 'glass opacity-40 hover:opacity-60'
                  }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Category Badge */}
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs flex items-center gap-1">
                      <span>{categoryBadge.emoji}</span>
                      <span className="text-white/80">{categoryBadge.name}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`text-5xl flex-shrink-0 transition-all group-hover:scale-110 ${
                      achievement.unlocked ? '' : 'grayscale opacity-30'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-lg mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        achievement.unlocked ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-2xl">
                      {achievement.unlocked ? '✅' : '🔒'}
                    </div>
                  </div>

                  {/* Shine effect on unlocked */}
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-green-400 font-bold text-2xl flex items-center justify-center gap-1">
                <span>✅</span> {unlockedCount}
              </div>
              <div className="text-gray-400 text-xs mt-1">Unlocked</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
              <div className="text-gray-500 font-bold text-2xl flex items-center justify-center gap-1">
                <span>🔒</span> {totalCount - unlockedCount}
              </div>
              <div className="text-gray-400 text-xs mt-1">Locked</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
              <div className="text-purple-400 font-bold text-2xl">{Math.round(progress)}%</div>
              <div className="text-gray-400 text-xs mt-1">Progress</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AchievementSystem;