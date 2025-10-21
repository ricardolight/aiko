// components/ConnectWallet.tsx
'use client';

import { useState, useEffect } from 'react';
import { connectBackpack, disconnectBackpack, getStoredWallet, getBalance } from '@/lib/carv';

export default function ConnectWallet() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if wallet was previously connected
    const stored = getStoredWallet();
    if (stored) {
      setWallet(stored);
      loadBalance(stored);
    }
  }, []);
  
  const loadBalance = async (address: string) => {
    const bal = await getBalance(address);
    setBalance(bal);
  };
  
  const handleConnect = async () => {
    setLoading(true);
    const address = await connectBackpack();
    if (address) {
      setWallet(address);
      await loadBalance(address);
    }
    setLoading(false);
  };
  
  const handleDisconnect = async () => {
    await disconnectBackpack();
    setWallet(null);
    setBalance(0);
  };
  
  if (wallet) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="px-4 py-2 bg-green-600/20 border border-green-600 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Connected</div>
          <div className="font-mono text-sm">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {balance.toFixed(4)} SOL
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting...
        </span>
      ) : (
        'Connect Backpack'
      )}
    </button>
  );
}