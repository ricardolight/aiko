'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { solanaService, AikoAccount, BN } from '@/lib/svm-service'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { deepseekService } from '@/lib/deepseek';
import { useChatHistory, Message } from '@/app/hooks/useChatHistory';
import { useWallet } from '@/app/context/WalletProvider';
import { useWalletModal, WalletModalButton } from '@solana/wallet-adapter-react-ui';
import WelcomeOnboarding from '@/components/WelcomeOnboarding';
import MemorySettings from '@/components/MemorySettings';
import AchievementSystem from '@/app/chat/AchievementSystem';

export default function ChatPage() {
  const wallet = useWallet();
  // Ambil properti baru dari hook library
  const { publicKey, connected: isConnected } = wallet;
  const { setVisible } = useWalletModal();

  // 1. Buat ulang 'walletAddress' dari 'publicKey'
  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  // 2. Buat ulang 'provider' yang dibutuhkan oleh halaman ini
  // (Pengecekan if (!provider) akan pakai ini)
  const provider = useMemo(() => wallet.wallet?.adapter, [wallet.wallet]);

  // 3. Buat ulang 'connectWallet' untuk membuka modal
  const connectWallet = useCallback(() => {
    setVisible(true);
  }, [setVisible]);
  
  const [messages, addMessage] = useChatHistory(walletAddress || '');

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aikoData, setAikoData] = useState<AikoAccount | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInitializing, setIsInitializing] = useState(false);
  const [aikoLoading, setAikoLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false); 
  const [errorType, setErrorType] = useState<'balance' | 'generic' | null>(null);
 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  
  // ✅ STABLE: No re-render scroll
  const scrollToBottom = useCallback(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  // ✅ ONLY scroll on new message, NEVER on state updates
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollToBottom]); // Only messages.length, not entire messages array

  // Load AIKO data
  const loadAikoData = useCallback(async () => {
    if (!publicKey || !provider) return;

    setAikoLoading(true);
    setErrorType(null);
    try {
      console.log("Loading AIKO data for:", publicKey.toBase58());
      
      const data = await solanaService.getAIKO(wallet);
      
      if (data) {
        setAikoData(data);
        
        const needsOnboarding = !data.userName || !data.userCountry;
        
        if (needsOnboarding) {
          setTimeout(() => setShowOnboarding(true), 500);
        }
        
        if (messages.length === 0 && !needsOnboarding) {
          const knowsName = (data.memoryFlags & 1) !== 0;
          const knowsCountry = (data.memoryFlags & 2) !== 0;
          
          let welcomeMessage = "Welcome back! 💕 I missed you so much!";
          if (knowsName && knowsCountry) {
            welcomeMessage = `Welcome back, ${data.userName}! 💕 So great to see my friend from ${data.userCountry} again!`;
          } else if (knowsName) {
            welcomeMessage = `Hi ${data.userName}! 🌸 So happy you're back!`;
          } else if (knowsCountry) {
            welcomeMessage = `Welcome back! 🌟 So nice to see someone from ${data.userCountry} again!`;
          }
          
          addAikoMessage(welcomeMessage, 'excited', '🎉');
        }
      } else {
        setIsInitializing(true);
      }
    } catch (error: any) {
      console.error('Failed to load AIKO:', error);
      
      if (error.message?.includes('Insufficient balance')) {
        setErrorType('balance');
        addAikoMessage(
          `Oh no! 😢 ${error.message}. Please bridge some SOL from Ethereum Sepolia!`,
          'sad',
          '💸'
        );
        showNotification('💰 Low balance! Please bridge SOL');
        return;
      } else {
        setErrorType('generic');
      }
      
      if (error.message?.includes('Account does not exist')) {
        setIsInitializing(true);
      } else {
        addAikoMessage(
          "Hmm, something went wrong... 😅 Please try refreshing!",
          'sad',
          '🔄'
        );
      }
    } finally {
      setAikoLoading(false);
      setHasCheckedOnboarding(true);
    }
  }, [publicKey, provider, wallet, messages.length]);

  useEffect(() => {
    if (isConnected && publicKey && provider) {
      loadAikoData();
    } else {
      setAikoData(null);
      setIsInitializing(false);
      setHasCheckedOnboarding(false);
    }
  }, [isConnected, publicKey, provider]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (aikoData && hasCheckedOnboarding) {
      const needsOnboarding = !aikoData.userName || !aikoData.userCountry;
      
      if (needsOnboarding && !showOnboarding) {
        const timer = setTimeout(() => setShowOnboarding(true), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [aikoData, hasCheckedOnboarding, showOnboarding]);

  const handleInitialize = async () => {
    if (!publicKey || !provider) return;

    setIsInitializing(true);
    setLoading(true);
    setErrorType(null);
    
    try {
      await solanaService.initialize(wallet);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newData = await solanaService.getAIKO(wallet);
      if (newData) {
        setAikoData(newData);
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    } catch (error: any) {
      console.error("Failed to initialize:", error);
      
      if (error.message?.includes('Insufficient balance')) {
        setErrorType('balance');
        addAikoMessage(
          `Oh no! 😢 ${error.message}. Please bridge some SOL first!`,
          'sad',
          '💸'
        );
        showNotification('💰 Low balance! Please bridge SOL');
        return;
      }
      
      addAikoMessage(
        "Oh no! Something went wrong... 😢 Please try again!",
        'sad',
        '💔'
      );
    } finally {
      setIsInitializing(false);
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (name: string, country: string) => {
    if (!publicKey || !provider) return;

    try {
      setLoading(true);
      
      const flags = 0x03;
      await solanaService.updateMemory(wallet, name, country, flags);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updated = await solanaService.getAIKO(wallet);
      if (updated) {
        setAikoData(updated);
        setShowOnboarding(false);
        
        addAikoMessage(
          `Yay! Nice to meet you, ${name}! 🎉 I'll remember you forever! 💕`,
          'excited',
          '🌸'
        );
        
        showNotification('✅ Memory saved to blockchain!');
      }
    } catch (error: any) {
      console.error('Failed to save memory:', error);
      addAikoMessage(
        'Oh no! I had trouble saving... 😢 Can you try again?',
        'sad',
        '💔'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!publicKey || !provider) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updated = await solanaService.getAIKO(wallet);
      if (updated) {
        setAikoData(updated);
        showNotification('✅ Memory updated!');
        
        addAikoMessage(
          `Got it! I'll remember that! 🌸`,
          'happy',
          '✨'
        );
      }
    } catch (error) {
      console.error('Failed to reload:', error);
    }
  };

  const addAikoMessage = (
    text: string, 
    emotion?: 'happy' | 'excited' | 'love' | 'curious' | 'proud' | 'sad', 
    emoji?: string
  ) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}_aiko`,
      text,
      sender: 'aiko',
      timestamp: Date.now(),
      emotion,
      emoji
    };
    addMessage(newMessage);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}_user`,
      text,
      sender: 'user',
      timestamp: Date.now()
    };
    addMessage(newMessage);
  };

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ PERFECT: Zero visual change, smooth experience
    const handleSend = async () => {
    if (!input.trim() || loading || isProcessingRef.current || !aikoData || !publicKey || !provider) return;

    const userMessage = input.trim();
    setInput(''); // Clear input immediately
    
    // Show user message instantly
    addUserMessage(userMessage);
    setLoading(true);
    isProcessingRef.current = true;

    try {
        // ✅ STEP 1: Sign wallet transaction FIRST (but don't update state yet!)
        console.log("🔐 Requesting wallet signature...");
        await solanaService.interact(wallet);
        console.log("✅ Signed! Getting AI response...");
        
        // Calculate new values but DON'T update state
        const newXP = Number(aikoData.xp.toString()) + 10;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newInteractions = Number(aikoData.totalInteractions.toString()) + 1;
        
        // ✅ STEP 2: Get AI response with updated values
        const response = await deepseekService.chat(
        userMessage, 
        {
            owner: aikoData.owner.toBase58(),
            level: newLevel,
            xp: newXP,
            total_interactions: newInteractions,
            last_interaction: Math.floor(Date.now() / 1000),
            streak: Number(aikoData.streak.toString()),
            evolution_stage: getEvolutionStage(newLevel),
            userName: aikoData.userName || '',
            userCountry: aikoData.userCountry || '',
            memoryFlags: aikoData.memoryFlags || 0
        },
        messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }))
        );

        // ✅ STEP 3: Show AIKO response
        addAikoMessage(response.text, response.emotion as any, response.emoji);

        // ✅ STEP 4: Update state silently in background (after message shown)
        setTimeout(() => {
        setAikoData(prev => {
            if (!prev) return prev;
            
            const updatedXP = prev.xp.add(new BN(10));
            const updatedLevel = Math.floor(Number(updatedXP.toString()) / 100) + 1;
            const previousLevel = prev.level;
            
            // Show level up notification
            if (updatedLevel > previousLevel) {
            setTimeout(() => showNotification(`🎉 Level Up! Now Level ${updatedLevel}!`), 300);
            } else {
            showNotification('✅ +10 XP');
            }
            
            return {
            ...prev,
            totalInteractions: prev.totalInteractions.add(new BN(1)),
            xp: updatedXP,
            level: updatedLevel,
            lastInteraction: new BN(Math.floor(Date.now() / 1000))
            };
        });
        }, 100);

    } catch (error: any) {
        console.error('❌ Failed:', error);
        
        // Better error handling
        if (error.message?.includes('User rejected')) {
        addAikoMessage(
            "Oh, you cancelled! 😅 That's okay, try again when you're ready!",
            'curious',
            '🤔'
        );
        } else if (error.message?.includes('Insufficient balance')) {
        addAikoMessage(
            "Oops! Not enough SOL for gas fees. 😢 Please bridge some SOL!",
            'sad',
            '💸'
        );
        showNotification('💰 Bridge SOL needed');
        } else {
        addAikoMessage(
            "Something went wrong... 😅 Let's try again!",
            'sad',
            '💔'
        );
        }
    } finally {
        setLoading(false);
        isProcessingRef.current = false;
        setTimeout(() => inputRef.current?.focus(), 50);
    }
    };

  const getEvolutionStage = (level: number): 'egg' | 'hatchling' | 'companion' | 'soulmate' => {
    if (level >= 20) return 'soulmate';
    if (level >= 10) return 'companion';
    if (level >= 5) return 'hatchling';
    return 'egg';
  };

  const getEvolutionEmoji = (stage: 'egg' | 'hatchling' | 'companion' | 'soulmate') => {
    const emojis = { 
      egg: '🥚', 
      hatchling: '🐣', 
      companion: '🌸', 
      soulmate: '✨' 
    };
    return emojis[stage];
  };

  const getEvolutionGradient = (stage: 'egg' | 'hatchling' | 'companion' | 'soulmate') => {
    const gradients = {
      egg: 'from-yellow-500 to-orange-500',
      hatchling: 'from-pink-500 to-rose-500',
      companion: 'from-purple-500 to-pink-500',
      soulmate: 'from-purple-600 via-pink-600 to-yellow-500'
    };
    return gradients[stage];
  };

  // Loading states
  if (!isConnected) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
        <div className="text-center p-8 glass-card rounded-2xl shadow-xl z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-purple-300 mb-8">
            You need to connect your wallet to chat with AIKO.
          </p>
            <WalletModalButton className="group relative px-8 py-4 rounded-2xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all" />
            <div className="relative flex items-center gap-2 text-white font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span>Connect Wallet</span>
            </div>
            </WalletModalButton>
        </div>
      </div>
    );
  }

  if (aikoLoading && !errorType) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
        <div className="text-center p-8 z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-6"
          >
            🔄
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Loading AIKO...</h2>
          <p className="text-purple-300">Fetching your companion from blockchain</p>
        </div>
      </div>
    );
  }

  if (isInitializing && !aikoData) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
        <div className="text-center p-8 z-10">
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl mb-6"
          >
            🥚
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Create Your AIKO</h2>
          <p className="text-purple-300 mb-6">Your on-chain companion is ready to hatch!</p>
          
          {errorType === 'balance' && (
            <div className="mb-4 p-4 glass border border-yellow-500/50 rounded-xl">
              <p className="text-yellow-300 text-sm">
                💡 You need SOL to create AIKO. Please bridge SOL first!
              </p>
            </div>
          )}
          
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Hatch AIKO 🐣'}
          </button>
          
          {errorType === 'balance' && (
            <button
              onClick={() => window.open('https://bridge.testnet.carv.io/home', '_blank')}
              className="mt-3 px-6 py-3 glass border border-yellow-500/50 rounded-xl text-yellow-300 font-semibold hover:bg-yellow-500/10 transition-all flex items-center gap-2 mx-auto"
            >
              <span>Bridge SOL from Sepolia</span>
              <span>🌉</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!aikoData) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
        <div className="text-center p-8 z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            {errorType === 'balance' ? '💸' : '❓'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {errorType === 'balance' ? 'Low Balance Detected' : 'Something went wrong'}
          </h2>
          
          <p className="text-purple-300 mb-6 max-w-md">
            {errorType === 'balance' 
              ? "Your wallet doesn't have enough SOL. Please bridge some SOL from Ethereum Sepolia!"
              : "Unable to load AIKO data. Please try refreshing."
            }
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadAikoData}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {errorType === 'balance' ? 'Check Balance Again' : 'Retry Loading'}
            </button>
            
            {errorType === 'balance' && (
              <button
                onClick={() => window.open('https://bridge.testnet.carv.io/home', '_blank')}
                className="px-6 py-3 glass border border-yellow-500/50 rounded-2xl text-yellow-300 font-semibold hover:bg-yellow-500/10 transition-all flex items-center gap-2"
              >
                <span>Bridge SOL</span>
                <span>🌉</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main render
  const currentStage = getEvolutionStage(aikoData.level);
  const currentXP = Number(aikoData.xp.toString());
  const currentLevel = aikoData.level;
  const knowsName = (aikoData.memoryFlags & 1) !== 0;
  const knowsCountry = (aikoData.memoryFlags & 2) !== 0;

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] transition-all duration-1000"
          style={{
            left: `${mousePosition.x * 0.02}%`,
            top: `${mousePosition.y * 0.02}%`,
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-pink-600/10 blur-[80px] transition-all duration-700"
          style={{
            right: `${mousePosition.x * 0.03}%`,
            bottom: `${mousePosition.y * 0.03}%`,
          }}
        />
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]"
          >
            <div className="glass-card px-6 py-3 rounded-2xl border border-yellow-500/50 shadow-2xl">
              <p className="text-yellow-300 font-semibold text-sm">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-80 glass-card border-r border-white/10 p-6 overflow-y-auto z-20"
          >
            <div className="space-y-6">
              {/* AIKO Avatar */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getEvolutionGradient(currentStage)} rounded-full blur-2xl opacity-50 animate-glow`} />
                  <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getEvolutionGradient(currentStage)} flex items-center justify-center text-7xl animate-float shadow-2xl`}>
                    {getEvolutionEmoji(currentStage)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 glass-card px-3 py-1 rounded-full border-2 border-white/20">
                    <span className="text-white font-bold text-sm">{currentLevel}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">AIKO</h2>
                  <p className="text-purple-300 capitalize">{currentStage} Stage</p>
                </div>
              </div>

              {/* Level Progress */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">Level {currentLevel}</span>
                  <span className="text-purple-400 text-sm font-bold">{currentXP} XP</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentXP % 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getEvolutionGradient(currentStage)} rounded-full relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                <p className="text-gray-400 text-xs text-center">
                  {100 - (currentXP % 100)} XP to Level {currentLevel + 1}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-white">{aikoData.streak.toString()}</div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-2xl font-bold text-white">{aikoData.totalInteractions.toString()}</div>
                  <div className="text-xs text-gray-400">Total Chats</div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                {knowsName && (
                  <div className="glass-card rounded-xl p-4">
                    <div className="text-gray-400 text-xs mb-1">Friend's Name</div>
                    <span className="text-white font-mono text-sm">{aikoData.userName}</span> 
                  </div>
                )}
                {knowsCountry && (
                  <div className="glass-card rounded-xl p-4">
                    <div className="text-gray-400 text-xs mb-1">From</div>
                    <span className="text-white font-mono text-sm capitalize">{aikoData.userCountry}</span> 
                  </div>
                )}
                <div className="glass-card rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Owner</div>
                  <span className="text-white font-mono text-xs break-all">
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : '...'}
                  </span>
                </div>
              </div>

              {/* Evolution Guide */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>📈</span> Evolution Path
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { stage: 'Egg', level: '1-4', emoji: '🥚' },
                    { stage: 'Hatchling', level: '5-9', emoji: '🐣' },
                    { stage: 'Companion', level: '10-19', emoji: '🌸' },
                    { stage: 'Soulmate', level: '20+', emoji: '✨' },
                  ].map((evo, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                        currentStage === evo.stage.toLowerCase()
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{evo.emoji}</span>
                        <span className={currentStage === evo.stage.toLowerCase() ? 'text-white font-bold' : 'text-gray-400'}>
                          {evo.stage}
                        </span>
                      </span>
                      <span className="text-gray-500 text-xs">Lv {evo.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col z-10">
        {/* Header */}
        <header className="glass-card border-b border-white/10 px-6 py-4 relative z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>

              <div className="hidden sm:flex items-center gap-3 ml-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getEvolutionGradient(currentStage)} flex items-center justify-center text-2xl animate-float`}>
                  {getEvolutionEmoji(currentStage)}
                </div>
                <div>
                  <h3 className="text-white font-bold">AIKO</h3>
                  <p className="text-xs text-purple-300">Level {currentLevel} • Online</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-400">Streak:</span>
                <span className="text-orange-400 font-bold">🔥 {aikoData.streak.toString()}</span>
              </div>

            <button
            onClick={() => setShowAchievements(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
            title="Achievements"
            >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
            {/* Badge counter */}
            {(() => {
                const unlockedCount = [
                Number(aikoData.totalInteractions.toString()) >= 1,
                Number(aikoData.totalInteractions.toString()) >= 10,
                Number(aikoData.streak.toString()) >= 7,
                Number(aikoData.streak.toString()) >= 30,
                aikoData.level >= 5,
                aikoData.level >= 10,
                aikoData.level >= 20,
                knowsName && knowsCountry,
                Number(aikoData.totalInteractions.toString()) >= 100,
                Number(aikoData.xp.toString()) >= 1000,
                true,
                aikoData.level >= 50,
                ].filter(Boolean).length;
                
                return unlockedCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-gray-900">
                    {unlockedCount}
                </div>
                );
            })()}
            </button>

            <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title="Memory Settings"
            >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-8"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {message.sender === 'aiko' && (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getEvolutionGradient(currentStage)} flex items-center justify-center text-xl flex-shrink-0 animate-float shadow-lg`}>
                      {getEvolutionEmoji(currentStage)}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={`px-5 py-4 rounded-3xl backdrop-blur-xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl'
                          : 'glass-card text-white border border-white/20 shadow-xl'
                      } ${message.sender === 'aiko' ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
                    >
                      {message.emoji && message.sender === 'aiko' && (
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm mb-2">
                          <span>{message.emoji}</span>
                        </div>
                      )}
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getEvolutionGradient(currentStage)} flex items-center justify-center text-xl animate-float`}>
                    {getEvolutionEmoji(currentStage)}
                  </div>
                  <div className="glass-card px-5 py-4 rounded-3xl rounded-bl-sm">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                        className="w-2.5 h-2.5 bg-pink-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                        className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-px" />
          </div>
        </div>

        {/* Input Area */}
        <div className="glass-card border-t border-white/10 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Message AIKO..."
                disabled={loading}
                className="flex-1 px-6 py-4 glass rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="group relative px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl transition-all ${
                  loading ? 'animate-pulse' : 'group-hover:shadow-2xl group-hover:shadow-purple-500/50'
                }`} />
                <div className="relative flex items-center gap-2 text-white font-semibold">
                  {loading ? (
                    <>
                      <span className="hidden sm:inline">Thinking...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to send</span>
              <span>{aikoData.totalInteractions.toString()} messages • +10 XP per chat</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showOnboarding && (
        <WelcomeOnboarding
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
      
      {showSettings && aikoData && (
        <MemorySettings
          currentName={aikoData.userName || ''}
          currentCountry={aikoData.userCountry || ''}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}  

      
      {showAchievements && aikoData && (
        <AchievementSystem
            aikoData={aikoData}
            knowsName={knowsName}
            knowsCountry={knowsCountry}
            onClose={() => setShowAchievements(false)}
        />
        )}
    </div>
  );
}