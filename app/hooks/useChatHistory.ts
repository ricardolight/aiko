import { useState, useEffect, useCallback } from 'react';

// Tipe untuk chat di UI
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aiko';
  timestamp: number;
  emotion?: string;
  emoji?: string;
}

// Tipe untuk histori AI
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useChatHistory(storageKeySuffix: string): [Message[], (newMessage: Message) => void] {
  const [messages, setMessages] = useState<Message[]>([]);
  // Pastikan storageKey unik per wallet
  const storageKey = `aiko-chat-history-${storageKeySuffix || 'guest'}`;

  // Muat chat dari localStorage saat pertama kali render
  useEffect(() => {
    if (!storageKeySuffix) return; // Jangan muat jika wallet belum ada
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Gagal memuat riwayat chat:", error);
    }
  }, [storageKey, storageKeySuffix]);

  // Fungsi untuk menambah pesan baru DAN menyimpannya
  const addMessage = useCallback((newMessage: Message) => {
    if (!storageKeySuffix) return; // Jangan simpan jika wallet belum ada
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      } catch (error) {
        console.error("Gagal menyimpan riwayat chat:", error);
      }
      return updatedMessages;
    });
  }, [storageKey, storageKeySuffix]);

  return [messages, addMessage];
}

