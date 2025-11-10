// components/SyncDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService } from '@/lib/session-service';
import { solanaService } from '@/lib/svm-service';
import { useWallet } from '@/app/context/WalletProvider';

interface SyncDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
  isDailySync?: boolean;
}

export default function SyncDashboard({ isOpen, onClose, onSyncComplete, isDailySync = false }: SyncDashboardProps) {
  const walletContext = useWallet();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletContext.publicKey && isOpen) {
      const status = sessionService.getSyncStatus(walletContext.publicKey.toBase58());
      setSyncStatus(status);
    }
  }, [walletContext.publicKey, isOpen]);

  const handleSync = async () => {
    if (!walletContext.publicKey || !walletContext.wallet) return;

    const userId = walletContext.publicKey.toBase58();
    const batch = sessionService.prepareSyncBatch(userId);

    if (!batch) {
      setError('No data to sync');
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      console.log(`🔄 Batch syncing ${batch.interactionCount} interactions...`);

      // 🚀 GUNAKAN BATCH FUNCTION BARU
      const signature = await solanaService.batchInteract(
        walletContext,
        batch.interactionCount
      );

      console.log('✅ All interactions synced in ONE transaction!');

      // Mark as synced
      sessionService.markSynced(userId);

      // Refresh status
      const newStatus = sessionService.getSyncStatus(userId);
      setSyncStatus(newStatus);

      setTimeout(() => {
        onSyncComplete();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Sync failed:', err);
      
      if (err.message?.includes('User rejected')) {
        setError('Sync cancelled. Your streak may reset if you don\'t sync today!');
      } else if (err.message?.includes('Insufficient')) {
        setError('Not enough SOL for gas. Please add SOL to your wallet.');
      } else {
        setError(err.message || 'Sync failed. Please try again.');
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen || !syncStatus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={isDailySync ? undefined : onClose} // ❌ Daily sync ga bisa di-close
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-3xl p-8 max-w-md w-full border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {isDailySync ? (
                <>
                  <span>🔥</span> Daily Sync Required
                </>
              ) : (
                <>
                  <span>🔄</span> Blockchain Sync
                </>
              )}
            </h2>
            {/* ❌ HAPUS CLOSE BUTTON UNTUK DAILY SYNC */}
            {!isDailySync && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Daily Sync Warning */}
          {isDailySync && (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-4 mb-6">
              <p className="text-orange-300 font-semibold text-sm mb-2">
                ⚠️ Sync Required to Continue
              </p>
              <p className="text-orange-200/80 text-xs leading-relaxed">
                You need to sync yesterday's messages to keep your streak alive! This ensures blockchain knows you're still active.
              </p>
            </div>
          )}

          {/* Status Card */}
          <div className="space-y-4 mb-6">
            <div className="glass rounded-2xl p-5 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Pending Messages</span>
                <span className="text-3xl font-bold text-white">
                  {syncStatus.pendingCount}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((syncStatus.pendingCount / 50) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm text-gray-400">Last Sync</div>
                <div className="text-white font-bold text-sm">{syncStatus.lastSyncDay}</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm text-gray-400">XP to Sync</div>
                <div className="text-white font-bold text-sm">
                  {syncStatus.pendingCount * 10} XP
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          {!isDailySync && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> How It Works
              </h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Chat freely without signatures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Messages saved locally first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Sync once per day to keep streak</span>
                </li>
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {/* ❌ HAPUS TOMBOL "LATER" UNTUK DAILY SYNC */}
            {!isDailySync && (
              <button
                onClick={onClose}
                disabled={syncing}
                className="flex-1 px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Later
              </button>
            )}
            <button
              onClick={handleSync}
              disabled={!syncStatus.canSync || syncing}
              className={`${isDailySync ? 'w-full' : 'flex-1'} group relative px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl transition-all ${
                syncing ? 'animate-pulse' : 'group-hover:shadow-2xl group-hover:shadow-purple-500/50'
              }`} />
              <div className="relative flex items-center justify-center gap-2 text-white font-semibold">
                {syncing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Syncing {syncStatus.pendingCount}x...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Sync Now</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Cost */}
          <p className="text-center text-xs text-gray-500 mt-4">
            {syncing ? (
              <>Signing {syncStatus.pendingCount} transactions...</>
            ) : (
              <>Estimated: ~{(syncStatus.pendingCount * 0.0001).toFixed(4)} SOL</>
            )}
          </p>

          {/* Daily sync note */}
          {isDailySync && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                💡 This only happens once per day when you have pending messages
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}