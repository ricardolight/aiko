'use client';

import { useState, useEffect, useRef } from 'react';
import { solanaService, AikoAccount } from '@/lib/svm-service'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { deepseekService } from '@/lib/deepseek';
import { useChatHistory, Message, DeepSeekMessage } from '@/app/hooks/useChatHistory';
import { useWallet } from '@/app/context/WalletProvider';

export default function ChatPage() {
  const wallet = useWallet();
  const { isConnected, address: walletAddress, provider, connectWallet, publicKey } = wallet;
  const [messages, addMessage] = useChatHistory(walletAddress || '');

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aikoData, setAikoData] = useState<AikoAccount | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInitializing, setIsInitializing] = useState(false);
  const [aikoLoading, setAikoLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // PERBAIKAN: useEffect untuk load AIKO data
  useEffect(() => {
    if (isConnected && publicKey && provider) {
      loadAikoData();
    } else {
      // Reset state jika wallet disconnected
      setAikoData(null);
      setIsInitializing(false);
    }
  }, [isConnected, publicKey, provider]);

  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // PERBAIKAN: loadAikoData function
  const loadAikoData = async () => {
    if (!publicKey || !provider) return;

    setAikoLoading(true);
    try {
      console.log("Loading AIKO data for:", publicKey.toBase58());
      
      // Pastikan kita passing wallet context yang lengkap
      const walletContext = {
        publicKey,
        isConnected,
        provider,
        connectWallet,
        disconnectWallet: wallet.disconnectWallet,
        address: publicKey.toBase58(),
        balance: wallet.balance,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      };

      const data = await solanaService.getAIKO(walletContext);
      
      if (data) {
        setAikoData(data);
        if (messages.length === 0) {
          const daysSince = 0;
          addAikoMessage(
            `Welcome back! 💕 We've been friends for ${daysSince} days! I missed you so much!`,
            'excited',
            '🎉'
          );
        }
      } else {
        // Data tidak ditemukan, user baru
        console.log("No AIKO account found, user needs to initialize");
        setIsInitializing(true);
      }
    } catch (error: any) {
      console.error('Gagal memuat AIKO:', error);
      // Handle specific error cases
      if (error.message?.includes('Account does not exist')) {
        setIsInitializing(true);
      }
    } finally {
      setAikoLoading(false);
    }
  };

  // PERBAIKAN: handleInitialize function
  const handleInitialize = async () => {
    if (!publicKey || !provider) return;

    setIsInitializing(true);
    setLoading(true);
    
    try {
      const walletContext = {
        publicKey,
        isConnected,
        provider,
        connectWallet,
        disconnectWallet: wallet.disconnectWallet,
        address: publicKey.toBase58(),
        balance: wallet.balance,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      };

      console.log("Initializing AIKO account...");
      await solanaService.initialize(walletContext);
      
      // Tunggu sebentar sebelum fetch data baru
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Load data AIKO yang baru
      const newData = await solanaService.getAIKO(walletContext);
      if (newData) {
        setAikoData(newData);
        addAikoMessage(
          "Konnichiwa! 🌸 I just hatched from my egg! I'm so excited to meet you! Let's grow together!",
          'excited',
          '✨'
        );
      }
    } catch (error: any) {
      console.error("Gagal initialize AIKO:", error);
      addAikoMessage(
        "Oh no! Something went wrong while creating my account... 😢 Please try again!",
        'sad',
        '💔'
      );
    } finally {
      setIsInitializing(false);
      setLoading(false);
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
      emotion, // ← Sekarang type match
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
    setTimeout(() => setNotification(null), 4000);
  };

  // PERBAIKAN: handleSend function - fix type mismatch dengan AIKOData yang benar
  const handleSend = async () => {
    if (!input.trim() || loading || !aikoData || !publicKey || !provider) return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);
    setLoading(true);

    try {
      // Prepare wallet context
      const walletContext = {
        publicKey,
        isConnected,
        provider,
        connectWallet,
        disconnectWallet: wallet.disconnectWallet,
        address: publicKey.toBase58(),
        balance: wallet.balance,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions
      };

      console.log("Sending interact transaction...");
      const txSignature = await solanaService.interact(walletContext);
      console.log("Transaksi terkirim:", txSignature);

      // Tunggu sebentar sebelum fetch data update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ambil data terbaru dari SVM
      const updatedAiko = await solanaService.getAIKO(walletContext);
      if (updatedAiko) {
        // Cek apakah ada level up
        if (aikoData.level < updatedAiko.level) {
          showNotification(`🎉 Level Up! Kamu sekarang Level ${updatedAiko.level}!`);
        }
        setAikoData(updatedAiko);

        // Prepare data untuk AI - PERBAIKAN: Sesuaikan dengan AIKOData interface
        const historyForAI: DeepSeekMessage[] = messages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        // PERBAIKAN: Convert data blockchain ke format AIKOData yang diharapkan
        const aikoDataForAI = {
          owner: updatedAiko.owner.toBase58(), // Convert PublicKey to string
          level: updatedAiko.level,
          xp: Number(updatedAiko.xp.toString()),
          total_interactions: Number(updatedAiko.totalInteractions.toString()),
          last_interaction: Math.floor(Number(updatedAiko.lastInteraction.toString()) / 1000), // Convert to seconds
          streak: Number(updatedAiko.streak.toString()),
          birthday: Math.floor(Date.now() / 1000), // Default timestamp untuk sekarang
          evolution_stage: getEvolutionStage(updatedAiko.level) as 'egg' | 'hatchling' | 'companion' | 'soulmate'
        };

        console.log("Sending to DeepSeek:", aikoDataForAI);

        // Get AI response
        const response = await deepseekService.chat(
          userMessage, 
          aikoDataForAI, 
          historyForAI 
        );
        
        addAikoMessage(
          response.text, 
          response.emotion as 'happy' | 'excited' | 'love' | 'curious' | 'proud' | 'sad', // ← Type assertion
          response.emoji
        );
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      addAikoMessage(
        "Oh no! Something went wrong... 😢 Please check your connection and try again.",
        'sad',
        '💔'
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Helper functions tetap sama
  const getEvolutionStage = (level: number): string => {
    if (level >= 20) return 'soulmate';
    if (level >= 10) return 'companion';
    if (level >= 5) return 'hatchling';
    return 'egg';
  };

  const getEvolutionEmoji = (stage: string) => {
    const emojis = { egg: '🥚', hatchling: '🐣', companion: '🌸', soulmate: '✨' };
    return emojis[stage as keyof typeof emojis] || '🥚';
  };

  const getEvolutionGradient = (stage: string) => {
    const gradients = {
      egg: 'from-yellow-500 to-orange-500',
      hatchling: 'from-pink-500 to-rose-500',
      companion: 'from-purple-500 to-pink-500',
      soulmate: 'from-purple-600 via-pink-600 to-yellow-500'
    };
    return gradients[stage as keyof typeof gradients] || 'from-purple-500 to-pink-500';
  };

  // PERBAIKAN: Tampilan loading yang lebih informatif
  if (!isConnected) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
        <div className="text-center p-8 glass-card rounded-2xl shadow-xl z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-purple-300 mb-8">
            You need to connect your wallet to chat with AIKO.
          </p>
          <button
            onClick={connectWallet}
            className="group relative px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all" />
            <div className="relative flex items-center gap-2 text-white font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span>Connect Wallet</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // PERBAIKAN: Tampilan loading AIKO
  if (aikoLoading) {
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
          <p className="text-purple-300">Fetching your companion data from blockchain</p>
        </div>
      </div>
    );
  }

  // PERBAIKAN: Tampilan initialize AIKO
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
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Hatch AIKO 🐣'}
          </button>
        </div>
      </div>
    );
  }

  // PERBAIKAN: Tambahkan safety check untuk aikoData
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
            ❓
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-purple-300 mb-6">Unable to load AIKO data. Please try refreshing.</p>
          <button
            onClick={loadAikoData}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN UTAMA (HANYA JIKA aikoData ADA) ---
  const currentStage = getEvolutionStage(aikoData.level);
  const currentXP = Number(aikoData.xp.toString());
  const currentLevel = aikoData.level;
  
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
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
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
                <div className="glass-card rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Birthday</div>
                  <span className="text-white font-mono text-sm">02/11/2025</span> 
                </div>
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
        <header className="glass-card border-b border-white/10 px-6 py-4">
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
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for AIKO */}
                    {message.sender === 'aiko' && (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getEvolutionGradient(currentStage)} flex items-center justify-center text-xl flex-shrink-0 animate-float shadow-lg`}>
                        {getEvolutionEmoji(currentStage)}
                      </div>
                    )}

                    {/* Message Bubble */}
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
            </AnimatePresence>

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

            <div ref={messagesEndRef} />
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all" />
                <div className="relative flex items-center gap-2 text-white font-semibold">
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
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
    </div>
  );
}