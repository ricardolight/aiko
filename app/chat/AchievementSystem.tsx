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

  return (
    <>
      {/* Achievement Icon Button */}
      <button 
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors group"
        title="Achievements"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
        {unlockedCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-gray-900">
            {unlockedCount}
          </div>
        )}
      </button>

      {/* ✅ NEW: Slide from TOP - Doesn't interfere with anything! */}
      <AnimatePresence>
        {isPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsPopupOpen(false)}
            />

            {/* Popup Panel - Slides from TOP */}
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] p-4 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-card rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">Achievements</h2>
                      <p className="text-xs text-purple-300">{unlockedCount} of {totalCount} unlocked</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPopupOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="p-5 border-b border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 h-3 rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                </div>

                {/* Achievements Grid - Scrollable */}
                <div className="overflow-y-auto flex-1 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className={`p-4 rounded-xl border transition-all ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50' 
                            : 'bg-gray-800/30 border-gray-700/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-4xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold mb-1 ${
                              achievement.unlocked ? 'text-white' : 'text-gray-500'
                            }`}>
                              {achievement.name}
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {achievement.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-xl">
                            {achievement.unlocked ? '✅' : '🔒'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="text-green-400 font-bold text-2xl">{unlockedCount}</div>
                      <div className="text-gray-400 text-xs">Unlocked</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <div className="text-gray-400 font-bold text-2xl">{totalCount - unlockedCount}</div>
                      <div className="text-gray-400 text-xs">Remaining</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <div className="text-purple-400 font-bold text-2xl">{Math.round(progress)}%</div>
                      <div className="text-gray-400 text-xs">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementSystem;