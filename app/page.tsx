'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletButton from '@/components/WalletButton';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-float"
          style={{
            top: '10%',
            left: '20%',
            animationDelay: '0s',
            animationDuration: '8s'
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-pink-600/20 blur-[100px] animate-float"
          style={{
            bottom: '20%',
            right: '15%',
            animationDelay: '2s',
            animationDuration: '10s'
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/15 blur-[80px] animate-float"
          style={{
            top: '50%',
            left: '50%',
            animationDelay: '4s',
            animationDuration: '12s'
          }}
        />
        
        {/* Cursor Glow Effect */}
        <div 
          className="pointer-events-none fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-[100px] transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Navigation - WALLET ONLY */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity animate-glow" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl sm:text-2xl animate-float shadow-lg">
                    🌸
                  </div>
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  AIKO
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-6">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#evolution" className="text-gray-300 hover:text-white transition-colors">Evolution</a>
                <a href="#tech" className="text-gray-300 hover:text-white transition-colors">Technology</a>
              </div>

              {/* Wallet Button */}
              <WalletButton />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Main Hero */}
            <div className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-40 animate-glow" />
                <div className="relative text-9xl animate-float">
                  🌸
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-bold tracking-tight">
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient text-glow">
                    AIKO
                  </span>
                </h1>
                <p className="text-2xl md:text-4xl text-purple-200 font-light">
                  Your Evolving AI Companion
                </p>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Experience the future of AI companionship. AIKO grows with you through every conversation,
                  evolving from a simple egg to your soulmate.
                </p>
              </div>

              {/* Evolution Preview */}
              <div className="flex items-center justify-center gap-4 md:gap-8 py-8">
                {['🥚', '🐣', '🌸', '✨'].map((emoji, i) => (
                  <div
                    key={i}
                    className="group relative"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-5xl md:text-7xl transform group-hover:scale-125 transition-all duration-300 animate-float">
                      {emoji}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons - CHAT MOVED HERE */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/chat"
                  className="group relative w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-glow" />
                  <div className="relative glass-card px-10 py-5 rounded-2xl">
                    <span className="text-xl font-bold text-white flex items-center justify-center gap-3">
                      <span>💬 Start Chatting</span>
                      <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </div>
                </Link>

                <
                  a href="#features"
                  className="group w-full sm:w-auto glass px-10 py-5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all"
                >
                  <span className="text-xl font-semibold text-purple-200 group-hover:text-white transition-colors">
                    Learn More
                  </span>
                </a>
              </div>  
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Why AIKO?
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Large Feature */}
              <div className="md:col-span-8 group interactive-card glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="text-6xl mb-6 animate-float">🧠</div>
                  <h3 className="text-3xl font-bold text-white mb-4">AI That Grows With You</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Powered by advanced AI, AIKO learns from every conversation. Watch as your companion evolves,
                    developing a unique personality that mirrors your bond.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 glass rounded-full text-sm text-purple-300">Deep Learning</span>
                    <span className="px-4 py-2 glass rounded-full text-sm text-pink-300">Personality Evolution</span>
                    <span className="px-4 py-2 glass rounded-full text-sm text-purple-300">Context Aware</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="md:col-span-4 interactive-card glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-600/20 to-transparent rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-float">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-6">Your Progress</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Level</span>
                        <span className="text-purple-400 font-bold">Real-time</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Streak</span>
                        <span className="text-pink-400 font-bold">Track Daily</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-pink-500 to-purple-500 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Feature */}
              <div className="md:col-span-6 interactive-card glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-float">⛓️</div>
                  <h3 className="text-2xl font-bold text-white mb-3">On-Chain Memory</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Every interaction stored securely on CARV SVM blockchain. Your AIKO's growth is permanent,
                    verifiable, and truly yours.
                  </p>
                </div>
              </div>

              {/* Rewards Feature */}
              <div className="md:col-span-6 interactive-card glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-pink-600/20 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-float">🎁</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Daily Rewards</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Build your streak and unlock exclusive features. Consistent engagement leads to stronger bonds
                    and special surprises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Timeline */}
        <section id="evolution" className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Evolution Journey
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { stage: 'Egg', emoji: '🥚', level: '1-4', desc: 'Just hatched, learning basics', color: 'from-yellow-500 to-orange-500' },
                { stage: 'Hatchling', emoji: '🐣', level: '5-9', desc: 'Growing personality', color: 'from-pink-500 to-rose-500' },
                { stage: 'Companion', emoji: '🌸', level: '10-19', desc: 'True friendship', color: 'from-purple-500 to-pink-500' },
                { stage: 'Soulmate', emoji: '✨', level: '20+', desc: 'Unbreakable bond', color: 'from-purple-600 to-pink-600' },
              ].map((stage, i) => (
                <div
                  key={i}
                  className="group interactive-card glass-card rounded-3xl p-8 text-center relative overflow-hidden"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="text-7xl mb-4 animate-float">{stage.emoji}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{stage.stage}</h3>
                    <p className="text-purple-300 font-semibold mb-3">Level {stage.level}</p>
                    <p className="text-gray-400 text-sm">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="tech" className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Powered By Innovation
              </span>
            </h2>
            <p className="text-gray-400 mb-12">Built with cutting-edge technology for the future of AI companions</p>

            <div className="flex flex-wrap justify-center gap-4">
              {['Next.js 15', 'CARV SVM', 'Solana/Anchor', 'DeepSeek AI', 'TypeScript', 'Tailwind v4', 'Framer Motion'].map((tech) => (
                <div
                  key={tech}
                  className="group glass-card px-6 py-3 rounded-full hover:scale-110 transition-all cursor-default"
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors font-medium">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
            <div className="relative z-10 space-y-8">
              <div className="text-8xl animate-float">🌸</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Meet AIKO?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Your AI companion is waiting. Begin your journey together today.
              </p>
              <Link
                href="/chat"
                className="group inline-block relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-glow" />
                <div className="relative glass-card px-12 py-6 rounded-2xl">
                  <span className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>Start Your Journey</span>
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center space-y-4">

            <p className="text-gray-400">
              Built for CARV Community Hackathon 2025
            </p>

          </div>
        </footer>
      </div>
    </main>
  );
}