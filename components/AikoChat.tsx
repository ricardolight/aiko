'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { solanaService, AIKOData } from '@/lib/solana-mock';
import { getAikoResponse } from '@/lib/aiko-personality';
import { useChatHistory } from '@/app/hooks/useChatHistory'; // Import hook
import AikoAvatar from './AikoAvatar';
import StatsCard from './StatsCard';
import MessageBubble from './MessageBubble';

// Hapus interface Message yang duplicate, karena sudah ada di hook
// atau jika perlu reference, import juga:
// import { type Message } from '@/app/hooks/useChatHistory';

export default function AikoChat() {
  // Gunakan walletAddress sebagai suffix untuk storage key
  const [walletAddress] = useState(() => solanaService.getMockWallet());
  const [messages, addMessage] = useChatHistory(walletAddress); // Pass wallet address sebagai suffix
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aikoData, setAikoData] = useState<AIKOData | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAikoData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAikoData = async () => {
    try {
      const exists = await solanaService.exists(walletAddress);
      
      if (!exists) {
        const result = await solanaService.initialize(walletAddress);
        if (result.success && result.data) {
          setAikoData(result.data);
          addAikoMessage(
            "Hi there! I'm AIKO! 🌸 I just hatched and I'm so excited to meet you! Let's grow together through our conversations! Every time we chat, I'll get smarter and our bond will get stronger! 💕",
            'excited',
            '✨'
          );
        }
      } else {
        const data = await solanaService.getAIKO(walletAddress);
        if (data) {
          setAikoData(data);

          if (messages.length === 0) {
            const daysSince = Math.floor((Date.now() - data.birthday) / (1000 * 60 * 60 * 24));
            const welcomeBack = [
              `Welcome back! 💕 It's been ${daysSince} days since we first met! I missed you so much!`,
              `Yay! You're here! 🌸 We've been friends for ${daysSince} days now! Ready to chat?`,
            ];
            addAikoMessage(
              welcomeBack[Math.floor(Math.random() * welcomeBack.length)],
              'excited',
              '🎉'
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to load AIKO:', error);
    }
  };

  const addAikoMessage = (text: string, emotion?: string, emoji?: string) => {
    const newMessage = {
      id: `${Date.now()}-${Math.random()}_aiko`,
      text,
      sender: 'aiko' as const,
      timestamp: Date.now(),
      emotion,
      emoji
    };
    addMessage(newMessage);
  };

  const addUserMessage = (text: string) => {
    const newMessage = {
      id: `${Date.now()}-${Math.random()}_user`,
      text,
      sender: 'user' as const,
      timestamp: Date.now()
    };
    addMessage(newMessage);
  };

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !aikoData) return;

    const userMessageText = input.trim();
    setInput('');
    addUserMessage(userMessageText);
    setLoading(true);

    try {
      // Record interaction
      const result = await solanaService.interact(walletAddress);
      
      if (result.success && result.data) {
        setAikoData(result.data);

        // Show special notifications
        if (result.evolutionUp) {
          showNotification(result.message!);
        } else if (result.levelUp) {
          showNotification(result.message!);
        }
        
        // Prepare chat history for AI
        const historyForAI = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

        // Get AI response
        const response = await getAikoResponse(
          userMessageText,
          result.data,
          historyForAI
        );

        // Add AI response to chat
        addAikoMessage(response.text, response.emotion, response.emoji);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addAikoMessage("Oh no! Something went wrong... 😢 But don't worry, I'm still here with you!", 'sad', '💔');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-16 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-dark px-6 py-4 rounded-2xl shadow-2xl border border-purple-500/50"
          >
            <p className="text-white font-semibold text-center">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Stats */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: showStats ? 0 : -300 }}
        className="lg:w-80 w-full lg:h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10 p-6 overflow-y-auto"
      >
        {aikoData && (
          <div className="space-y-6">
            {/* AIKO Avatar & Info */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <AikoAvatar data={aikoData} size="large" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AIKO</h2>
              <p className="text-purple-300 text-sm capitalize">{aikoData.evolution_stage} Stage</p>
            </div>

            {/* Stats */}
            <StatsCard data={aikoData} />

            {/* Quick Info */}
            <div className="glass-dark rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Owner</span>
                <span className="text-white font-mono">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Birthday</span>
                <span className="text-white">{new Date(aikoData.birthday).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-900/30 rounded-2xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                💡 Tips
              </h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Chat daily to maintain your streak!</li>
                <li>• Reach Level 5 to evolve to Hatchling</li>
                <li>• Level 10 for Companion</li>
                <li>• Level 20 for Soulmate</li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass-dark border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {aikoData && (
                <>
                  <AikoAvatar data={aikoData} size="small" />
                  <div>
                    <h3 className="text-white font-bold">AIKO</h3>
                    <p className="text-xs text-purple-300">Level {aikoData.level} • Online</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:block text-sm text-gray-400">
                🔥 {aikoData?.streak || 0} day streak
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl rounded-bl-none shadow-lg">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                      className="w-2 h-2 bg-pink-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600">AIKO is thinking...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="glass-dark border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AIKO..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-400 text-center">
              Press Enter to send • {aikoData?.total_interactions || 0} total chats
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}