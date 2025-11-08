'use client';

interface Achievement {
  id: number;
  name: string;
  unlocked: boolean;
  icon: string;
  description: string;
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
  onClose: () => void; // ✅ ADD THIS
}

const AchievementSystem = ({ aikoData, knowsName, knowsCountry, onClose }: Props) => {
  const achievements: Achievement[] = [
    { 
      id: 1, 
      name: "First Steps", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 1, 
      icon: "👶", 
      description: "Send first message" 
    },
    { 
      id: 2, 
      name: "Conversationalist", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 10, 
      icon: "💬", 
      description: "10 conversations" 
    },
    { 
      id: 3, 
      name: "Week Warrior", 
      unlocked: Number(aikoData.streak.toString()) >= 7, 
      icon: "🔥", 
      description: "7 day streak" 
    },
    { 
      id: 4, 
      name: "Dedicated", 
      unlocked: Number(aikoData.streak.toString()) >= 30, 
      icon: "⭐", 
      description: "30 day streak" 
    },
    { 
      id: 5, 
      name: "Hatchling", 
      unlocked: aikoData.level >= 5, 
      icon: "🐣", 
      description: "Reach Level 5" 
    },
    { 
      id: 6, 
      name: "Companion", 
      unlocked: aikoData.level >= 10, 
      icon: "🌸", 
      description: "Reach Level 10" 
    },
    { 
      id: 7, 
      name: "Soulmate", 
      unlocked: aikoData.level >= 20, 
      icon: "✨", 
      description: "Reach Level 20" 
    },
    { 
      id: 8, 
      name: "Memory Keeper", 
      unlocked: knowsName && knowsCountry, 
      icon: "🧠", 
      description: "Complete profile" 
    },
    { 
      id: 9, 
      name: "Century Club", 
      unlocked: Number(aikoData.totalInteractions.toString()) >= 100, 
      icon: "💯", 
      description: "100 interactions" 
    },
    { 
      id: 10, 
      name: "XP Master", 
      unlocked: Number(aikoData.xp.toString()) >= 1000, 
      icon: "🎯", 
      description: "1000 XP earned" 
    },
    { 
      id: 11, 
      name: "Early Adopter", 
      unlocked: true, 
      icon: "🚀", 
      description: "Joined AIKO" 
    },
    { 
      id: 12, 
      name: "Legendary", 
      unlocked: aikoData.level >= 50, 
      icon: "👑", 
      description: "Reach Level 50" 
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full glass-card rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            🏆 Achievements
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          Track your progress and unlock achievements as you grow with AIKO. {unlockedCount} of {totalCount} unlocked ({Math.round(progress)}% complete)
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Achievements List - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' 
                  : 'glass opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-4xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-base mb-1 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {achievement.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-2xl">
                  {achievement.unlocked ? '✅' : '🔒'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-around pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-green-400 font-bold text-2xl">{unlockedCount}</div>
            <div className="text-gray-400 text-xs">Unlocked</div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-center">
            <div className="text-gray-400 font-bold text-2xl">{totalCount - unlockedCount}</div>
            <div className="text-gray-400 text-xs">Remaining</div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-center">
            <div className="text-purple-400 font-bold text-2xl">{Math.round(progress)}%</div>
            <div className="text-gray-400 text-xs">Complete</div>
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