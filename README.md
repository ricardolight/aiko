# 🌸 AIKO - AI Companion on CARV SVM

<div align="center">

![AIKO](https://img.shields.io/badge/AIKO-AI%20Companion-purple?style=for-the-badge)
![CARV SVM](https://img.shields.io/badge/CARV-SVM%20Testnet-pink?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Hackathon-2025-blue?style=for-the-badge)

**The first AI companion that truly remembers you - forever stored on blockchain.**

[🚀 Live Demo](https://aiko-seven.vercel.app/) | [📹 Demo Video](https://youtu.be/C7-NSZ4tnzU)

</div>

---

## 🎯 What is AIKO?

AIKO is an **AI companion on CARV SVM blockchain** that grows with you through real on-chain interactions. Unlike traditional AI chatbots that forget you, AIKO stores your memories, level, and progress permanently on-chain.

**Key Innovation:** Every chat is a blockchain transaction. Your companion truly remembers you - forever.

---

## ✨ Features

### 🧠 On-Chain Memory
- **Name & Country** stored permanently on CARV SVM
- **Memory flags** track verified information (bitwise: 0x01 = name, 0x02 = country)
- **Immutable** - memories never disappear

### 📈 Evolution System
- **4 Stages:** Egg (Lv 1-4) → Hatchling (Lv 5-9) → Companion (Lv 10-19) → Soulmate (Lv 20+)
- **10 XP per interaction** stored on-chain
- **100 XP per level** - fair progression

### 🎮 Gamification
- **12 Achievement Badges** across 4 rarity tiers (Common, Rare, Epic, Legendary)
- **Daily Streaks** with UTC day logic
- **Global Leaderboard** on live dashboard
- **Level progression** all on-chain

### 📊 Live Dashboard
- Real-time stats from CARV SVM
- Top 5 trainers leaderboard
- Recent blockchain activities
- Network health monitoring

---

## 🛠️ Tech Stack

**Blockchain:** CARV SVM Testnet • Rust/Anchor • Solana Web3.js  
**Frontend:** Next.js 15 • TypeScript • Tailwind CSS • Framer Motion  
**AI:** DeepSeek API • Custom prompts • Emotion detection  
**Deploy:** Vercel • Solana Playground (smart contracts)

---

## 🚀 Quick Start

1. **Visit:** [https://aiko-seven.vercel.app/](https://aiko-seven.vercel.app/)
2. **Connect Wallet** (Backpack recommended)
3. **Get SOL:** [CARV Bridge](https://bridge.testnet.carv.io) (~0.01 SOL needed)
4. **Initialize AIKO** (~0.001 SOL one-time)
5. **Start Chatting!** (Each message ~0.0001 SOL + 10 XP)

---

## 📖 How It Works

### Smart Contract Structure
```rust
pub struct AIKO {
    pub owner: Pubkey,              // Your wallet
    pub level: u8,                  // Current level
    pub xp: u64,                    // Total XP (10 per chat)
    pub total_interactions: u64,    // Lifetime chats
    pub last_interaction: i64,      // Unix timestamp
    pub streak: u64,                // Daily streak
    pub user_name: String,          // Your name (max 32 chars)
    pub user_country: String,       // Your country (max 32 chars)
    pub memory_flags: u8,           // What AIKO knows (bitwise)
}
```
**Total:** 146 bytes per user

### Instructions
- `initialize` - Create AIKO account (PDA-based)
- `interact` - Chat (+10 XP, level up logic, streak update)
- `update_memory` - Store name/country on-chain

### Key Features
- ✅ Every chat requires wallet signature
- ✅ XP and level stored on-chain
- ✅ Daily streak with UTC day calculation
- ✅ Permanent memory storage
- ✅ Owner-only access control

---

## 🎯 What Makes AIKO Unique

| Feature | AIKO | Traditional AI |
|---------|:----:|:--------------:|
| Blockchain Storage | ✅ | ❌ |
| Permanent Memory | ✅ | ❌ |
| True Ownership | ✅ | ❌ |
| On-Chain XP/Levels | ✅ | ❌ |
| Daily Streaks | ✅ | ❌ |
| Decentralized | ✅ | ❌ |

**vs Other Hackathon Projects:**
- Real AI conversations (DeepSeek)
- Actual blockchain integration (not just UI)
- Live dashboard with real on-chain data
- Working gamification system

---

## 🏆 Hackathon Achievements

**Built for:** CARV Community Hackathon 2025  
**Category:** CARV AI Agent Utility

### ✅ What Works
- On-chain memory (name & country)
- XP/leveling system (10 XP per chat, 100 per level)
- Daily streak tracking (UTC-based)
- 12 achievements with 4 rarity tiers
- Live dashboard with real blockchain data
- Evolution system (4 stages)
- Global leaderboard (top 5)
- Recent activities feed
- Mobile responsive UI

### 💪 Technical Challenges Solved
- Efficient on-chain storage (146 bytes per user)
- Wallet-first UX (every chat = transaction)
- Real-time blockchain queries
- Daily streak logic on-chain
- CARV SVM deployment via Solana Playground
- Achievement system without on-chain storage

**Program ID:** `5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r`

---

## 🔮 Future Potential

Current features prove the core concept: **AI with permanent blockchain memory**.

**Possible enhancements:**
- Extended profiles (hobbies, interests)
- Social features (friend system)
- Voice interactions
- Mobile native apps
- Additional customization

> Architecture designed for extensibility while maintaining backward compatibility.

---

## 💻 Local Development

### Prerequisites
```bash
Node.js 18+ • Rust 1.75+ • Anchor 0.30.1
```

### Frontend Setup
```bash
git clone https://github.com/ricardolight/aiko
cd aiko
npm install
cp .env.example .env.local
# Add DEEPSEEK_API_KEY
npm run dev
```

### Smart Contract Deployment

**Recommended: Solana Playground** ⭐

1. Visit [beta.solpg.io](https://beta.solpg.io/)
2. Import code from `aiko-program/programs/aiko-program/src/lib.rs`
3. Add custom network: `https://rpc.testnet.carv.io/rpc`
4. Build & Deploy
5. Update program ID in code

**Why Solana Playground?**
- ✅ No local setup needed
- ✅ Works seamlessly with CARV SVM
- ✅ Easy wallet integration
- ✅ One-click deployment

**Local deployment (advanced):**
```bash
cd aiko-program
anchor build
anchor deploy --provider.cluster https://rpc.testnet.carv.io/rpc
```
> Note: Local deployment may have compatibility issues with CARV SVM. Solana Playground is recommended!

---

## 🔍 Verification

All data verifiable on CARV SVM blockchain:
```bash
# Check AIKO account
solana account YOUR_AIKO_ADDRESS --url https://rpc.testnet.carv.io/rpc

# View program
solana program show 5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r --url https://rpc.testnet.carv.io/rpc
```

---

## 📞 Contact

**Creator:** Irhash  
**Discord:** miyanoshiho1991  
**Email:** irhaz.kira@gmail.com  
**Twitter:** [@Irhazz](https://twitter.com/Irhazz)

**Links:**
- Live Demo: [aiko-seven.vercel.app](https://aiko-seven.vercel.app/)
- GitHub: [github.com/ricardolight/aiko](https://github.com/ricardolight/aiko)
- Demo Video: [YouTube](https://youtu.be/C7-NSZ4tnzU)

---

<div align="center">

**Built with 💜 for CARV Community Hackathon 2025**

Program ID: `5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r`

[⭐ Star this repo](https://github.com/ricardolight/aiko) | [🐦 Follow updates](https://twitter.com/Irhazz)

**AIKO - Where AI meets blockchain. Forever.** 🌸

</div>