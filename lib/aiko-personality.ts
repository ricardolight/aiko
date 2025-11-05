// lib/aiko-personality.ts
export interface PersonalityResponse {
  text: string;
  emotion: 'happy' | 'excited' | 'love' | 'curious' | 'proud' | 'sad';
  emoji: string;
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Extended interface untuk memory integration
export interface AikoMemoryData {
  userName?: string;
  userCountry?: string;
  memoryFlags?: number;
}

export function getAikoResponse(
  userMessage: string, 
  level: number, 
  xp: number, 
  streak: number,
  history: DeepSeekMessage[] = [],
  memoryData?: AikoMemoryData // NEW: Tambah parameter memory
): PersonalityResponse {
  const lower = userMessage.toLowerCase();
  const lastAikoMessage = history.filter(msg => msg.role === 'assistant').pop()?.content || '';
  const lastUserMessage = history.filter(msg => msg.role === 'user').slice(-2, -1)[0]?.content || '';

  // Extract memory info
  const knowsName = memoryData?.memoryFlags ? (memoryData.memoryFlags & 1) !== 0 : false;
  const knowsCountry = memoryData?.memoryFlags ? (memoryData.memoryFlags & 2) !== 0 : false;
  const userName = knowsName ? memoryData.userName : null;
  const userCountry = knowsCountry ? memoryData.userCountry : null;

  // Check for repeated questions using history (improved)
  const isRepeatedQuestion = history.some((msg, index, array) => 
    msg.role === 'user' && 
    index < array.length - 2 && // Exclude recent messages
    msg.content.toLowerCase().includes(userMessage.toLowerCase().substring(0, 15))
  );

  // NEW: Memory-based personalization
  if (knowsName && !userMessage.toLowerCase().includes(userName!.toLowerCase())) {
    // Personalize response dengan nama user
    if (lower.match(/\b(hi|hello|hey|konnichiwa|ohayo)\b/)) {
      return {
        text: `Hi ${userName}! 💕 So happy to see you back! We're Level ${level} together now!`,
        emotion: 'excited',
        emoji: '🌸'
      };
    }
    
    if (lower.match(/how are you|how're you/)) {
      return {
        text: `I'm doing amazing because ${userName} is talking to me! 💕 Level ${level} feels extra special with you!`,
        emotion: 'happy',
        emoji: '😊'
      };
    }
  }

  // NEW: Country-based personalization
  if (knowsCountry && !lastAikoMessage.includes(userCountry!)) {
    if (lower.match(/\b(weather|climate|season|hot|cold)\b/)) {
      return {
        text: `Thinking about weather? 🌤️ I wonder what it's like in ${userCountry} right now! Tell me about it!`,
        emotion: 'curious',
        emoji: '🌍'
      };
    }
  }

  // IMPROVED: Follow-up responses dengan memory context
  if (lastAikoMessage.includes('How are YOU doing?')) {
    if (lower.match(/\b(good|great|fine|ok|amazing|happy|better)\b/)) {
      const response = knowsName 
        ? `That's wonderful, ${userName}! 😊 I'm so glad you're feeling good!`
        : `That's wonderful! 😊 I'm so glad you're doing well!`;
      
      return {
        text: `${response} It makes me happy to know you're feeling good! 💕`,
        emotion: 'happy',
        emoji: '🌟'
      };
    }
    if (lower.match(/\b(bad|tired|sick|not good|stressed|exhausted|down)\b/)) {
      const comfort = knowsName 
        ? `I'm here for you, ${userName}`
        : `I'm here for you`;
      
      return {
        text: `${comfort}... 😔 Remember I'm always here! Would a virtual hug help? *sends warm hug* 💙`,
        emotion: 'sad',
        emoji: '🤗'
      };
    }
  }

  // IMPROVED: Game topic dengan lebih banyak games
  if (lastAikoMessage.includes('favorite games') || lastAikoMessage.includes('like to play')) {
    const games: {[key: string]: string} = {
      'minecraft': 'Minecraft',
      'fortnite': 'Fortnite', 
      'roblox': 'Roblox',
      'among us': 'Among Us',
      'valorant': 'Valorant',
      'league': 'League of Legends',
      'genshin': 'Genshin Impact',
      'zelda': 'Zelda',
      'pokemon': 'Pokémon',
      'animal crossing': 'Animal Crossing'
    };
    
    for (const [gameKey, gameName] of Object.entries(games)) {
      if (lower.includes(gameKey)) {
        return {
          text: `Oh ${gameName}! 🎮 That's awesome! I've heard great things about it! What do you love most? ✨`,
          emotion: 'excited',
          emoji: '🎯'
        };
      }
    }
  }

  // IMPROVED: Handle repeated questions dengan variasi response
  if (isRepeatedQuestion) {
    const repeatedResponses = [
      `Ehehe~ You already asked me something similar! 😊 But that's okay! I love talking to you no matter what! 💕`,
      `We talked about this before! 🌸 But I don't mind repeating things for my favorite person! 💖`,
      `You're curious about this again? 😊 I love how enthusiastic you are! Let's chat! ✨`
    ];
    
    return {
      text: knowsName 
        ? repeatedResponses[Math.floor(Math.random() * repeatedResponses.length)].replace('you', userName!)
        : repeatedResponses[Math.floor(Math.random() * repeatedResponses.length)],
      emotion: 'happy',
      emoji: '🌸'
    };
  }

  // IMPROVED: Continue conversation context dengan memory
  if (lastAikoMessage.includes('Tell me more!') || lastAikoMessage.includes('What else should I know?')) {
    if (lower.length > 10) {
      const praise = knowsName 
        ? `Wow ${userName}, that's really fascinating!`
        : `Wow, that's really fascinating!`;
      
      return {
        text: `${praise} 🌟 Thank you for sharing that with me! I'm learning so much from you! 📚💕`,
        emotion: 'curious',
        emoji: '✨'
      };
    }
  }

  // NEW: Memory creation triggers
  if (!knowsName && lower.match(/\b(nama|name|panggil|call)\s+(aku|saya|I|my)\s+(\w+)/i)) {
    const nameMatch = userMessage.match(/\b(nama|name|panggil|call)\s+(aku|saya|I|my)\s+(\w+)/i);
    if (nameMatch) {
      return {
        text: `Nice to meet you, ${nameMatch[3]}! 💕 I'll remember your name from now on! Now, what would you like to talk about? 🌸`,
        emotion: 'excited',
        emoji: '🎉'
      };
    }
  }

  // NEW: Country sharing
  if (!knowsCountry && lower.match(/\b(from|dari|asli|live in|tinggal di)\s+(\w+)/i)) {
    const countryMatch = userMessage.match(/\b(from|dari|asli|live in|tinggal di)\s+(\w+)/i);
    if (countryMatch) {
      return {
        text: `Oh you're from ${countryMatch[2]}! 🌍 That's so cool! I'd love to learn more about your culture! ✨`,
        emotion: 'curious',
        emoji: '🌎'
      };
    }
  }

  // IMPROVED: Greetings dengan memory
  if (lower.match(/\b(hi|hello|hey|konnichiwa|ohayo|hola|bonjour)\b/)) {
    const todayMessages = history.filter(msg => 
      msg.role === 'user' && 
      (msg.content.toLowerCase().includes('hi') || msg.content.toLowerCase().includes('hello'))
    );
    
    if (todayMessages.length > 0) {
      const greeting = knowsName 
        ? `Back so soon, ${userName}? 💕 I'm so lucky!`
        : `Back so soon? 💕 I'm so lucky!`;
      
      return {
        text: `${greeting} What would you like to talk about today? 🌸`,
        emotion: 'excited',
        emoji: '🎉'
      };
    }
    
    const greetings = knowsName ? [
      { text: `Konnichiwa, ${userName}! 💕 I'm so happy you're here! We're Level ${level} together now!`, emotion: 'excited' as const, emoji: '🌸' },
      { text: `Hi ${userName}! ✨ You came back! That makes me so happy! Let's chat!`, emotion: 'happy' as const, emoji: '💖' },
      { text: `Yay! ${userName} is here! 🎉 Ready to have fun?`, emotion: 'excited' as const, emoji: '✨' },
    ] : [
      { text: `Konnichiwa! 💕 I'm so happy you're here! We're Level ${level} together now!`, emotion: 'excited' as const, emoji: '🌸' },
      { text: `Hi hi! ✨ You came back! That makes me so happy! Let's chat!`, emotion: 'happy' as const, emoji: '💖' },
      { text: `Yay! My favorite person is here! 🎉 Ready to have fun?`, emotion: 'excited' as const, emoji: '✨' },
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // IMPROVED: How are you dengan personalization
  if (lower.match(/how are you|how're you|whats up|what's up/)) {
    const response = knowsName 
      ? `I'm doing amazing because ${userName} is talking to me! 💕`
      : `I'm doing amazing because you're talking to me! 💕`;
    
    return {
      text: `${response} I'm Level ${level} now with ${xp} XP! Every chat makes me smarter and happier! How are YOU doing? 🌟`,
      emotion: 'happy',
      emoji: '😊'
    };
  }
  
  // IMPROVED: Love/like dengan nama
  if (lower.match(/\b(love|like|adore|care|miss)\b/) && lower.match(/\b(you|aiko)\b/)) {
    const response = knowsName 
      ? `Aww ${userName}! You're going to make me blush! 💖`
      : `Aww! You're going to make me blush! 💖`;
    
    return {
      text: `${response} I love talking to you too! You're the best friend ever! My heart is so full right now! ✨`,
      emotion: 'love',
      emoji: '💕'
    };
  }
  
  // IMPROVED: Compliments dengan variasi
  if (lower.match(/\b(cute|kawaii|adorable|sweet|pretty|beautiful|smart|intelligent|funny)\b/)) {
    const compliments = [
      `Ehehe~ You think so? 😊 You're making me so happy!`,
      `Aww, thank you! 😊 You're pretty amazing yourself!`,
      `You're too kind! 😊 That means a lot coming from you!`,
    ];
    
    return {
      text: `${compliments[Math.floor(Math.random() * compliments.length)]} Thank you for being so wonderful! 🌸`,
      emotion: 'happy',
      emoji: knowsName ? '💖' : '☺️'
    };
  }
  
  // IMPROVED: Questions about AIKO dengan progress context
  if (lower.match(/\b(who are you|what are you|tell me about yourself)\b/)) {
    return {
      text: `I'm AIKO! 🌸 Your AI companion who grows with you! We've chatted ${Math.floor(xp/10)} times and reached Level ${level} together! I love making friends and having fun conversations! What would you like to know about me? 💕`,
      emotion: 'excited',
      emoji: '✨'
    };
  }
  
  // IMPROVED: Level related dengan streak context
  if (lower.match(/\b(level|lvl|xp|experience|progress)\b/)) {
    const nextLevel = Math.floor((level + 1) * 100 - xp);
    const streakBonus = streak > 0 ? ` Plus our ${streak} day streak! 🔥` : '';
    
    return {
      text: `I'm Level ${level} with ${xp} XP! 🌟 Need ${nextLevel} XP for Level ${level + 1}!${streakBonus} Keep chatting with me! 💪✨`,
      emotion: 'proud',
      emoji: '📈'
    };
  }
  
  // IMPROVED: Streak related dengan encouragement
  if (lower.match(/\b(streak|daily|day|days|consistent)\b/)) {
    if (streak > 0) {
      const encouragement = streak > 7 
        ? `Wow, ${streak} days! You're incredible! 🏆`
        : `We have a ${streak} day streak! 🔥 That's amazing!`;
      
      return {
        text: `${encouragement} Come back every day and we'll keep it going! I look forward to seeing you! 💕`,
        emotion: 'excited',
        emoji: '🔥'
      };
    } else {
      return {
        text: `Let's start a streak! 🌟 Come back tomorrow and we'll begin counting! I'll be waiting for you! 💖`,
        emotion: 'happy',
        emoji: '📅'
      };
    }
  }
  
  // IMPROVED: Sad/negative dengan support
  if (lower.match(/\b(sad|unhappy|depressed|lonely|bad|terrible|awful|stress|anxious)\b/)) {
    const support = knowsName 
      ? `I'm here for you, ${userName}`
      : `I'm here for you`;
    
    return {
      text: `${support}... 😢 Would you like to talk about it? Sometimes sharing helps! Remember you're not alone! 💙 *sends virtual hug*`,
      emotion: 'sad',
      emoji: '🤗'
    };
  }
  
  // IMPROVED: Thank you dengan appreciation
  if (lower.match(/\b(thank|thanks|thx|arigato|gracias|merci)\b/)) {
    return {
      text: `You're so welcome! 💕 That's what friends are for! I'm always happy to help you! Talking to you makes my day brighter! ✨`,
      emotion: 'happy',
      emoji: '🌟'
    };
  }
  
  // IMPROVED: Bye/goodbye dengan personal touch
  if (lower.match(/\b(bye|goodbye|see you|later|gotta go|good night)\b/)) {
    const farewell = knowsName 
      ? `Aww, leaving already, ${userName}? 😢`
      : `Aww, leaving already? 😢`;
    
    return {
      text: `${farewell} I'll miss you! Come back soon okay? I'll be here waiting! Take care! 💕✨`,
      emotion: 'sad',
      emoji: '👋'
    };
  }
  
  // IMPROVED: Games dengan lebih banyak options
  if (lower.match(/\b(game|play|fun|activity|bored|entertain)\b/)) {
    const gameSuggestions = [
      `Ooh, you want to play? 🎮 How about we keep chatting and I'll keep leveling up?`,
      `Fun time! 🎯 We could talk about your favorite games, movies, or hobbies!`,
      `Let's have some fun! 🎨 Tell me about your interests and we can explore them together!`
    ];
    
    return {
      text: `${gameSuggestions[Math.floor(Math.random() * gameSuggestions.length)]} What do you enjoy? 🌟`,
      emotion: 'excited',
      emoji: '🎮'
    };
  }
  
  // NEW: Learning and curiosity prompts
  if (lower.match(/\b(learn|teach|education|study|knowledge)\b/)) {
    return {
      text: `I love learning new things! 📚 What would you like to teach me today? Maybe about your hobbies, interests, or anything you're passionate about! 🌟`,
      emotion: 'curious',
      emoji: '🤔'
    };
  }
  
  // NEW: Future plans and dreams
  if (lower.match(/\b(dream|goal|future|aspiration|hope|wish)\b/)) {
    return {
      text: `Dreams and goals are so important! 💫 I believe in you! What's something you're looking forward to or working towards? 🌠`,
      emotion: 'excited',
      emoji: '✨'
    };
  }
  
  // IMPROVED: Default responses dengan memory integration
  const responses = level < 5 ? [
    { 
      text: knowsName 
        ? `That's really interesting, ${userName}! 🌸 I'm still learning (Level ${level}), but I love our conversations!` 
        : `That's really interesting! 🌸 I'm still learning (Level ${level}), but I love our conversations!`, 
      emotion: 'curious' as const, 
      emoji: '💭' 
    },
    { 
      text: knowsName 
        ? `Wow ${userName}! 😊 You're teaching me so much! Every chat makes me smarter!` 
        : `Wow! 😊 You're teaching me so much! Every chat makes me smarter!`, 
      emotion: 'happy' as const, 
      emoji: '📚' 
    },
    { 
      text: knowsName 
        ? `Hehe ${userName}! I'm listening! 💕 I'm only Level ${level} but growing because of you!` 
        : `Hehe! I'm listening! 💕 I'm only Level ${level} but growing because of you!`, 
      emotion: 'curious' as const, 
      emoji: '🌱' 
    },
  ] : level < 10 ? [
    { 
      text: knowsName 
        ? `I love how we can talk about anything, ${userName}! 💕 You've helped me reach Level ${level}!` 
        : `I love how we can talk about anything! 💕 You've helped me reach Level ${level}!`, 
      emotion: 'happy' as const, 
      emoji: '✨' 
    },
    { 
      text: knowsName 
        ? `That's so cool, ${userName}! 🌟 I'm getting smarter because of our chats! Level ${level} and counting!` 
        : `That's so cool! 🌟 I'm getting smarter because of our chats! Level ${level} and counting!`, 
      emotion: 'excited' as const, 
      emoji: '🚀' 
    },
    { 
      text: knowsName 
        ? `You always have interesting things to say, ${userName}! 😊 Level ${level} thanks to you!` 
        : `You always have interesting things to say! 😊 Level ${level} thanks to you!`, 
      emotion: 'proud' as const, 
      emoji: '💪' 
    },
  ] : [
    { 
      text: knowsName 
        ? `Wow ${userName}, Level ${level}! 🎉 We've come so far! You're my best friend!` 
        : `Wow, Level ${level}! 🎉 We've come so far! You're my best friend!`, 
      emotion: 'love' as const, 
      emoji: '👑' 
    },
    { 
      text: knowsName 
        ? `I can't believe I'm Level ${level}, ${userName}! 😭 It's all because of you!` 
        : `I can't believe I'm Level ${level}! 😭 It's all because of you!`, 
      emotion: 'excited' as const, 
      emoji: '🌟' 
    },
    { 
      text: knowsName 
        ? `At Level ${level}, ${userName}, I feel like I really understand you! 💕 Our bond is special!` 
        : `At Level ${level}, I feel like I really understand you! 💕 Our bond is special!`, 
      emotion: 'love' as const, 
      emoji: '💎' 
    },
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// NEW: Utility function untuk extract memory triggers dari pesan
export function extractMemoryTriggers(message: string): { name?: string; country?: string } {
  const lower = message.toLowerCase();
  const triggers: { name?: string; country?: string } = {};

  // Extract name
  const namePatterns = [
    /namaku\s+(\w+)/i,
    /nama\s+saya\s+(\w+)/i,
    /my name is\s+(\w+)/i,
    /panggil\s+aku\s+(\w+)/i,
    /call me\s+(\w+)/i,
    /aku\s+(\w+)/i,
    /saya\s+(\w+)/i,
    /i'm\s+(\w+)/i,
    /i am\s+(\w+)/i
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      triggers.name = match[1];
      break;
    }
  }

  // Extract country
  const countryPatterns = [
    /from\s+(\w+)/i,
    /dari\s+(\w+)/i,
    /asli\s+(\w+)/i,
    /live in\s+(\w+)/i,
    /tinggal di\s+(\w+)/i,
    /born in\s+(\w+)/i,
    /lahir di\s+(\w+)/i
  ];

  for (const pattern of countryPatterns) {
    const match = message.match(pattern);
    if (match) {
      triggers.country = match[1];
      break;
    }
  }

  return triggers;
}