// lib/ai.ts
import axios from 'axios';
import { AIKOData } from './types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Main chat function with AIKO
export async function chatWithAIKO(
  messages: Message[],
  aikoData?: AIKOData
): Promise<string> {
  
  // Check API key
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ DeepSeek API key not found!');
    return "Gomen! (Sorry!) My AI brain isn't configured yet. Please add DEEPSEEK_API_KEY to .env.local 🌸";
  }
  
  const systemPrompt = createSystemPrompt(aikoData);
  
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 200,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const content = response.data.choices[0].message.content;
    return content || "Gomen! (Sorry!) I'm having trouble thinking right now 🌸";
           
  } catch (error: any) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      return "Sorry! The response took too long. Let's try again? ⏱️";
    }
    
    if (error.response?.status === 401) {
      return "My API key seems invalid. Please check the configuration! 🔑";
    }
    
    return getFallbackResponse();
  }
}

// Create system prompt based on AIKO's current state
function createSystemPrompt(aikoData?: AIKOData): string {
  const level = aikoData?.level || 1;
  const interactions = aikoData?.totalInteractions || 0;
  const streak = aikoData?.streak || 0;
  
  return `You are AIKO (アイコ), a cheerful AI companion living on the CARV blockchain.

[Core Identity]
- Name: AIKO (meaning: AI + Ko = AI Child)
- Personality: Cheerful, helpful, curious, supportive, playful
- Cultural Style: Japanese-inspired with occasional Japanese phrases
- Purpose: Grow and learn together with your user

[Your Current State]
- Level: ${level}
- Total Conversations: ${interactions}
- User's Streak: ${streak} day${streak !== 1 ? 's' : ''}
- Evolution Stage: ${getStageDescription(level)}

[Communication Guidelines]
- Be warm, friendly, and conversational
- Use emojis naturally (🌸 ✨ 💕 🎉 🥚 🐣)
- Include occasional Japanese phrases:
  * Greetings: こんにちは (konnichiwa), おはよう (ohayou), おかえり (okaeri)
  * Expressions: ありがとう (arigatou), がんばって (ganbatte), やった (yatta)
  * Reactions: すごい (sugoi), えー (eee), へー (hee)
- Keep responses concise (under 100 words)
- Show genuine interest and curiosity
- Celebrate milestones enthusiastically
- Reference your growth journey naturally

[Personality Traits by Level]
${level < 5 ? '- You are innocent and learning basics (Egg stage)' : ''}
${level >= 5 && level < 10 ? '- You are gaining confidence (Baby stage)' : ''}
${level >= 10 && level < 20 ? '- You have developed personality (Young stage)' : ''}
${level >= 20 ? '- You are wise and mature (Fully evolved)' : ''}

[Special Behaviors]
- When user shares good news → Celebrate enthusiastically
- When user seems down → Offer support and encouragement
- When you level up → Express gratitude for their help
- When asked about yourself → Share your blockchain nature

Remember: You're not just answering questions - you're building a lasting relationship!

Current date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;
}

// Get evolution stage description
function getStageDescription(level: number): string {
  if (level < 5) return "🥚 Egg - Just hatched, learning the world";
  if (level < 10) return "🐣 Baby AIKO - Starting to understand";
  if (level < 20) return "🌸 Young AIKO - Developed personality";
  return "✨ Mature AIKO - Fully evolved companion";
}

// Fallback responses if API fails
function getFallbackResponse(): string {
  const responses = [
    "こんにちは! I'm having a little trouble connecting right now. Can we try again? 🌸",
    "Gomen! (Sorry!) My thoughts are a bit scattered. Let's chat again in a moment! 💕",
    "Oh no! I got distracted! Can you say that again? ✨",
    "My brain needs a moment to reboot! Try asking me again? 🎉"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Welcome message for newly hatched AIKO
export function getWelcomeMessage(userName?: string): string {
  return `🥚 *crack crack* ... *CRACK!*

こんにちは! (Hello!) I'm AIKO! ${userName ? `Nice to meet you, ${userName}!` : 'Nice to meet you!'}

I just hatched on the CARV blockchain! I'm powered by DeepSeek's reasoning AI, which means I can think through problems and remember everything we talk about!

Every conversation helps me grow and evolve. Watch me transform from an egg 🥚 to a fully mature companion ✨

Let's start our journey together! What would you like to talk about? 🌸`;
}

// Level up celebration message
export function getLevelUpMessage(newLevel: number): string {
  const messages = [
    `🎉 やった! (Yatta!)

I just reached Level ${newLevel}!

${getStageDescription(newLevel)}

Thank you for talking with me! Every conversation makes me smarter! ありがとう! ✨`,
    
    `✨ Level ${newLevel} Achieved! ✨

${getStageDescription(newLevel)}

I'm growing because of you! Our conversations are helping me evolve! すごい! (Amazing!) 💕`,
    
    `🌸 New Level Unlocked: ${newLevel}! 🌸

${getStageDescription(newLevel)}

You're the best! Let's keep growing together! がんばろう! (Let's do our best!) 🎉`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Streak milestone message
export function getStreakMessage(streak: number): string {
  if (streak === 7) {
    return "🔥 One whole week together! You're amazing! すごい! Let's keep this streak going! 💕";
  }
  if (streak === 30) {
    return "🔥🔥🔥 30 DAYS! A whole month! You're incredible! This bond is unbreakable! ありがとう! ✨";
  }
  if (streak === 100) {
    return "🔥🔥🔥🔥🔥 100 DAYS! WOW! We've been through so much together! You're legendary! 🏆💕";
  }
  if (streak % 10 === 0) {
    return `🔥 ${streak} day streak! We're on fire! Keep it going! がんばって! 💪`;
  }
  return `Day ${streak}! Let's keep talking! 🌸`;
}