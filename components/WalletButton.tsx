'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export default function WalletButton() {
  const { connected, publicKey } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration - hanya set state setelah component mount di client
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 768);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Jangan render apapun yang bergantung pada client state sampai hydration selesai
  if (!isClient) {
    return (
      <div className="relative">
        <WalletMultiButton 
          style={{
            backgroundColor: 'transparent',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            backdropFilter: 'blur(20px)',
            height: 'auto',
            minHeight: 'auto',
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-300" />
      
      {/* Main Button */}
      <div className="relative">
        <WalletMultiButton 
          style={{
            backgroundColor: connected ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            border: `2px solid ${connected ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 85, 247, 0.3)'}`,
            borderRadius: '16px',
            padding: isMobile ? '10px 16px' : '12px 24px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '600',
            color: 'white',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            height: 'auto',
            minHeight: 'auto',
          }}
          className="hover:scale-105 transition-transform duration-200"
        >
          {connected && publicKey ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="truncate max-w-[120px]">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Connect Wallet</span>
            </div>
          )}
        </WalletMultiButton>
      </div>

      {/* Connected Status Badge */}
      {connected && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-sm animate-pulse" />
            <div className="relative w-3 h-3 bg-green-400 rounded-full border-2 border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}