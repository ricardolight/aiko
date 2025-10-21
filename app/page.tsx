// app/page.tsx
import { checkConnection } from '@/lib/carv';
import { getWelcomeMessage } from '@/lib/ai';
import ConnectWallet from '@/components/ConnectWallet';

export default async function Home() {
  // Test CARV connection
  const carvConnected = await checkConnection();
  
  // Get AIKO welcome message
  const welcomeMessage = getWelcomeMessage();
  
  // Check if DeepSeek key is configured
  const hasApiKey = !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              🌸 AIKO
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Your AI Companion on CARV
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Growing together, one conversation at a time
          </p>
        </div>
        
        {/* Connect Button */}
        <div className="flex justify-center mb-12">
          <ConnectWallet />
        </div>
        
        {/* Status Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          {/* System Status */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span> System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">CARV SVM</span>
                <span className={carvConnected ? 'text-green-400' : 'text-red-400'}>
                  {carvConnected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">DeepSeek AI</span>
                <span className={hasApiKey ? 'text-green-400' : 'text-red-400'}>
                  {hasApiKey ? '✅ Ready' : '❌ Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Backpack Wallet</span>
                <span className="text-blue-400">
                  {typeof window !== 'undefined' && (window as any).backpack ? '✅ Installed' : '⏳ Checking...'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>✨</span> Features
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Persistent memory on blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Visual evolution (🥚 → 🐣 → 🌸 → ✨)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Daily rewards & streaks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Powered by DeepSeek AI</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* AIKO Preview */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-purple-900/20 backdrop-blur border border-purple-500/50 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-300 flex items-center gap-2">
              <span>🥚</span> AIKO Preview
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap">
              {welcomeMessage}
            </div>
          </div>
        </div>
        
        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Built with</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              Next.js 15
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              CARV SVM
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              DeepSeek AI
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              Solana/Anchor
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              TypeScript
            </span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>🌸 AIKO - Built for CARV Community Hackathon 2025</p>
          <p className="mt-2">Day 1: Setup Complete ✅</p>
        </div>
      </div>
    </main>
  );
}