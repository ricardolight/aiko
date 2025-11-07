'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { solanaService, AikoAccount } from '@/lib/svm-service'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { deepseekService } from '@/lib/deepseek';
import { useChatHistory, Message, DeepSeekMessage } from '@/app/hooks/useChatHistory';
import { useWallet } from '@/app/context/WalletProvider';

import WelcomeOnboarding from '@/components/WelcomeOnboarding';
import MemorySettings from '@/components/MemorySettings';

// Memory Service (tetap sama)
class MemoryService {
  static extractName(message: string): string {
    const patterns = [
      /namaku\s+(\w+)/i,
      /nama\s+saya\s+(\w+)/i, 
      /my name is\s+(\w+)/i,
      /panggil\s+(\w+)/i,
      /call me\s+(\w+)/i,
      /aku\s+(\w+)/i,
      /saya\s+(\w+)/i,
      /i'm\s+(\w+)/i,
      /i am\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  static extractCountry(message: string): string {
    const patterns = [
      /\b(from|dari|asli|origin)\s+(\w+)/i,
      /\b(live in|tinggal di|stay in)\s+(\w+)/i,
      /\b(born in|lahir di)\s+(\w+)/i,
      /\b(\w+)\s+(citizen|warga|penduduk)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const country = match[2] || match[1];
        if (country && country.length > 2) {
          return country.toLowerCase();
        }
      }
    }
    
    const commonCountries = [
      'indonesia', 'malaysia', 'singapore', 'vietnam', 'thailand',
      'japan', 'korea', 'china', 'taiwan', 'india',
      'usa', 'america', 'canada', 'uk', 'england', 'germany', 'france', 'spain', 'italy',
      'australia', 'new zealand', 'brazil', 'mexico', 'russia'
    ];
    
    const lowerMessage = message.toLowerCase();
    for (const country of commonCountries) {
      if (lowerMessage.includes(country)) {
        return country;
      }
    }
    
    return '';
  }

  static shouldUpdateMemory(userMessage: string, aikoData: AikoAccount): boolean {
    const knowsName = (aikoData.memoryFlags & 1) !== 0;
    const knowsCountry = (aikoData.memoryFlags & 2) !== 0;
    
    const nameFound = !knowsName && this.extractName(userMessage).length > 0;
    const countryFound = !knowsCountry && this.extractCountry(userMessage).length > 0;
    
    return nameFound || countryFound;
  }

  static calculateMemoryFlags(userMessage: string, currentFlags: number): number {
    let flags = currentFlags;
    
    const name = this.extractName(userMessage);
    const country = this.extractCountry(userMessage);
    
    if (name.length > 0) {
      flags |= 1;
    }
    
    if (country.length > 0) {
      flags |= 2;  
    }
    
    return flags;
  }
}

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
  const [isSigning, setIsSigning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false); 
  const [errorType, setErrorType] = useState<'balance' | 'generic' | null>(null);
 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // ✅ FIX: Scroll system yang stabil
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior,
          block: 'end'
        });
      }
    });
  }, []);

  // ✅ FIX: Scroll effect yang tidak trigger re-render
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const shouldScroll = Date.now() - lastMessage.timestamp < 1000;
      
      if (shouldScroll) {
        scrollToBottom('smooth');
      }
    }
  }, [messages, scrollToBottom]);

  // Load AIKO data
  useEffect(() => {
    if (isConnected && publicKey && provider) {
      loadAikoData();
    } else {
      setAikoData(null);
      setIsInitializing(false);
      setHasCheckedOnboarding(false);
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
    if (aikoData && hasCheckedOnboarding) {
      const needsOnboarding = !aikoData.userName || !aikoData.userCountry;
      
      if (needsOnboarding && !showOnboarding) {
        console.log("🔄 Triggering onboarding from effect...");
        // Delay sedikit untuk mencegah race condition
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [aikoData, hasCheckedOnboarding, showOnboarding]);

  const loadAikoData = async () => {
    if (!publicKey || !provider) return;

    setAikoLoading(true);
    setErrorType(null); // Reset error
    try {
      console.log("Loading AIKO data for:", publicKey.toBase58());
      
      const data = await solanaService.getAIKO(wallet);
      
      if (data) {
        setAikoData(data);
        
        // ✅ FIX: Cek apakah perlu onboarding SETELAH data loaded
        const needsOnboarding = !data.userName || !data.userCountry;
        console.log("🧠 Memory check:", { 
          userName: data.userName, 
          userCountry: data.userCountry,
          needsOnboarding 
        });
        
        if (needsOnboarding) {
          console.log("🎯 Showing onboarding...");
          // Tunggu sebentar agar UI stabil dulu
          setTimeout(() => {
            setShowOnboarding(true);
          }, 500);
        }
        
        // Tambahkan welcome message hanya jika bukan baru initialize
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
        console.log("No AIKO account found, user needs to initialize");
        setIsInitializing(true);
      }
    } catch (error: any) {
      console.error('Gagal memuat AIKO:', error);
      
      // ✅ SET ERROR TYPE UNTUK UI
      if (error.message?.includes('Insufficient balance')) {
        setErrorType('balance');
        addAikoMessage(
          `Oh no! 😢 ${error.message}. I need SOL for gas fees. Please bridge some SOL from Ethereum Sepolia to Carv Testnet using the bridge!`,
          'sad',
          '💸'
        );
        showNotification('💰 Low balance! Please bridge SOL from Sepolia');
        return;
      } else {
        setErrorType('generic');
      }
      
      if (error.message?.includes('Account does not exist')) {
        setIsInitializing(true);
      } else {
        // Generic error
        addAikoMessage(
          "Hmm, something went wrong while loading my data... 😅 Please try refreshing the page!",
          'sad',
          '🔄'
        );
      }
    } finally {
      setAikoLoading(false);
      setHasCheckedOnboarding(true);
    }
  };

  const handleInitialize = async () => {
    if (!publicKey || !provider) return;

    setIsInitializing(true);
    setLoading(true);
    setErrorType(null); // ✅ RESET ERROR
    
    try {
      console.log("Initializing AIKO account...");
      await solanaService.initialize(wallet);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newData = await solanaService.getAIKO(wallet);
      if (newData) {
        setAikoData(newData);
        
        console.log("✅ Aiko created, showing onboarding...");
        setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Gagal initialize AIKO:", error);
      
      // ✅ HANDLE BALANCE ERROR DI INITIALIZE JUGA
      if (error.message?.includes('Insufficient balance')) {
        setErrorType('balance');
        addAikoMessage(
          `Oh no! 😢 ${error.message}. I need SOL for gas fees to create my account. Please bridge some SOL from Ethereum Sepolia first!`,
          'sad',
          '💸'
        );
        showNotification('💰 Low balance! Please bridge SOL from Sepolia');
        return;
      }
      
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

  const handleOnboardingComplete = async (name: string, country: string) => {
    if (!publicKey || !provider) {
      console.error('Wallet not connected');
      return;
    }

    try {
      console.log('🧠 Saving memory to blockchain...', { name, country });
      setLoading(true);
      
      // Save to blockchain
      const flags = 0x03; // Binary: 00000011 (knows name + country)
      await solanaService.updateMemory(wallet, name, country, flags);
      
      console.log('✅ Memory saved! Waiting for confirmation...');
      
      // Wait for blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reload AIKO data
      const updated = await solanaService.getAIKO(wallet);
      if (updated) {
        setAikoData(updated);
        setShowOnboarding(false);
        
        // Add celebratory message
        addAikoMessage(
          `Yay! Nice to meet you, ${name}! 🎉 I'll remember you forever on the blockchain! 💕`,
          'excited',
          '🌸'
        );
        
        showNotification('✅ Memory saved to blockchain!');
      }
      
      console.log('✅ Onboarding completed!');
    } catch (error: any) {
      console.error('❌ Failed to save memory:', error);
      addAikoMessage(
        'Oh no! I had trouble saving your info... 😢 Can you try again?',
        'sad',
        '💔'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    console.log('⏭️ Onboarding skipped');
    setShowOnboarding(false);
    
    addAikoMessage(
      "That's okay! You can tell me your name and where you're from anytime! 🌸",
      'happy',
      '😊'
    );
  };

  // Handle settings update
  const handleSettingsUpdate = async () => {
    if (!publicKey || !provider) return;
    
    try {
      console.log('🔄 Refreshing AIKO data after memory update...');
      
      // Wait a bit for blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload AIKO data
      const updated = await solanaService.getAIKO(wallet);
      if (updated) {
        setAikoData(updated);
        showNotification('✅ Memory updated on blockchain!');
        
        addAikoMessage(
          `Got it! I'll remember that! 🌸 Your info is safely stored on-chain! 💕`,
          'happy',
          '✨'
        );
      }
      
      console.log('✅ Memory refreshed!');
    } catch (error) {
      console.error('❌ Failed to reload data:', error);
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
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ FIX: handleSend yang lebih seamless - TANPA RE-RENDER
  const handleSend = async () => {
    if (!input.trim() || loading || isSigning || !aikoData || !publicKey || !provider) return;

    const userMessage = input.trim();
    setInput('');
    
    // ✅ TAMBAHKAN USER MESSAGE (langsung muncul di UI)
    addUserMessage(userMessage);
    setLoading(true);
    setIsSigning(true);

    try {
      console.log("🚀 Starting seamless chat process...");
      
      // ✅ JANGAN update aikoData state di sini (biarkan tetap)
      const previousAikoData = { ...aikoData };
      
      // ✅ PARALLEL PROCESS: AI Response + Blockchain
      const [response, txSignature] = await Promise.all([
        // AI Response
        deepseekService.chat(
          userMessage, 
          {
            owner: previousAikoData.owner.toBase58(),
            level: previousAikoData.level,
            xp: Number(previousAikoData.xp.toString()),
            total_interactions: Number(previousAikoData.totalInteractions.toString()) + 1,
            last_interaction: Math.floor(Date.now() / 1000),
            streak: Number(previousAikoData.streak.toString()),
            evolution_stage: getEvolutionStage(previousAikoData.level),
            // ✅ ADD THESE THREE LINES:
            userName: previousAikoData.userName || '',
            userCountry: previousAikoData.userCountry || '',
            memoryFlags: previousAikoData.memoryFlags || 0
          },
          messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ),
        
        // Blockchain Transaction (wallet sign akan muncul di sini)
        solanaService.interact(wallet)
      ]);
      
      console.log("Transaksi terkirim:", txSignature);

      // ✅ TAMBAHKAN AIKO RESPONSE (langsung muncul di UI)
      addAikoMessage(
        response.text, 
        response.emotion as any,
        response.emoji
      );

      // ✅ BACKGROUND UPDATE: Update data tanpa re-render chat
      setTimeout(async () => {
        try {
          const updatedAiko = await solanaService.getAIKO(wallet);
          if (updatedAiko) {
            // Cek level up (hanya show notification, tidak reset state)
            if (previousAikoData.level < updatedAiko.level) {
              showNotification(`🎉 Level Up! Kamu sekarang Level ${updatedAiko.level}!`);
            }

            // Memory System Update
            if (MemoryService.shouldUpdateMemory(userMessage, updatedAiko)) {
              const newName = MemoryService.extractName(userMessage) || updatedAiko.userName;
              const newCountry = MemoryService.extractCountry(userMessage) || updatedAiko.userCountry;
              const newFlags = MemoryService.calculateMemoryFlags(userMessage, updatedAiko.memoryFlags);
              
              try {
                await solanaService.updateMemory(wallet, newName, newCountry, newFlags);
                console.log("🧠 Memory updated!");
              } catch (memoryError) {
                console.log("Memory update skipped:", memoryError);
              }
            }
            
            // ✅ UPDATE AIKO DATA TANPA RE-RENDER CHAT
            setAikoData(updatedAiko);
          }
        } catch (error) {
          console.error("Background update failed:", error);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      addAikoMessage(
        "Oh no! Something went wrong... 😢 Please check your connection and try again.",
        'sad',
        '💔'
      );
    } finally {
      setLoading(false);
      setIsSigning(false);
      
      // ✅ FOCUS INPUT SETELAH SEMUA SELESAI (tanpa reset scroll)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Helper functions
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
          <p className="text-purple-300">Fetching your companion data from blockchain</p>
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
          
          {/* ✅ TAMBAHKAN ERROR MESSAGE JIKA ADA ERROR */}
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
          
          {/* ✅ TAMBAHKAN BRIDGE BUTTON JIKA BALANCE ERROR */}
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
              ? "Your wallet doesn't have enough SOL for gas fees. You need at least 0.001 SOL to interact with AIKO. Please bridge some SOL from Ethereum Sepolia to Carv SVM Testnet!"
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
                <span>Bridge SOL from Sepolia</span>
                <span>🌉</span>
              </button>
            )}
          </div>
          
          {errorType === 'balance' && (
            <div className="mt-4 text-gray-400 text-sm max-w-md">
              <p>💡 <strong>How to get SOL:</strong></p>
              <ol className="text-left mt-2 space-y-1">
                <li>1. Get ETH from <a href="https://sepoliafaucet.com" target="_blank" className="text-blue-400 hover:underline">Sepolia Faucet</a></li>
                <li>2. Go to <a href="https://bridge.testnet.carv.io/home" target="_blank" className="text-blue-400 hover:underline">Carv Bridge</a></li>
                <li>3. Bridge ETH from Sepolia to SOL on Carv Testnet</li>
                <li>4. Come back and retry!</li>
              </ol>
            </div>
          )}
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

              {/* Info Cards dengan Memory Data */}
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
              
              {/* ✅ ADD SETTINGS BUTTON */}
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
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id} // ✅ STABLE KEYS - TIDAK BERUBAH
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
                disabled={loading || isSigning}
                className="flex-1 px-6 py-4 glass rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading || isSigning || !input.trim()}
                className="group relative px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl transition-all ${
                  isSigning ? 'animate-pulse' : 'group-hover:shadow-2xl group-hover:shadow-purple-500/50'
                }`} />
                <div className="relative flex items-center gap-2 text-white font-semibold">
                  {isSigning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5"
                      >
                        ⏳
                      </motion.div>
                      <span className="hidden sm:inline">Signing...</span>
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
      {showOnboarding && (
        <WelcomeOnboarding
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
      {/* Settings Modal */}
      {showSettings && aikoData && (
        <MemorySettings
          currentName={aikoData.userName || ''}
          currentCountry={aikoData.userCountry || ''}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}  
    </div>
  );
}