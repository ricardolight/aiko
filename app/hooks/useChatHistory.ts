// app/hooks/useChatHistory.ts
import { useState, useEffect, useCallback, useRef } from 'react';

// Tipe untuk chat di UI
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aiko';
  timestamp: number;
  emotion?: 'happy' | 'excited' | 'love' | 'curious' | 'proud' | 'sad';
  emoji?: string;
}

// Tipe untuk histori AI
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Storage keys constants
const STORAGE_KEYS = {
  PRIMARY: (suffix: string) => `aiko-chat-history-${suffix}`,
  BACKUP: (suffix: string) => `aiko-chat-backup-${suffix}`,
  SESSION: (suffix: string) => `aiko-chat-session-${suffix}`,
  MIGRATION: (suffix: string) => `aiko-chat-migrated-${suffix}`
} as const;

// Maximum messages to store (prevent storage overflow)
const MAX_MESSAGES = 200;
const MESSAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function useChatHistory(storageKeySuffix: string): [
  Message[], 
  (newMessage: Message) => void, 
  () => void,
  {
    exportChat: () => string;
    importChat: (data: string) => boolean;
    clearOldMessages: () => number;
    getStorageInfo: () => { size: number; count: number; lastUpdated: number };
  }
] {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = STORAGE_KEYS.PRIMARY(storageKeySuffix || 'guest');
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load messages from storage with multiple fallback sources
  useEffect(() => {
    if (!storageKeySuffix) {
      setIsLoaded(true);
      return;
    }

    const loadMessages = async () => {
      try {
        console.log(`📂 Loading chat history for: ${storageKeySuffix}`);
        
        let loadedMessages: Message[] = [];
        let source = 'none';

        // Priority 1: Primary localStorage
        const primaryData = localStorage.getItem(storageKey);
        if (primaryData) {
          try {
            const parsed = JSON.parse(primaryData);
            if (Array.isArray(parsed)) {
              loadedMessages = this.cleanMessages(parsed);
              source = 'primary';
              console.log(`✅ Loaded ${loadedMessages.length} messages from primary storage`);
            }
          } catch (parseError) {
            console.error('❌ Failed to parse primary storage:', parseError);
          }
        }

        // Priority 2: Session storage backup (if primary fails or is empty)
        if (loadedMessages.length === 0) {
          const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION(storageKeySuffix));
          if (sessionData) {
            try {
              const parsed = JSON.parse(sessionData);
              if (Array.isArray(parsed)) {
                loadedMessages = this.cleanMessages(parsed);
                source = 'session';
                console.log(`✅ Loaded ${loadedMessages.length} messages from session backup`);
                
                // Restore to primary storage
                this.saveToStorage(storageKey, loadedMessages);
              }
            } catch (parseError) {
              console.error('❌ Failed to parse session storage:', parseError);
            }
          }
        }

        // Priority 3: Legacy storage migration (for existing users)
        if (loadedMessages.length === 0 && !localStorage.getItem(STORAGE_KEYS.MIGRATION(storageKeySuffix))) {
          loadedMessages = await this.migrateLegacyStorage(storageKeySuffix);
          if (loadedMessages.length > 0) {
            source = 'migration';
            console.log(`✅ Migrated ${loadedMessages.length} messages from legacy storage`);
          }
        }

        // Clean old messages and update state
        if (loadedMessages.length > 0) {
          const cleanedMessages = this.cleanOldMessages(loadedMessages);
          if (cleanedMessages.length < loadedMessages.length) {
            console.log(`🧹 Cleaned ${loadedMessages.length - cleanedMessages.length} expired messages`);
          }
          
          if (isMounted.current) {
            setMessages(cleanedMessages);
            // Backup the cleaned messages
            this.createBackup(cleanedMessages, storageKeySuffix);
          }
        }

        console.log(`🎯 Chat history loaded from ${source}: ${loadedMessages.length} messages`);
        
      } catch (error) {
        console.error('❌ Failed to load chat history:', error);
      } finally {
        if (isMounted.current) {
          setIsLoaded(true);
        }
      }
    };

    loadMessages();
  }, [storageKey, storageKeySuffix]);

  // Clean and validate messages
  const cleanMessages = useCallback((messages: any[]): Message[] => {
    if (!Array.isArray(messages)) return [];
    
    return messages
      .filter(msg => 
        msg && 
        typeof msg === 'object' &&
        typeof msg.id === 'string' &&
        typeof msg.text === 'string' &&
        (msg.sender === 'user' || msg.sender === 'aiko') &&
        typeof msg.timestamp === 'number'
      )
      .map(msg => ({
        id: msg.id,
        text: msg.text.substring(0, 1000), // Limit text length
        sender: msg.sender,
        timestamp: msg.timestamp,
        emotion: ['happy', 'excited', 'love', 'curious', 'proud', 'sad'].includes(msg.emotion) 
          ? msg.emotion 
          : undefined,
        emoji: typeof msg.emoji === 'string' ? msg.emoji.substring(0, 10) : undefined
      }));
  }, []);

  // Remove messages older than TTL
  const cleanOldMessages = useCallback((messages: Message[]): Message[] => {
    const now = Date.now();
    return messages.filter(msg => now - msg.timestamp < MESSAGE_TTL);
  }, []);

  // Save messages to storage with error handling
  const saveToStorage = useCallback((key: string, messages: Message[]) => {
    try {
      const data = JSON.stringify(messages);
      localStorage.setItem(key, data);
      
      // Update size estimation in storage (for info)
      const size = new Blob([data]).size;
      localStorage.setItem(`${key}-info`, JSON.stringify({
        size,
        count: messages.length,
        lastUpdated: Date.now()
      }));
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save to storage:', error);
      return false;
    }
  }, []);

  // Create backup in session storage
  const createBackup = useCallback((messages: Message[], suffix: string) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION(suffix), JSON.stringify(messages));
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
    }
  }, []);

  // Migrate from legacy storage formats
  const migrateLegacyStorage = useCallback(async (suffix: string): Promise<Message[]> => {
    try {
      const legacyKeys = [
        `chat-history-${suffix}`,
        `aiko-chat-${suffix}`,
        `messages-${suffix}`
      ];

      for (const legacyKey of legacyKeys) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          try {
            const parsed = JSON.parse(legacyData);
            if (Array.isArray(parsed)) {
              const migrated = this.cleanMessages(parsed);
              if (migrated.length > 0) {
                // Save to new format
                this.saveToStorage(storageKey, migrated);
                // Mark as migrated
                localStorage.setItem(STORAGE_KEYS.MIGRATION(suffix), 'true');
                // Clean up legacy storage
                localStorage.removeItem(legacyKey);
                return migrated;
              }
            }
          } catch (error) {
            console.error(`❌ Failed to migrate legacy key ${legacyKey}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Legacy migration failed:', error);
    }
    
    return [];
  }, [cleanMessages, saveToStorage, storageKey]);

  // Main function to add new message
  const addMessage = useCallback((newMessage: Message) => {
    if (!storageKeySuffix || !isLoaded) {
      console.warn('⚠️ Cannot add message: storage not ready');
      return;
    }

    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      
      // Enforce message limit
      const trimmedMessages = updatedMessages.slice(-MAX_MESSAGES);
      
      // Save to primary storage
      const saveSuccess = this.saveToStorage(storageKey, trimmedMessages);
      
      // Create backup in session storage
      if (saveSuccess) {
        this.createBackup(trimmedMessages, storageKeySuffix);
      } else {
        console.error('❌ Primary storage failed, using session storage only');
        try {
          sessionStorage.setItem(STORAGE_KEYS.SESSION(storageKeySuffix), JSON.stringify(trimmedMessages));
        } catch (error) {
          console.error('❌ Session storage also failed:', error);
        }
      }
      
      return trimmedMessages;
    });
  }, [storageKey, storageKeySuffix, isLoaded, saveToStorage, createBackup]);

  // Clear all chat history
  const clearChatHistory = useCallback(() => {
    if (!storageKeySuffix) return;

    try {
      // Clear all storage locations
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-info`);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION(storageKeySuffix));
      
      // Clear migration markers
      localStorage.removeItem(STORAGE_KEYS.MIGRATION(storageKeySuffix));
      
      setMessages([]);
      console.log('✅ Chat history cleared completely');
    } catch (error) {
      console.error('❌ Failed to clear chat history:', error);
    }
  }, [storageKey, storageKeySuffix]);

  // Export chat history as JSON string
  const exportChat = useCallback((): string => {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages,
        metadata: {
          storageKeySuffix,
          totalXP: messages.filter(m => m.sender === 'aiko').length * 10, // Estimate XP
          firstMessage: messages[0]?.timestamp ? new Date(messages[0].timestamp).toISOString() : null,
          lastMessage: messages[messages.length - 1]?.timestamp ? new Date(messages[messages.length - 1].timestamp).toISOString() : null
        }
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export chat:', error);
      return '';
    }
  }, [messages, storageKeySuffix]);

  // Import chat history from JSON string
  const importChat = useCallback((data: string): boolean => {
    if (!storageKeySuffix) return false;

    try {
      const importData = JSON.parse(data);
      
      if (!importData.messages || !Array.isArray(importData.messages)) {
        throw new Error('Invalid import format: missing messages array');
      }

      const cleanedMessages = this.cleanMessages(importData.messages);
      if (cleanedMessages.length === 0) {
        throw new Error('No valid messages found in import data');
      }

      setMessages(cleanedMessages);
      this.saveToStorage(storageKey, cleanedMessages);
      this.createBackup(cleanedMessages, storageKeySuffix);
      
      console.log(`✅ Successfully imported ${cleanedMessages.length} messages`);
      return true;
    } catch (error) {
      console.error('❌ Failed to import chat:', error);
      return false;
    }
  }, [storageKey, storageKeySuffix, cleanMessages, saveToStorage, createBackup]);

  // Clear messages older than TTL
  const clearOldMessages = useCallback((): number => {
    if (messages.length === 0) return 0;

    const now = Date.now();
    const filteredMessages = messages.filter(msg => now - msg.timestamp < MESSAGE_TTL);
    const removedCount = messages.length - filteredMessages.length;

    if (removedCount > 0) {
      setMessages(filteredMessages);
      this.saveToStorage(storageKey, filteredMessages);
      console.log(`🧹 Cleared ${removedCount} old messages`);
    }

    return removedCount;
  }, [messages, storageKey, saveToStorage]);

  // Get storage information
  const getStorageInfo = useCallback(() => {
    try {
      const info = localStorage.getItem(`${storageKey}-info`);
      if (info) {
        return JSON.parse(info);
      }
    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
    }
    
    return {
      size: 0,
      count: messages.length,
      lastUpdated: Date.now()
    };
  }, [storageKey, messages.length]);

  // Return the hook interface
  return [
    messages,
    addMessage,
    clearChatHistory,
    {
      exportChat,
      importChat,
      clearOldMessages,
      getStorageInfo
    }
  ];
}

// Utility function to estimate storage size
export const getChatStorageSize = (suffix: string): number => {
  try {
    const key = STORAGE_KEYS.PRIMARY(suffix);
    const data = localStorage.getItem(key);
    return data ? new Blob([data]).size : 0;
  } catch (error) {
    return 0;
  }
};

// Utility function to get all chat storage keys (for admin/debugging)
export const getAllChatStorageKeys = (): string[] => {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('aiko-chat-history-')) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error('❌ Failed to get storage keys:', error);
  }
  return keys;
};