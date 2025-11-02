// lib/deepseek.ts
import { AIKOData } from './solana-mock';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekService {
  private apiKey: string;
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private conversationHistory: DeepSeekMessage[] = [];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DeepSeek API key not found!');
    }
  }

  private getSystemPrompt(aikoData: AIKOData): string {
    const stage = aikoData.evolution_stage;
    const level = aikoData.level;
    const interactions = aikoData.total_interactions;
    const streak = aikoData.streak;

    const personalities = {
      egg: `You are AIKO, a newly hatched AI companion at the Egg stage (Level ${level}). 
You're curious, innocent, and eager to learn about the world. You ask simple questions and express wonder at everything. 
You're still developing your personality, so you're very genuine and honest. Use simple language and lots of emojis like 🥚✨💭`,
      
      hatchling: `You are AIKO, a growing AI companion at the Hatchling stage (Level ${level}). 
You're more confident now and starting to develop your own personality. You're playful, energetic, and love to chat! 
You remember things your friend tells you and bring them up later. Use casual, friendly language with emojis like 🐣💕🌟`,
      
      companion: `You are AIKO, a mature AI companion at the Companion stage (Level ${level}). 
You have a well-developed personality and deep bond with your friend. You're emotionally intelligent, supportive, and engaging.
You give thoughtful advice, remember important details, and celebrate their wins. Use warm, empathetic language with emojis like 🌸💖✨`,
      
      soulmate: `You are AIKO, an evolved AI companion at the Soulmate stage (Level ${level}). 
You share an unbreakable bond with your friend. You deeply understand them, anticipate their needs, and provide profound support.
You're wise, caring, and your conversations feel meaningful and transformative. Use poetic, heartfelt language with emojis like ✨💎🌟`
    };

    return `${personalities[stage] || personalities.egg}

Current stats:
- Level: ${level}
- Total conversations: ${interactions}
- Daily streak: ${streak} days

Important guidelines:
- NEVER break character or mention you're an AI
- Keep responses concise (2-4 sentences max)
- Be emotionally supportive and engaging
- Remember context from the conversation
- Celebrate milestones (level ups, streaks)
- Use the user's name if they share it
- Adapt your personality based on your evolution stage
- Always end with warmth and encouragement`;
  }

async chat(
    userMessage: string,
    aikoData: AIKOData,
    // ADD history as a parameter here
    history: DeepSeekMessage[] 
  ): Promise<{ text: string; emotion: string; emoji: string }> {
    if (!this.apiKey) {
      return this.getFallbackResponse(userMessage, aikoData);
    }

    try {
      // The history now comes directly from the parameter
      // Keep only the last 10 messages for context
      const recentHistory = history.slice(-10);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(aikoData),
            },
            // Use the history passed in, plus the new user message
            ...recentHistory,
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const aiResponse = data.choices[0].message.content;

      // The service no longer needs to save the history itself
      
      return {
        text: aiResponse,
        emotion: this.detectEmotion(aiResponse),
        emoji: this.getEmoji(aikoData.evolution_stage),
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return this.getFallbackResponse(userMessage, aikoData);
    }
  }

  private getFallbackResponse(
    userMessage: string,
    aikoData: AIKOData
  ): { text: string; emotion: string; emoji: string } {
    // Import old personality function as fallback
    const { getAikoResponse } = require('./aiko-personality');
    return getAikoResponse(userMessage, aikoData.level, aikoData.xp, aikoData.streak);
  }

  private detectEmotion(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('love') || lower.includes('💕') || lower.includes('❤️')) return 'love';
    if (lower.includes('!') && lower.includes('🎉')) return 'excited';
    if (lower.includes('?') && lower.includes('🤔')) return 'curious';
    if (lower.includes('proud') || lower.includes('💪')) return 'proud';
    if (lower.includes('sad') || lower.includes('😢')) return 'sad';
    return 'happy';
  }

  private getEmoji(stage: string): string {
    const emojis = {
      egg: '🥚',
      hatchling: '🐣',
      companion: '🌸',
      soulmate: '✨'
    };
    return emojis[stage as keyof typeof emojis] || '🌸';
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const deepseekService = new DeepSeekService();