'use client';

import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aiko';
  timestamp: number;
  emotion?: 'happy' | 'excited' | 'love' | 'curious' | 'proud' | 'sad';
  emoji?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAiko = message.sender === 'aiko';

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring' as const, // ← Tambahkan 'as const'
        stiffness: 300,
        damping: 20
      }
    }
  };

  const emotionColors = {
    happy: 'from-yellow-100 to-yellow-50',
    excited: 'from-pink-100 to-pink-50',
    love: 'from-red-100 to-pink-50',
    curious: 'from-blue-100 to-blue-50',
    proud: 'from-purple-100 to-purple-50',
    sad: 'from-gray-100 to-gray-50'
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isAiko ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex items-end gap-2 max-w-[80%] ${isAiko ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar for AIKO */}
        {isAiko && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm mb-1 flex-shrink-0">
            🌸
          </div>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl ${
              isAiko
                ? `bg-gradient-to-br ${message.emotion ? emotionColors[message.emotion] : 'from-white to-gray-50'} text-gray-800 shadow-lg border border-purple-100`
                : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl'
            } ${isAiko ? 'rounded-bl-none' : 'rounded-br-none'}`}
          >
            {/* Emoji badge for AIKO */}
            {isAiko && message.emoji && (
              <div className="inline-block bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs mb-2">
                {message.emoji}
              </div>
            )}
            
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {message.text}
            </p>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-400 mt-1 px-2 ${isAiko ? 'text-left' : 'text-right'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}