'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const hasNewAchievement = achievements.some(a => a.unlocked);

  return (
    <>
      {/* Achievement Icon Button */}
      <div className="relative">
        <button 
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          title="Achievements"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
        </button>
        {hasNewAchievement && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
        )}
      </div>

      {/* ✅ FIXED: Center Modal Popup */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="glass-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden border border-white/20 shadow-2xl z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🏆</span> Achievements
                </h2>
                <button 
                  onClick={() => setIsPopupOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Progress Section */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-semibold text-gray-200">
                    {unlockedCount} of {totalCount} unlocked
                  </span>
                  <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-400 h-3 rounded-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  🎯 {totalCount - unlockedCount} more to legendary status!
                </p>
              </div>

              {/* Achievements List */}
              <div className="overflow-y-auto max-h-[50vh]">
                <div className="p-2">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-xl mb-2 transition-all ${
                        achievement.unlocked 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'opacity-40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-3xl p-3 rounded-xl flex-shrink-0 ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ring-2 ring-yellow-500/30' 
                            : 'bg-gray-700/50 grayscale'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-base mb-1 ${
                            achievement.unlocked ? 'text-white' : 'text-gray-500'
                          }`}>
                            {achievement.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                        <div className={`text-2xl flex-shrink-0 ${achievement.unlocked ? '' : 'opacity-30'}`}>
                          {achievement.unlocked ? '✅' : '🔒'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="p-5 border-t border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-green-400 font-bold text-2xl">{unlockedCount}</div>
                    <div className="text-gray-400 text-xs">Unlocked</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-bold text-2xl">{totalCount - unlockedCount}</div>
                    <div className="text-gray-400 text-xs">Locked</div>
                  </div>
                  <div>
                    <div className="text-purple-400 font-bold text-2xl">{Math.round(progress)}%</div>
                    <div className="text-gray-400 text-xs">Complete</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementSystem;