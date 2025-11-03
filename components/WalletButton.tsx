'use client';

import { useState } from 'react';
// 1. Import hook 'useWallet' dari provider
import { useWallet } from '@/app/context/WalletProvider';
import { shortenAddress } from '@/lib/wallet';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletButton() {
  // 2. Ambil semua state dan fungsi global dari hook
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();
  
  // 3. Kita tetap simpan state yang HANYA dipakai di tombol ini
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 4. Buat handler baru untuk memanggil fungsi global
  const handleConnect = async () => {
    setLoading(true);
    await connectWallet(); // Memanggil fungsi global
    setLoading(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet(); // Memanggil fungsi global
    setShowMenu(false);
  };

  // 5. JSX kamu tidak berubah, hanya variabelnya
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="group glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-xl hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div className="text-left">
              <div className="text-white font-bold text-xs sm:text-sm">
                {/* Menggunakan 'address' dari hook */}
                {shortenAddress(address, 3)}
              </div>
              <div className="text-purple-300 text-[10px] sm:text-xs hidden sm:block">
                {/* Menggunakan 'balance' dari hook */}
                {balance?.toFixed(2) ?? '...'} SOL
              </div>
            </div>
            <svg 
              className={`w-4 h-4 text-white transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 glass-card rounded-xl p-4 z-50 shadow-2xl"
            >
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-3">
                  <div className="text-gray-400 text-xs mb-1">Wallet Address</div>
                  <div className="text-white font-mono text-xs break-all">{address}</div>
                </div>
                
                <div className="border-b border-white/10 pb-3">
                  <div className="text-gray-400 text-xs mb-1">Balance</div>
                  <div className="text-white font-bold">
                    {balance?.toFixed(4) ?? '0.0000'} SOL 
                  </div>
                </div>

                <button
                  onClick={handleDisconnect} // Menggunakan handler baru
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-semibold"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // JSX untuk tombol "Connect"
  return (
    <button
      onClick={handleConnect} // Menggunakan handler baru
      disabled={loading}
      className="group relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl overflow-hidden disabled:opacity-50"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
      <span className="relative font-semibold text-white flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="hidden sm:inline">Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Connect</span>
            <span className="sm:hidden">Wallet</span>
          </>
        )}
      </span>
    </button>
  );
}

