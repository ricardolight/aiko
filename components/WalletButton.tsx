// components/WalletButton.tsx
'use client';

// 1. Impor tombol resmi dari library UI-nya
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Ini adalah komponen pengganti.
 * 'WalletMultiButton' adalah tombol "drop-in" yang
 * sudah menangani SEMUA logika (connect, disconnect,
 * nunjukin alamat, ganti jaringan, dll) secara otomatis.
 */
export default function WalletButton() {
  
  // 2. Kamu bisa styling tombol ini kalau mau,
  //    tapi untuk sekarang, biarkan default dulu agar build-nya lolos.
  //    Contoh styling: <WalletMultiButton style={{ backgroundColor: 'blue' }} />
  
  return <WalletMultiButton />;
}