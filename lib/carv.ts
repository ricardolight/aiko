// lib/carv.ts
import { Connection, PublicKey } from '@solana/web3.js';

// CARV SVM Configuration
export const CARV_RPC = process.env.NEXT_PUBLIC_CARV_RPC || 'https://rpc.testnet.carv.io/rpc';
export const CARV_EXPLORER = process.env.NEXT_PUBLIC_CARV_EXPLORER || 'https://explorer.testnet.carv.io';
export const CARV_BRIDGE = process.env.NEXT_PUBLIC_CARV_BRIDGE || 'https://bridge.testnet.carv.io';

// Create Solana connection to CARV SVM
export const connection = new Connection(CARV_RPC, 'confirmed');

// Connect Backpack wallet
export async function connectBackpack(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Check if Backpack is installed
  if (!window.backpack) {
    alert('⚠️ Backpack wallet not found!\n\nPlease install Backpack extension:\nhttps://backpack.app');
    window.open('https://backpack.app/', '_blank');
    return null;
  }
  
  try {
    // Request connection
    const response = await window.backpack.connect();
    const address = response.publicKey.toString();
    
    console.log('✅ Wallet connected:', address);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet', address);
    }
    
    return address;
  } catch (err: any) {
    console.error('❌ Connection error:', err);
    alert('Failed to connect wallet. Please try again.');
    return null;
  }
}

// Disconnect wallet
export async function disconnectBackpack(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    if (window.backpack) {
      await window.backpack.disconnect();
      localStorage.removeItem('wallet');
      console.log('👋 Wallet disconnected');
    }
  } catch (err) {
    console.error('Error disconnecting:', err);
  }
}

// Get Backpack wallet instance
export function getBackpackWallet() {
  if (typeof window === 'undefined') return null;
  return window.backpack || null;
}

// Check if wallet is connected
export function isBackpackConnected(): boolean {
  if (typeof window === 'undefined') return false;
  return window.backpack?.isConnected || false;
}

// Get stored wallet address
export function getStoredWallet(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('wallet');
}

// Get transaction URL for CARV Explorer
export function getTxUrl(signature: string): string {
  return `${CARV_EXPLORER}/tx/${signature}`;
}

// Get account URL for CARV Explorer
export function getAccountUrl(address: string): string {
  return `${CARV_EXPLORER}/address/${address}`;
}

// Test connection to CARV SVM
export async function checkConnection(): Promise<boolean> {
  try {
    const version = await connection.getVersion();
    console.log('✅ Connected to CARV SVM:', version);
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to CARV SVM:', err);
    return false;
  }
}

// Get wallet balance
export async function getBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (err) {
    console.error('Error getting balance:', err);
    return 0;
  }
}