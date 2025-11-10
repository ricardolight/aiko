# 🌸 AIKO - AI Companion on CARV SVM

<div align="center">

![AIKO](https://img.shields.io/badge/AIKO-AI%20Companion-purple?style=for-the-badge)
![CARV SVM](https://img.shields.io/badge/CARV-SVM%20Testnet-pink?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Hackathon-2025-blue?style=for-the-badge)

**Your AI companion that remembers you forever - with smart blockchain sync.**

[🚀 Live Demo](https://aiko-seven.vercel.app/) | [📹 Demo Video](https://youtu.be/C7-NSZ4tnzU)

</div>

---

## 🎯 What is AIKO?

AIKO is an **AI companion on CARV SVM blockchain** that grows with you through hybrid on-chain/off-chain interactions. Unlike traditional AI chatbots, AIKO stores your core memories and progress permanently on-chain while providing smooth chat experience.

**Key Innovation:** Chat freely without signatures + Daily sync to blockchain = Best of both worlds!

---

## ✨ Features

### 🧠 On-Chain Memory
- **Name & Country** stored permanently on CARV SVM
- **Memory flags** track verified information (bitwise: 0x01 = name, 0x02 = country)
- **Immutable** - core memories never disappear

### 🔄 Smart Sync System
- **Chat without signatures** - All interactions saved locally first
- **Once-per-day sync** - Batch sync to blockchain for efficiency
- **Gas optimization** - Pay only for daily summary, not per message
- **Streak protection** - Must sync within 24h to maintain streak

### 📈 Evolution System
- **4 Stages:** Egg (Lv 1-4) → Hatchling (Lv 5-9) → Companion (Lv 10-19) → Soulmate (Lv 20+)
- **10 XP per interaction** stored on-chain after sync
- **100 XP per level** - fair progression

### 🎮 Gamification
- **12 Achievement Badges** across 4 rarity tiers (Common, Rare, Epic, Legendary)
- **Real-time achievement unlocks** with instant feedback
- **Daily Streaks** with UTC day logic
- **Level progression** verified on-chain

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
**Storage:** Hybrid (On-chain + Local Storage)  
**Deploy:** Vercel • Solana Playground (smart contracts)

---

## 🚀 Quick Start

1. **Visit:** [https://aiko-seven.vercel.app/](https://aiko-seven.vercel.app/)
2. **Connect Wallet** (Backpack recommended)
3. **Get SOL:** [CARV Bridge](https://bridge.testnet.carv.io) (~0.01 SOL needed)
4. **Initialize AIKO** (~0.001 SOL one-time)
5. **Start Chatting!** (Free locally + Daily sync ~0.0001 SOL per interaction)

---

## 🔄 Data Storage & Portability

### 🧠 **On-Chain Forever**
- ✅ Your identity (name, country)
- ✅ Core progress (XP, level, streak) 
- ✅ Total interaction count
- ✅ Memory verification flags
- ✅ Last sync timestamp

### 💾 **Local & Private** (This Browser)
- 🔄 Achievement progress & unlocks
- 🔄 Chat message history (your privacy!)
- 🔄 UI preferences & theme settings
- 🔄 Temporary session data

### 🏆 **Achievement System**
- **Real-Time Display:** Unlocks instantly in your browser
- **Blockchain Verification:** Becomes permanent after daily sync
- **Example Flow:**
  - **Day 1:** Chat 10x → "Conversationalist" unlocked locally ✅
  - **Day 2:** Sync transactions → Achievement verified on-chain ✅
  - **Forever:** Achievement permanently stored 🏆

> 💡 **Pro Tip:** Sync daily to keep your achievements safe and progress accurate!

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
    pub last_sync_day: i64,         // UTC day of last sync
}
```
**Total:** 154 bytes per user

### Instructions
- `initialize` - Create AIKO account (PDA-based)
- `interact` - Sync interactions (+10 XP each, level up logic, streak update)
- `update_memory` - Store name/country on-chain

### Sync Logic
- **Chat Freely:** No signatures required for daily conversations
- **Batch Sync:** Multiple interactions in one transaction
- **Daily Requirement:** Sync within 24h to maintain streak
- **Gas Efficient:** ~0.0001 SOL per interaction when synced

---

## 🎯 What Makes AIKO Unique

| Feature | AIKO | Traditional AI | Other Web3 AI |
|---------|:----:|:--------------:|:-------------:|
| Privacy-First Chat | ✅ | ❌ | ❌ |
| Daily Batch Sync | ✅ | ❌ | ❌ |
| Gas Efficiency | ✅ | ❌ | ❌ |
| Permanent Memory | ✅ | ❌ | ⚠️ |
| True Ownership | ✅ | ❌ | ✅ |
| Instant UX | ✅ | ✅ | ❌ |

**Key Differentiators:**
- Real AI conversations (DeepSeek) with emotional intelligence
- Hybrid architecture for optimal user experience
- Actual blockchain integration with working product
- Privacy-focused design (chat content stays local)

---

## 🏆 Hackathon Achievements

**Built for:** CARV Community Hackathon 2025  
**Category:** CARV AI Agent Utility

### ✅ What Works
- On-chain memory (name & country)
- Hybrid XP/leveling system (10 XP per chat, 100 per level)
- Daily streak tracking with sync requirement
- 12 achievements with real-time unlocks + blockchain verification
- Live dashboard with real blockchain data
- Evolution system (4 stages)
- Smart sync system (local first → blockchain batch)
- Mobile responsive UI

### 💪 Technical Challenges Solved
- Efficient on-chain storage (154 bytes per user)
- Hybrid architecture design (local + blockchain)
- Batch transaction processing
- Daily streak logic with sync validation
- Real-time achievement system
- CARV SVM deployment via Solana Playground
- Privacy-preserving chat storage

**Program ID:** `5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r`

---

## 🔮 Future Potential

Current implementation proves **hybrid AI-blockchain architecture** with optimal user experience.

**Possible Enhancements:**
- On-chain achievement verification for major milestones
- Social features (friend system, achievement sharing)
- Voice interactions and multimedia support
- Mobile native apps with secure local storage
- Extended profile system (hobbies, interests)

> Architecture designed for extensibility while maintaining privacy and user experience.

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

All on-chain data verifiable on CARV SVM blockchain:
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

**AIKO - Where AI meets blockchain, beautifully.** 🌸

</div>