'use client';

import { useState } from 'react';
import { useWallet } from '@/app/context/WalletProvider';
import { solanaService } from '@/lib/svm-service';

interface MemorySettingsProps {
  currentName: string;
  currentCountry: string;
  onUpdate: () => void;
  onClose: () => void;
}

export default function MemorySettings({ 
  currentName, 
  currentCountry, 
  onUpdate, 
  onClose 
}: MemorySettingsProps) {
  const wallet = useWallet();
  const [name, setName] = useState(currentName);
  const [country, setCountry] = useState(currentCountry);
  const [searchCountry, setSearchCountry] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'OTHER', name: 'Other', flag: '🌍' },
  ];

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const handleUpdate = async () => {
    if (!wallet.isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!name || !country) {
      setError('Please fill in both name and country');
      return;
    }

    try {
      setIsUpdating(true);
      setError('');
      
      // Memory flags:
      // 0x01 = knows name
      // 0x02 = knows country
      // 0x03 = knows both (0x01 | 0x02)
      const flags = 0x03;
      
      console.log('🧠 Updating memory on-chain...', { name, country, flags });
      
      await solanaService.updateMemory(wallet, name, country, flags);
      
      console.log('✅ Memory updated successfully!');
      
      // Wait a bit for blockchain to confirm
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Callback to refresh data
      onUpdate();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Failed to update memory:', error);
      setError(error.message || 'Failed to update memory');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            🧠 Update Memory
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          This information will be stored permanently on CARV SVM blockchain and help AIKO understand you better.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">{name.length}/32 characters</p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Your Country</label>
            <input
              type="text"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              placeholder="Search country..."
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            />
            
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.name);
                      setSearchCountry('');
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                      country === c.name
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'glass hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <span className="text-xl mr-3">{c.flag}</span>
                    <span className="font-medium">{c.name}</span>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 glass px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !name || !country}
            className="flex-1 group relative px-6 py-3 rounded-xl overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
            <span className="relative font-semibold text-white flex items-center justify-center gap-2">
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  💾 Save to Blockchain
                </>
              )}
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Gas fees will be required to update on-chain data
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}