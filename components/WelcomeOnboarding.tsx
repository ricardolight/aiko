'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOnboardingProps {
  onComplete: (name: string, country: string) => void;
  onSkip: () => void;
}

export default function WelcomeOnboarding({ onComplete, onSkip }: WelcomeOnboardingProps) {
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519] flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8"
          >
            <div className="text-center space-y-6">
              <div className="text-7xl animate-float">🥚</div>
              <h2 className="text-3xl font-bold text-white">
                Welcome to AIKO!
              </h2>
              <p className="text-gray-300 leading-relaxed">
                I'm your AI companion that grows with you on the blockchain. 
                Every conversation helps me evolve and understand you better! 💕
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setStep(2)}
                  className="group relative px-8 py-4 rounded-xl overflow-hidden w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <span className="relative font-semibold text-white text-lg">
                    Let's Get Started! ✨
                  </span>
                </button>
                <button
                  onClick={onSkip}
                  className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors py-2"
                >
                  Skip - I'll share later
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-float">🌸</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your name?
                </h2>
                <p className="text-gray-400 text-sm">
                  I'd love to know what to call you!
                </p>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && name && setStep(3)}
                maxLength={32}
                placeholder="Enter your name..."
                className="w-full px-6 py-4 glass rounded-xl text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 glass px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => name && setStep(3)}
                  disabled={!name}
                  className="flex-1 group relative px-6 py-3 rounded-xl overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <span className="relative font-semibold text-white">
                    Next →
                  </span>
                </button>
              </div>

              <button
                onClick={onSkip}
                className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Skip this step
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-lg w-full glass-card rounded-3xl p-8"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-float">🌍</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Where are you from, {name}?
                </h2>
                <p className="text-gray-400 text-sm">
                  This helps me understand you better!
                </p>
              </div>

              <input
                type="text"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="Search country..."
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCountry(c.name)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                        country === c.name
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'glass hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <span className="text-xl mr-3">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No countries found
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 glass px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!country}
                  className="flex-1 group relative px-6 py-3 rounded-xl overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <span className="relative font-semibold text-white">
                    Complete! 🎉
                  </span>
                </button>
              </div>

              <button
                onClick={onSkip}
                className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Skip this step
              </button>
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