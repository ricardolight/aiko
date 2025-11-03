// lib/wallet.ts
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// CARV SVM Testnet Config
export const CARV_RPC_URL = 'https://rpc.testnet.carv.io/rpc';
export const CARV_NETWORK = 'testnet';

export const connection = new Connection(CARV_RPC_URL, 'confirmed');

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Konversi lamports ke SOL
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

// Validate if string is valid Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).backpack?.isConnected;
}

// Get current wallet address
export function getWalletAddress(): string | null {
  if (typeof window === 'undefined') return null;
  const backpack = (window as any).backpack;
  
  // Cek secara pasif. Tidak memicu pop-up.
  if (backpack && backpack.isConnected) {
    return backpack.publicKey.toString();
  }
  return null;
}

// FUNGSI BARU (AKTIF): Memicu pop-up untuk connect
export async function connectAndGetAddress(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const backpack = (window as any).backpack;
    if (!backpack) {
      alert('Backpack wallet not found! Please install it.');
      window.open('https://backpack.app', '_blank');
      return null;
    }
    
    // Ini yang memicu pop-up
    const publicKey = await backpack.connect();
    return publicKey.toString();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet. Please try again.');
    return null;
  }
}
