'use client';

import { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RPC_URL = 'https://rpc.testnet.carv.io/rpc';

export interface WalletContextState {
  publicKey: PublicKey | null;
  address: string | null;
  balance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  provider: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  retryConnection: () => void;
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

  const handleDisconnect = useCallback(() => {
    console.log("Wallet disconnected");
    setPublicKey(null);
    setBalance(null);
    setProvider(null);
    setSignTransaction(undefined);
    setSignAllTransactions(undefined);
    setConnectionError(null);
  }, []);

  const handleConnect = useCallback(async (retryCount = 0) => {
    if (isConnecting) {
      console.log("Already connecting, skipping...");
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const backpack = (window as any).backpack;
      if (!backpack) {
        const errorMsg = "Backpack wallet not found! Please install it from https://backpack.app";
        setConnectionError(errorMsg);
        console.error(errorMsg);
        
        // Auto-redirect to install page on first attempt
        if (retryCount === 0 && typeof window !== 'undefined') {
          window.open('https://backpack.app', '_blank');
        }
        return;
      }

      console.log("Backpack wallet found, attempting connection...");

      // Clear any previous state
      handleDisconnect();
      
      // Try to connect with timeout
      const connectPromise = backpack.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - please try again')), 15000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      
      // Check if connection was successful
      if (!backpack.publicKey) {
        throw new Error("Failed to get public key after connection");
      }

      const pubKey = backpack.publicKey;
      console.log("✅ Wallet connected successfully:", pubKey.toBase58());
      
      // Bind signing methods with proper error handling
      if (backpack.signTransaction) {
        setSignTransaction(() => backpack.signTransaction.bind(backpack));
        console.log("✅ Sign transaction method bound");
      }
      
      if (backpack.signAllTransactions) {
        setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
        console.log("✅ Sign all transactions method bound");
      }

      setPublicKey(pubKey);
      setProvider(backpack);
      await updateBalance(pubKey);

    } catch (error: any) {
      console.error("❌ Wallet connection failed:", error);
      const errorMessage = error.message || "Failed to connect wallet";
      setConnectionError(errorMessage);
      
      // Auto-retry once after 2 seconds
      if (retryCount === 0) {
        console.log("🔄 Retrying wallet connection in 2 seconds...");
        setTimeout(() => {
          handleConnect(1);
        }, 2000);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance, isConnecting, handleDisconnect]);

  // Check initial connection on component mount
  useEffect(() => {
    const checkInitialConnection = async () => {
      try {
        const backpack = (window as any).backpack;
        if (backpack) {
          console.log("🔍 Checking for existing wallet connection...");
          setProvider(backpack);
          
          if (backpack.publicKey) {
            const pubKey = backpack.publicKey;
            
            // Bind signing methods for existing connection
            if (backpack.signTransaction) {
              setSignTransaction(() => backpack.signTransaction.bind(backpack));
            }
            
            if (backpack.signAllTransactions) {
              setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
            }
            
            setPublicKey(pubKey);
            await updateBalance(pubKey);
            console.log("✅ Found existing wallet connection:", pubKey.toBase58());
          } else {
            console.log("ℹ️  Backpack found but no active connection");
          }
        } else {
          console.log("ℹ️  Backpack wallet not detected");
        }
      } catch (error) {
        console.error("❌ Error checking initial connection:", error);
      }
    };

    // Delay initial check to ensure window is available
    const timer = setTimeout(() => {
      checkInitialConnection();
    }, 1000);

    return () => clearTimeout(timer);
  }, [updateBalance]);

  // Setup event listeners for wallet events
  useEffect(() => {
    const backpack = (window as any).backpack;
    if (backpack) {
      console.log("🎯 Setting up wallet event listeners");
      
      // Dedicated handler for account changes
      const handleAccountChanged = (newPublicKey: PublicKey | null) => {
        console.log("🔄 Account changed:", newPublicKey?.toBase58());
        if (newPublicKey) {
          setPublicKey(newPublicKey);
          updateBalance(newPublicKey);
          
          // Re-bind signing methods for new account
          if (backpack.signTransaction) {
            setSignTransaction(() => backpack.signTransaction.bind(backpack));
          }
          if (backpack.signAllTransactions) {
            setSignAllTransactions(() => backpack.signAllTransactions.bind(backpack));
          }
        } else {
          console.log("🔌 Account changed to null - disconnecting");
          handleDisconnect();
        }
      };

      // Event listeners
      backpack.on('connect', () => {
        console.log("🎉 Wallet connected event");
        handleConnect(0);
      });
      
      backpack.on('disconnect', () => {
        console.log("🔌 Wallet disconnected event");
        handleDisconnect();
      });
      
      backpack.on('accountChanged', handleAccountChanged);

      return () => {
        console.log("🧹 Cleaning up wallet event listeners");
        backpack.removeListener('connect', handleConnect);
        backpack.removeListener('disconnect', handleDisconnect);
        backpack.removeListener('accountChanged', handleAccountChanged);
      };
    }
  }, [handleConnect, handleDisconnect, updateBalance]);

  const connectWallet = async () => {
    try {
      console.log("🚀 Manual wallet connection initiated...");
      await handleConnect(0);
    } catch (error: any) {
      console.error("❌ Manual connection failed:", error);
      setConnectionError(error.message || "Manual connection failed");
    }
  };

  const disconnectWallet = async () => {
    try {
      const backpack = (window as any).backpack;
      if (backpack?.disconnect) {
        console.log("🔌 Disconnecting wallet...");
        await backpack.disconnect();
      } else {
        console.log("🔌 No disconnect method, clearing local state");
        handleDisconnect();
      }
    } catch (error) {
      console.error("❌ Error during wallet disconnect:", error);
      handleDisconnect(); // Fallback to local state clear
    }
  };

  const retryConnection = useCallback(() => {
    console.log("🔄 Manual retry connection requested");
    setConnectionError(null);
    handleConnect(0);
  }, [handleConnect]);

  const value = useMemo((): WalletContextState => ({
    publicKey,
    address: publicKey ? publicKey.toBase58() : null,
    balance,
    isConnected: !!publicKey,
    isConnecting,
    connectionError,
    provider,
    connectWallet,
    disconnectWallet,
    retryConnection,
    signTransaction,
    signAllTransactions,
  }), [
    publicKey, 
    balance, 
    isConnecting, 
    connectionError, 
    provider, 
    signTransaction, 
    signAllTransactions, 
    connectWallet, 
    disconnectWallet, 
    retryConnection
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};