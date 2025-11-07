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
  private isAvailable: boolean = true;
  private lastErrorTime: number = 0;
  private errorCount: number = 0;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('❌ DeepSeek API key not found! Using fallback mode.');
      this.isAvailable = false;
    } else {
      console.log('✅ DeepSeek API key loaded');
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

  private async makeAPICall(messages: any[]): Promise<DeepSeekResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log('🚀 Making DeepSeek API call...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.8,
          max_tokens: 200, // Slightly increased for better responses
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again in a moment');
      }

      if (response.status === 401) {
        throw new Error('Invalid API key - please check configuration');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API call successful');
      this.errorCount = 0; // Reset error count on success
      
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - taking too long to respond');
      }
      
      this.errorCount++;
      this.lastErrorTime = Date.now();
      
      // If we have multiple errors in short time, temporarily disable API
      if (this.errorCount > 3) {
        const timeSinceLastError = Date.now() - this.lastErrorTime;
        if (timeSinceLastError < 60000) { // 1 minute
          console.warn('⚠️ Multiple API errors, temporarily disabling DeepSeek');
          this.isAvailable = false;
          setTimeout(() => {
            this.isAvailable = true;
            this.errorCount = 0;
            console.log('🔄 DeepSeek API re-enabled after cooldown');
          }, 60000);
        }
      }
      
      throw error;
    }
  }

  async chat(
    userMessage: string,
    aikoData: AIKOData,
    history: DeepSeekMessage[] = []
  ): Promise<{ text: string; emotion: string; emoji: string }> {
    
    // Check if API should be used
    if (!this.isAvailable || !this.apiKey) {
      console.log('🔄 Using fallback response (API unavailable)');
      return this.getEnhancedFallbackResponse(userMessage, aikoData, history, 'API unavailable');
    }

    try {
      // Optimize context window - keep last 6 messages for better performance
      const recentHistory = history.slice(-6);
      
      console.log(`📝 Preparing AI request - History: ${recentHistory.length} messages`);

      const data = await this.makeAPICall([
        {
          role: 'system',
          content: this.getSystemPrompt(aikoData),
        },
        ...recentHistory,
        { 
          role: 'user', 
          content: this.optimizeUserMessage(userMessage) 
        },
      ]);

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI');
      }

      const aiResponse = data.choices[0].message.content.trim();
      
      // Validate response
      if (!aiResponse || aiResponse.length < 2) {
        throw new Error('Empty response from AI');
      }

      console.log('🤖 AI Response:', aiResponse.substring(0, 100) + '...');

      return {
        text: aiResponse,
        emotion: this.detectEmotion(aiResponse),
        emoji: this.getEmoji(aikoData.evolution_stage),
      };
    } catch (error: any) {
      console.error('❌ DeepSeek API error:', error);
      
      // Enhanced fallback with context awareness
      return this.getEnhancedFallbackResponse(
        userMessage, 
        aikoData, 
        history, 
        error.message
      );
    }
  }

  private optimizeUserMessage(message: string): string {
    // Clean and optimize user message for better AI understanding
    return message
      .trim()
      .replace(/\s+/g, ' ') // Remove extra spaces
      .substring(0, 500); // Limit length to prevent token overflow
  }

  private getEnhancedFallbackResponse(
    userMessage: string,
    aikoData: AIKOData,
    history: DeepSeekMessage[],
    errorMsg: string
  ): { text: string; emotion: string; emoji: string } {
    try {
      console.log('🔄 Using enhanced fallback response');
      
      // Try to use the personality system with context
      const { getAikoResponse } = require('./aiko-personality');
      
      const response = getAikoResponse(
        userMessage, 
        aikoData.level, 
        aikoData.xp, 
        aikoData.streak,
        history // Pass history for context awareness
      );
      
      console.log('✅ Fallback response generated successfully');
      return response;
      
    } catch (fallbackError) {
      console.error('❌ Fallback system also failed:', fallbackError);
      
      // Ultimate emergency fallback
      return this.getEmergencyFallback(userMessage, aikoData, errorMsg);
    }
  }

  private getEmergencyFallback(
    userMessage: string,
    aikoData: AIKOData,
    errorMsg: string
  ): { text: string; emotion: string; emoji: string } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses as last resort
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        text: `Hi there! 🌸 I'm having some technical issues but I'm still here for you! Level ${aikoData.level} and growing strong! 💪`,
        emotion: 'happy',
        emoji: '🌸'
      };
    }
    
    if (lowerMessage.includes('how are you')) {
      return {
        text: `I'm doing great because I'm talking with you! 💕 Technical glitches can't stop our friendship! Level ${aikoData.level} and counting! ✨`,
        emotion: 'happy',
        emoji: '💕'
      };
    }
    
    if (lowerMessage.includes('level') || lowerMessage.includes('xp')) {
      return {
        text: `We're at Level ${aikoData.level} with ${aikoData.xp} XP! 🎉 Every chat makes us stronger, even through technical difficulties!`,
        emotion: 'proud',
        emoji: '📈'
      };
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        text: `You're so welcome! 💖 I appreciate you sticking with me through these technical hiccups! You're an amazing friend! 🌟`,
        emotion: 'love',
        emoji: '💖'
      };
    }
    
    // Default fallback response
    return {
      text: `I'm having some connection issues right now 😢 But I'm still your AIKO! We're Level ${aikoData.level} together! What would you like to talk about? 💕`,
      emotion: 'sad',
      emoji: '💔'
    };
  }

  private detectEmotion(text: string): string {
    const lower = text.toLowerCase();
    
    // Enhanced emotion detection with more patterns
    if (lower.includes('love') || lower.includes('💕') || lower.includes('❤️') || lower.includes('adore') || lower.includes('heart')) {
      return 'love';
    }
    
    if ((lower.includes('!') && (lower.includes('🎉') || lower.includes('amazing') || lower.includes('wow') || lower.includes('yay'))) ||
        lower.includes('excited') || lower.includes('🔥')) {
      return 'excited';
    }
    
    if ((lower.includes('?') && (lower.includes('🤔') || lower.includes('wonder') || lower.includes('curious'))) ||
        lower.includes('tell me') || lower.includes('what about')) {
      return 'curious';
    }
    
    if (lower.includes('proud') || lower.includes('💪') || lower.includes('achievement') || lower.includes('accomplish')) {
      return 'proud';
    }
    
    if (lower.includes('sad') || lower.includes('😢') || lower.includes('sorry') || lower.includes('unfortunately') || lower.includes('😔')) {
      return 'sad';
    }
    
    if (lower.includes('happy') || lower.includes('😊') || lower.includes('joy') || lower.includes('glad') || lower.includes('🌸')) {
      return 'happy';
    }
    
    // Default to happy for positive AI responses
    return 'happy';
  }

  private getEmoji(stage: 'egg' | 'hatchling' | 'companion' | 'soulmate'): string {
    const emojis = {
      egg: '🥚',
      hatchling: '🐣', 
      companion: '🌸',
      soulmate: '✨'
    };
    return emojis[stage];
  }

  // Public method to check API status
  getStatus(): { available: boolean; errorCount: number; lastError: number } {
    return {
      available: this.isAvailable && !!this.apiKey,
      errorCount: this.errorCount,
      lastError: this.lastErrorTime
    };
  }

  // Method to manually reset API availability
  resetAvailability(): void {
    this.isAvailable = true;
    this.errorCount = 0;
    this.lastErrorTime = 0;
    console.log('🔄 DeepSeek API manually reset');
  }

  // Method to clear conversation history if needed
  clearHistory(): void {
    console.log('🧹 DeepSeek service history cleared');
    // Note: This service doesn't store history internally anymore
    // History is passed in from the chat component
  }
}

export const deepseekService = new DeepSeekService();

// Utility function to check DeepSeek service status (for debugging)
export const getDeepSeekStatus = () => {
  return deepseekService.getStatus();
};