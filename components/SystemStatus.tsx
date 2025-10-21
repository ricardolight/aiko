// components/SystemStatus.tsx
'use client';

import { useEffect, useState } from 'react';

interface SystemStatusProps {
  carvConnected: boolean;
  hasApiKey: boolean;
}

export default function SystemStatus({ carvConnected, hasApiKey }: SystemStatusProps) {
  const [backpackStatus, setBackpackStatus] = useState<'checking' | 'installed' | 'not-found'>('checking');
  
  useEffect(() => {
    // Check if Backpack is installed (client-side only)
    const checkBackpack = () => {
      if (typeof window !== 'undefined') {
        const hasBackpack = !!(window as any).backpack;
        setBackpackStatus(hasBackpack ? 'installed' : 'not-found');
      }
    };
    
    // Check immediately
    checkBackpack();
    
    // Check again after 1 second (in case extension loads slowly)
    const timeout = setTimeout(checkBackpack, 1000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>⚙️</span> System Status
      </h3>
      <div className="space-y-3">
        {/* CARV SVM */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">CARV SVM</span>
          <span className={carvConnected ? 'text-green-400' : 'text-red-400'}>
            {carvConnected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        
        {/* DeepSeek AI */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">DeepSeek AI</span>
          <span className={hasApiKey ? 'text-green-400' : 'text-red-400'}>
            {hasApiKey ? '✅ Ready' : '❌ Not Configured'}
          </span>
        </div>
        
        {/* Backpack Wallet */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Backpack Wallet</span>
          <span className={
            backpackStatus === 'installed' ? 'text-green-400' :
            backpackStatus === 'not-found' ? 'text-red-400' :
            'text-yellow-400'
          }>
            {backpackStatus === 'installed' && '✅ Installed'}
            {backpackStatus === 'not-found' && '❌ Not Found'}
            {backpackStatus === 'checking' && '⏳ Checking...'}
          </span>
        </div>
      </div>
    </div>
  );
}