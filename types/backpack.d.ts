// types/backpack.d.ts
import { PublicKey } from '@solana/web3.js';

interface BackpackWallet {
  publicKey: PublicKey;
  isConnected: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(tx: any): Promise<any>;
  signAllTransactions(txs: any[]): Promise<any[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    backpack?: BackpackWallet;
  }
}

export {};