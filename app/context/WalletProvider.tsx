// app/context/WalletProvider.tsx
'use client';

import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';

// Butuh CSS untuk modal-nya
require('@solana/wallet-adapter-react-ui/styles.css');

// GANTI INI DENGAN RPC CARV KAMU
const RPC_URL = 'https://rpc.testnet.carv.io/rpc';

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(
    () => [
      new BackpackWalletAdapter(),

    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Kita export 'useWallet' dari library-nya langsung
export { useWallet } from '@solana/wallet-adapter-react';