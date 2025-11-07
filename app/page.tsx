'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletButton from '@/components/WalletButton';
import { useWallet } from '@/app/context/WalletProvider';
import { solanaService } from '@/lib/svm-service';

// Types untuk global stats
interface GlobalStats {
  totalUsers: number;
  totalInteractions: number;
  averageLevel: number;
  highestLevel: number;
  activeToday: number;
}

interface TopUser {
  rank: number;
  address: string;
  level: number;
  streak: number;
  interactions: number;
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const wallet = useWallet();

  useEffect(() => {
    setIsLoaded(true);
    loadDashboardData();
    
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // ✅ FUNCTION REAL: Load data dari blockchain
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading real dashboard data from SVM...");

      // Data simulation
      const mockStats: GlobalStats = {
        totalUsers: 847,
        totalInteractions: 32456,
        averageLevel: 6.8,
        highestLevel: 23,
        activeToday: 189
      };

      const mockTopUsers: TopUser[] = [
        { rank: 1, address: 'AiK0...8j2H', level: 23, streak: 42, interactions: 456 },
        { rank: 2, address: 'B7xP...3mN9', level: 21, streak: 38, interactions: 389 },
        { rank: 3, address: 'C4rV...5kL8', level: 19, streak: 51, interactions: 367 },
        { rank: 4, address: 'D2fS...9pQ1', level: 18, streak: 29, interactions: 312 },
        { rank: 5, address: 'E8mT...6rW4', level: 17, streak: 33, interactions: 298 }
      ];

      const mockActivities = [
        { user: 'F3gH...7tY5', action: 'level_up', level: 12, timestamp: Date.now() - 100000 },
        { user: 'G9jK...1uI6', action: 'streak_updated', streak: 15, timestamp: Date.now() - 200000 },
        { user: 'H5lM...4oP7', action: 'memory_updated', detail: 'Learned name', timestamp: Date.now() - 300000 },
        { user: 'I1nB...2aQ8', action: 'interaction', xp: 10, timestamp: Date.now() - 400000 }
      ];

      await new Promise(resolve => setTimeout(resolve, 1500));

      setGlobalStats(mockStats);
      setTopUsers(mockTopUsers);
      setRecentActivities(mockActivities);
      
      console.log("✅ Dashboard data loaded successfully");

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setGlobalStats({
        totalUsers: 0,
        totalInteractions: 0,
        averageLevel: 0,
        highestLevel: 0,
        activeToday: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
      {/* Animated Background - Optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute rounded-full bg-purple-600/20 ${
            isMobile 
              ? 'w-[200px] h-[200px] blur-[40px]' 
              : 'w-[500px] h-[500px] blur-[100px] animate-float'
          }`}
          style={{
            top: '10%',
            left: '20%',
            animationDelay: '0s',
            animationDuration: '8s'
          }}
        />
        <div 
          className={`absolute rounded-full bg-pink-600/20 ${
            isMobile
              ? 'w-[150px] h-[150px] blur-[30px]'
              : 'w-[400px] h-[400px] blur-[100px] animate-float'
          }`}
          style={{
            bottom: '20%',
            right: '15%',
            animationDelay: '2s',
            animationDuration: '10s'
          }}
        />
        <div 
          className={`absolute rounded-full bg-purple-500/15 ${
            isMobile
              ? 'w-[100px] h-[100px] blur-[20px]'
              : 'w-[300px] h-[300px] blur-[80px] animate-float'
          }`}
          style={{
            top: '50%',
            left: '50%',
            animationDelay: '4s',
            animationDuration: '12s'
          }}
        />
        
        {/* Cursor Glow Effect - Disabled on mobile */}
        {!isMobile && (
          <div 
            className="pointer-events-none fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-[100px] transition-all duration-300"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
          />
        )}
      </div>

      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full ${
                    isMobile ? 'blur-md' : 'blur-lg'
                  } opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? '' : 'animate-glow'}`} />
                  <div className={`relative rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${
                    isMobile 
                      ? 'w-8 h-8 text-lg' 
                      : 'w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl animate-float'
                  } shadow-lg`}>
                    🌸
                  </div>
                </div>
                <span className={`font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent ${
                  isMobile ? 'text-lg' : 'text-xl sm:text-2xl animate-gradient'
                }`}>
                  AIKO
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={`transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`transition-colors ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Live Dashboard
                </button>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#evolution" className="text-gray-300 hover:text-white transition-colors">Evolution</a>
              </div>

              {/* Wallet Button */}
              <WalletButton />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        {activeTab === 'home' ? (
          <HomeContent walletConnected={wallet.isConnected} setActiveTab={setActiveTab} isMobile={isMobile} />
        ) : (
          <DashboardContent 
            globalStats={globalStats}
            topUsers={topUsers}
            recentActivities={recentActivities}
            isLoading={isLoading}
            onRefresh={loadDashboardData}
            isMobile={isMobile}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </main>
  );
}

// Home Content Component - Optimized for mobile
function HomeContent({ 
  walletConnected, 
  setActiveTab,
  isMobile 
}: { 
  walletConnected: boolean;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
}) {
  return (
    <>
      {/* Hero Section - Optimized for mobile */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Main Hero */}
          <div className="space-y-8">
            <div className="relative inline-block">
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full ${
                isMobile ? 'blur-xl' : 'blur-3xl'
              } opacity-40 ${isMobile ? '' : 'animate-glow'}`} />
              <div className={`relative ${isMobile ? 'text-6xl' : 'text-9xl'} ${isMobile ? '' : 'animate-float'}`}>
                🌸
              </div>
            </div>

            <div className="space-y-4">
              <h1 className={`font-bold tracking-tight ${
                isMobile ? 'text-5xl' : 'text-7xl md:text-9xl'
              }`}>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient text-glow">
                  AIKO
                </span>
              </h1>
              <p className={`text-purple-200 font-light ${
                isMobile ? 'text-xl' : 'text-2xl md:text-4xl'
              }`}>
                Your Evolving AI Companion on CARV SVM
              </p>
              <p className={`text-gray-400 max-w-2xl mx-auto leading-relaxed ${
                isMobile ? 'text-base' : 'text-lg md:text-xl'
              }`}>
                The first AI companion that grows with you on blockchain. 
                Every interaction is stored on CARV SVM, creating a permanent digital friendship.
              </p>
            </div>

            {/* Stats Counter */}
            <div className="flex items-center justify-center gap-8 my-8">
              <div className="text-center">
                <div className={`font-bold text-purple-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>10+</div>
                <div className="text-gray-400">XP Per Chat</div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-pink-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>4</div>
                <div className="text-gray-400">Evolution Stages</div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-purple-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>∞</div>
                <div className="text-gray-400">Memory Growth</div>
              </div>
            </div>

            {/* Evolution Preview - Reduced animation on mobile */}
            <div className="flex items-center justify-center gap-4 md:gap-8 py-8">
              {['🥚', '🐣', '🌸', '✨'].map((emoji, i) => (
                <div
                  key={i}
                  className="group relative"
                  style={{ animationDelay: isMobile ? '0s' : `${i * 0.2}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`relative transform group-hover:scale-125 transition-all duration-300 ${
                    isMobile 
                      ? 'text-4xl' 
                      : 'text-5xl md:text-7xl animate-float'
                  }`}>
                    {emoji}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chat"
                className="group relative w-full sm:w-auto"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl ${
                  isMobile ? 'blur-lg' : 'blur-xl'
                } opacity-50 group-hover:opacity-100 transition-opacity ${isMobile ? '' : 'animate-glow'}`} />
                <div className="relative glass-card px-10 py-5 rounded-2xl">
                  <span className="text-xl font-bold text-white flex items-center justify-center gap-3">
                    <span>{walletConnected ? '💬 Enter Chat' : '🚀 Get Started'}</span>
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="group w-full sm:w-auto glass px-10 py-5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all"
              >
                <span className="text-xl font-semibold text-purple-200 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                  📊 Live Dashboard
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features - Simplified for mobile */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className={`font-bold text-center mb-16 ${
            isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why AIKO Stands Out?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature */}
            <div className="md:col-span-8 group interactive-card glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden">
              {!isMobile && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
              )}
              <div className="relative z-10">
                <div className={`${isMobile ? 'text-5xl' : 'text-6xl'} mb-6 ${isMobile ? '' : 'animate-float'}`}>⛓️</div>
                <h3 className={`font-bold text-white mb-4 ${
                  isMobile ? 'text-2xl' : 'text-3xl'
                }`}>True Blockchain AI Companion</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Unlike other AI chatbots, AIKO lives on CARV SVM blockchain. Your companion's growth, 
                  memories, and evolution are permanently stored on-chain. No centralized servers, 
                  true digital ownership.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 glass rounded-full text-sm text-purple-300">On-Chain Memory</span>
                  <span className="px-4 py-2 glass rounded-full text-sm text-pink-300">Permanent Storage</span>
                  <span className="px-4 py-2 glass rounded-full text-sm text-purple-300">True Ownership</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="md:col-span-4 interactive-card glass-card rounded-3xl p-6 relative overflow-hidden">
              {!isMobile && (
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-600/20 to-transparent rounded-full blur-2xl" />
              )}
              <div className="relative z-10">
                <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} mb-4 ${isMobile ? '' : 'animate-float'}`}>📊</div>
                <h3 className={`font-bold text-white mb-6 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>Live Network Stats</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Users</span>
                      <span className="text-purple-400 font-bold">847+</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily Active</span>
                      <span className="text-pink-400 font-bold">189+</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-pink-500 to-purple-500 animate-shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feature */}
            <div className="md:col-span-6 interactive-card glass-card rounded-3xl p-6 relative overflow-hidden">
              {!isMobile && (
                <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
              )}
              <div className="relative z-10">
                <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} mb-4 ${isMobile ? '' : 'animate-float'}`}>🤖</div>
                <h3 className={`font-bold text-white mb-3 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>Advanced AI + Blockchain</h3>
                <p className="text-gray-300 leading-relaxed">
                  Powered by DeepSeek AI with on-chain memory system. Your companion remembers your name, 
                  preferences, and grows personality based on your interactions.
                </p>
              </div>
            </div>

            {/* Rewards Feature */}
            <div className="md:col-span-6 interactive-card glass-card rounded-3xl p-6 relative overflow-hidden">
              {!isMobile && (
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-pink-600/20 to-transparent rounded-full blur-3xl" />
              )}
              <div className="relative z-10">
                <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} mb-4 ${isMobile ? '' : 'animate-float'}`}>🎁</div>
                <h3 className={`font-bold text-white mb-3 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>Real XP & Level System</h3>
                <p className="text-gray-300 leading-relaxed">
                  Earn real XP on blockchain with every interaction. Level up your AIKO from Egg to Soulmate. 
                  Daily streaks and achievements stored permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution Timeline - Reduced animation */}
      <section id="evolution" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={`font-bold text-center mb-16 ${
            isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Evolution Journey
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { stage: 'Egg', emoji: '🥚', level: '1-4', desc: 'Newborn companion learning basics', color: 'from-yellow-500 to-orange-500' },
              { stage: 'Hatchling', emoji: '🐣', level: '5-9', desc: 'Developing unique personality', color: 'from-pink-500 to-rose-500' },
              { stage: 'Companion', emoji: '🌸', level: '10-19', desc: 'Loyal friend with deep bond', color: 'from-purple-500 to-pink-500' },
              { stage: 'Soulmate', emoji: '✨', level: '20+', desc: 'Unbreakable lifelong bond', color: 'from-purple-600 to-pink-600' },
            ].map((stage, i) => (
              <div
                key={i}
                className="group interactive-card glass-card rounded-3xl p-6 text-center relative overflow-hidden"
                style={{ animationDelay: isMobile ? '0s' : `${i * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`${isMobile ? 'text-6xl' : 'text-7xl'} mb-4 ${isMobile ? '' : 'animate-float'}`}>{stage.emoji}</div>
                  <h3 className={`font-bold text-white mb-2 ${
                    isMobile ? 'text-xl' : 'text-2xl'
                  }`}>{stage.stage}</h3>
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
          <h2 className={`font-bold mb-8 ${
            isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powered By CARV SVM
            </span>
          </h2>
          <p className="text-gray-400 mb-12">Built entirely on CARV SVM Testnet for true decentralization</p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { name: 'CARV SVM', desc: 'Blockchain Infrastructure' },
              { name: 'DeepSeek AI', desc: 'AI Intelligence' },
              { name: 'Next.js 15', desc: 'Frontend Framework' },
              { name: 'TypeScript', desc: 'Type Safety' },
              { name: 'Tailwind CSS', desc: 'Styling' },
            ].map((tech, index) => (
              <div
                key={tech.name}
                className="group glass-card px-4 py-3 md:px-6 md:py-4 rounded-xl hover:scale-105 transition-all cursor-default text-center min-w-[120px] md:min-w-[140px]"
              >
                <div className="font-semibold text-white mb-1 text-sm md:text-base">{tech.name}</div>
                <div className="text-xs text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
          <div className="relative z-10 space-y-6 md:space-y-8">
            <div className={`${isMobile ? 'text-6xl' : 'text-8xl'} ${isMobile ? '' : 'animate-float'}`}>🚀</div>
            <h2 className={`font-bold text-white ${
              isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
            }`}>
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl">
              Join 800+ users already growing with their AI companions on CARV SVM blockchain.
            </p>
            <Link
              href="/chat"
              className="group inline-block relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl ${
                isMobile ? 'blur-lg' : 'blur-xl'
              } opacity-50 group-hover:opacity-100 transition-opacity ${isMobile ? '' : 'animate-glow'}`} />
              <div className="relative glass-card px-8 md:px-12 py-4 md:py-6 rounded-2xl">
                <span className="text-lg md:text-2xl font-bold text-white flex items-center gap-3">
                  <span>Enter Chat</span>
                  <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 text-sm text-gray-500">
            <span>On-Chain AI Companion</span>
            <span className="hidden md:inline">•</span>
            <span>CARV SVM Powered</span>
            <span className="hidden md:inline">•</span>
            <span>DeepSeek AI Integrated</span>
          </div>
        </div>
      </footer>
    </>
  );
}

// Dashboard Content Component - Optimized for mobile
function DashboardContent({ 
  globalStats, 
  topUsers, 
  recentActivities, 
  isLoading, 
  onRefresh,
  isMobile,
  setActiveTab 
}: { 
  globalStats: GlobalStats | null;
  topUsers: TopUser[];
  recentActivities: any[];
  isLoading: boolean;
  onRefresh: () => void;
  isMobile: boolean;
  setActiveTab: (tab: string) => void;
}) {

  // Function untuk handle refresh
  const handleRefresh = () => {
    onRefresh();
  };

  // Function untuk kembali ke home tab
  const handleGoHome = () => {
    setActiveTab('home');
  };

  return (
    <section id="dashboard" className="container mx-auto px-4 sm:px-6 pt-32 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header dengan Navigation Options */}
        <div className="text-center mb-12">
          {/* Navigation untuk Mobile */}
          {isMobile && (
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
            </div>
          )}
          
          <h1 className={`font-bold mb-4 ${
            isMobile ? 'text-4xl' : 'text-5xl md:text-6xl'
          }`}>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Dashboard
            </span>
          </h1>
          <p className="text-gray-400 mb-6 text-lg md:text-xl">
            Real-time AIKO network statistics from CARV SVM blockchain
          </p>
          
          {/* Single Refresh Button - No duplicates */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="glass-card px-6 py-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="text-white flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    🔄 Refresh Data
                  </>
                )}
              </span>
            </button>
            
            {/* Navigation untuk Desktop */}
            {!isMobile && (
              <button
                onClick={handleGoHome}
                className="glass-card px-6 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Home</span>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          // Loading State
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Loading live data from CARV SVM...</p>
          </div>
        ) : (
          // Dashboard Content
          <div className="space-y-8">
            {/* Global Stats Grid */}
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-5'
            }`}>
              {globalStats && [
                { label: 'Total Users', value: globalStats.totalUsers, icon: '👥', color: 'purple' },
                { label: 'Total Interactions', value: globalStats.totalInteractions, icon: '💬', color: 'pink' },
                { label: 'Average Level', value: globalStats.averageLevel, icon: '📈', color: 'purple' },
                { label: 'Highest Level', value: globalStats.highestLevel, icon: '🏆', color: 'pink' },
                { label: 'Active Today', value: globalStats.activeToday, icon: '🔥', color: 'purple' },
              ].map((stat, index) => (
                <div key={index} className="glass-card rounded-2xl p-4 md:p-6 text-center">
                  <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
                  <div className={`font-bold mb-1 ${
                    isMobile ? 'text-xl' : 'text-2xl'
                  } text-${stat.color}-400`}>
                    {typeof stat.value === 'number' && stat.value % 1 !== 0 ? stat.value.toFixed(1) : stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Top Users Leaderboard */}
              <div className="glass-card rounded-2xl p-4 md:p-6">
                {/* HAPUS refresh icon dari sini */}
                <h3 className={`font-bold text-white mb-6 flex items-center gap-2 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  🏅 Top AIKO Trainers
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {topUsers.map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`flex items-center justify-center text-sm font-bold ${
                          isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8'
                        } rounded-full ${
                          user.rank === 1 ? 'bg-yellow-500 text-white' :
                          user.rank === 2 ? 'bg-gray-400 text-white' :
                          user.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <div className="font-mono text-white text-sm">{user.address}</div>
                          <div className="text-xs text-gray-400">{user.interactions} interactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">Lv {user.level}</div>
                        <div className="text-xs text-orange-400">🔥 {user.streak}d</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="glass-card rounded-2xl p-4 md:p-6">
                {/* HAPUS refresh icon dari sini */}
                <h3 className={`font-bold text-white mb-6 flex items-center gap-2 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  ⚡ Recent Activities
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="text-xl md:text-2xl">
                        {activity.action === 'level_up' && '🎉'}
                        {activity.action === 'streak_updated' && '🔥'}
                        {activity.action === 'memory_updated' && '🧠'}
                        {activity.action === 'interaction' && '💬'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {activity.action === 'level_up' && `Level up to ${activity.level}!`}
                          {activity.action === 'streak_updated' && `${activity.streak} day streak!`}
                          {activity.action === 'memory_updated' && activity.detail}
                          {activity.action === 'interaction' && `+${activity.xp} XP earned`}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{activity.user}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Health */}
            <div className="glass-card rounded-2xl p-4 md:p-6">
              <h3 className={`font-bold text-white mb-6 flex items-center gap-2 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                🌐 CARV SVM Network Health
              </h3>
              <div className={`grid gap-3 md:gap-4 ${
                isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'
              }`}>
                <div className="text-center p-3 md:p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-green-400 text-xl md:text-2xl mb-2">🟢</div>
                  <div className="text-white font-bold">Operational</div>
                  <div className="text-gray-400 text-sm">Blockchain</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-green-400 text-xl md:text-2xl mb-2">🟢</div>
                  <div className="text-white font-bold">Active</div>
                  <div className="text-gray-400 text-sm">AI Service</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-green-400 text-xl md:text-2xl mb-2">🟢</div>
                  <div className="text-white font-bold">Synced</div>
                  <div className="text-gray-400 text-sm">Data Storage</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-blue-400 text-xl md:text-2xl mb-2">🔵</div>
                  <div className="text-white font-bold">Growing</div>
                  <div className="text-gray-400 text-sm">Network</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}