// app/providers.tsx
'use client';

import { ReactNode } from 'react';
// Impor provider ASLI kita dari file context
import { SolanaProvider } from '@/app/context/WalletProvider'; 

/**
 * Ini adalah komponen "Jembatan" (Bridge Component).
 * Tugasnya HANYA untuk menjadi Client Component ('use client')
 * dan merender SolanaProvider yang asli.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SolanaProvider>
      {children}
    </SolanaProvider>
  );
}