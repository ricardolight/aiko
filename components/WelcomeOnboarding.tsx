'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOnboardingProps {
  isOpen: boolean;  
  onComplete: (name: string, country: string) => void;
}

export default function WelcomeOnboarding({ isOpen, onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [searchCountry, setSearchCountry] = useState('');

  const countries = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'OTHER', name: 'Other', flag: '🌍' },
  ];

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const handleComplete = () => {
    if (name && country) {
      onComplete(name, country);
    }
  };

  // Reset state ketika onboarding dibuka
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName('');
      setCountry('');
      setSearchCountry('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-7xl animate-float"
              >
                🥚
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-white mb-3">
                  Welcome to AIKO! 🌸
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  I'm your personal AI companion that grows with you! 
                  Let me get to know you better so we can build our special bond together! 💕
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => setStep(2)}
                  className="group relative px-8 py-4 rounded-xl overflow-hidden w-full transition-transform hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all group-hover:from-purple-500 group-hover:to-pink-500" />
                  <span className="relative font-semibold text-white text-lg">
                    Let Me Introduce Myself! ✨
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-5xl mb-4 animate-float"
                >
                  👋
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  What should I call you?
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm"
                >
                  I'd love to know your name so I can personalize our conversations!
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && name && setStep(3)}
                  maxLength={32}
                  placeholder="Enter your beautiful name..."
                  className="w-full px-6 py-4 glass rounded-xl text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all"
                  autoFocus
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 glass px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/20"
                >
                  Back
                </button>
                
                <button
                  onClick={() => name && setStep(3)}
                  disabled={!name}
                  className="flex-1 group relative px-6 py-3 rounded-xl overflow-hidden disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all group-hover:from-purple-500 group-hover:to-pink-500" />
                  <span className="relative font-semibold text-white">
                    Continue 🌟
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-5xl mb-4 animate-float"
                >
                  🌍
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Where are you from, {name}?
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm"
                >
                  Knowing your location helps me understand your culture and context better!
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  type="text"
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  placeholder="Search for your country..."
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar"
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c, index) => (
                    <motion.button
                      key={c.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      onClick={() => setCountry(c.name)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all border ${
                        country === c.name
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                          : 'glass hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xl mr-3">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No countries found
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 glass px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/20"
                >
                  Back
                </button>
                
                <button
                  onClick={handleComplete}
                  disabled={!country}
                  className="flex-1 group relative px-6 py-3 rounded-xl overflow-hidden disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all group-hover:from-purple-500 group-hover:to-pink-500" />
                  <span className="relative font-semibold text-white">
                    Complete Our Bond! 💕
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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
}