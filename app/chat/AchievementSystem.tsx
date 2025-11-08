import { useState } from 'react';

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
}

const AchievementSystem = ({ aikoData, knowsName, knowsCountry }: Props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Real achievement data based on aikoData
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
  const hasNewAchievement = achievements.some(a => a.unlocked); // Simple logic for now

  return (
    <>
      {/* Achievement Icon Button */}
      <div className="relative">
        <button 
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          title="Achievements"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🏆</span>
        </button>
        {hasNewAchievement && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
        )}
      </div>

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-end p-4 z-50"
          onClick={() => setIsPopupOpen(false)}
        >
          <div 
            className="glass-card rounded-xl w-80 max-h-[80vh] overflow-hidden mt-16 animate-in slide-in-from-right-5 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <h2 className="text-lg font-bold text-white">Achievements</h2>
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Progress Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-300">
                  {unlockedCount} of {totalCount} unlocked
                </span>
                <span className="text-purple-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {totalCount - unlockedCount} more to legendary status!
              </p>
            </div>

            {/* Achievements List */}
            <div className="overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 divide-y divide-white/5">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 transition-colors ${
                      achievement.unlocked 
                        ? 'hover:bg-white/5' 
                        : 'opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-2xl p-2 rounded-lg ${
                        achievement.unlocked 
                          ? 'bg-yellow-500/20 ring-1 ring-yellow-500/30' 
                          : 'bg-gray-700'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${
                          achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {achievement.description}
                        </p>
                      </div>
                      <div className={`text-lg ${achievement.unlocked ? 'text-green-400' : 'text-gray-600'}`}>
                        {achievement.unlocked ? '✅' : '🔒'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementSystem;