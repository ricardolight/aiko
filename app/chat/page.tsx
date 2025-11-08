'use client';

import dynamic from 'next/dynamic';

const ChatPageContent = dynamic(() => import('./ChatPageContent'), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0519] via-[#1a0b2e] to-[#0f0519]">
      <div className="text-center p-8 z-10">
        <div className="text-7xl mb-6 animate-spin">🔄</div>
        <h2 className="text-3xl font-bold text-white mb-4">Loading AIKO Chat...</h2>
        <p className="text-purple-300">Preparing your chat experience</p>
      </div>
    </div>
  )
});

export default ChatPageContent;