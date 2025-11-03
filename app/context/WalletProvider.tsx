'use client';

import { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RPC_URL = 'https://rpc.testnet.carv.io/rpc';

export interface WalletContextState {
  publicKey: PublicKey | null;
  address: string | null;
  balance: number | null;
  isConnected: boolean;
  provider: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction?: any;
  signAllTransactions?: any;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [signTransaction, setSignTransaction] = useState<any>(undefined);
  const [signAllTransactions, setSignAllTransactions] = useState<any>(undefined);

  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), []);

  const updateBalance = useCallback(async (pubKey: PublicKey) => {
    try {
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to update balance:', error);
      setBalance(null);
    }
  }, [connection]);

  const handleConnect = useCallback(async () => {
    try {
      const backpack = (window as any).backpack;
      if (!backpack) {
        console.error("Backpack wallet not found");
        return;
      }

      let pubKey: PublicKey;
      if (backpack.publicKey) {
        pubKey = backpack.publicKey;
      } else {
        await backpack.connect();
        if (!backpack.publicKey) {
          console.error("Failed to get publicKey");
          return;
        }
        pubKey = backpack.publicKey;
      }

      console.log("Wallet connected:", pubKey.toBase58());
      
      // FIX: Ensure signing methods are bound properly
      if (backpack.signTransaction) {
        setSignTransaction(() => backpack.signTransaction.bind(backpack));
      }
      
      if (backpack.signAllTransactions) {
        setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
      }

      setPublicKey(pubKey);
      setProvider(backpack);
      await updateBalance(pubKey);

    } catch (error) {
      console.error("Error in handleConnect:", error);
    }
  }, [updateBalance]);

  const handleDisconnect = useCallback(() => {
    console.log("Wallet disconnected");
    setPublicKey(null);
    setBalance(null);
    setProvider(null);
    setSignTransaction(undefined);
    setSignAllTransactions(undefined);
  }, []);

  // Check initial connection
  useEffect(() => {
    const checkInitialConnection = async () => {
      try {
        const backpack = (window as any).backpack;
        if (backpack) {
          setProvider(backpack);
          
          if (backpack.publicKey) {
            const pubKey = backpack.publicKey;
            
            // Bind signing methods
            if (backpack.signTransaction) {
              setSignTransaction(() => backpack.signTransaction.bind(backpack));
            }
            
            if (backpack.signAllTransactions) {
              setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
            }
            
            setPublicKey(pubKey);
            await updateBalance(pubKey);
            console.log("Found existing wallet connection:", pubKey.toBase58());
          }
        }
      } catch (error) {
        console.error("Error checking initial connection:", error);
      }
    };

    const timer = setTimeout(() => {
      checkInitialConnection();
    }, 500);

    return () => clearTimeout(timer);
  }, [updateBalance]);

  // Setup event listeners
  useEffect(() => {
    const backpack = (window as any).backpack;
    if (backpack) {
      console.log("Setting up wallet event listeners");
      
      backpack.on('connect', handleConnect);
      backpack.on('disconnect', handleDisconnect);
      backpack.on('accountChanged', (newPublicKey: PublicKey | null) => {
        if (newPublicKey) {
          setPublicKey(newPublicKey);
          updateBalance(newPublicKey);
          
          // Re-bind signing methods
          if (backpack.signTransaction) {
            setSignTransaction(() => backpack.signTransaction.bind(backpack));
          }
          if (backpack.signAllTransactions) {
            setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
          }
        } else {
          handleDisconnect();
        }
      });

      return () => {
        backpack.removeListener('connect', handleConnect);
        backpack.removeListener('disconnect', handleDisconnect);
        backpack.removeListener('accountChanged', handleConnect);
      };
    }
  }, [handleConnect, handleDisconnect, updateBalance]);

  const connectWallet = async () => {
    try {
      console.log("Connecting wallet...");
      const backpack = (window as any).backpack;
      
      if (!backpack) {
        alert('Backpack wallet not found! Please install it.');
        window.open('https://backpack.app', '_blank');
        return;
      }

      await backpack.connect();
      
      // Wait a bit for wallet to fully load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // handleConnect will be called via event listener
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      alert(`Failed to connect wallet: ${error.message}`);
    }
  };

  const disconnectWallet = async () => {
    try {
      const backpack = (window as any).backpack;
      if (backpack?.disconnect) {
        await backpack.disconnect();
      } else {
        handleDisconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      handleDisconnect();
    }
  };

const value = useMemo((): WalletContextState => ({
  publicKey,
  address: publicKey ? publicKey.toBase58() : null,
  balance,
  isConnected: !!publicKey,
  provider,
  connectWallet,
  disconnectWallet,
  signTransaction,
  signAllTransactions,
}), [publicKey, balance, provider, signTransaction, signAllTransactions, connectWallet, disconnectWallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};