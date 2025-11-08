// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic"; // 1. Impor 'dynamic' dari Next.js

export const metadata: Metadata = {
  title: "AIKO - Your AI Companion on CARV SVM",
  description: "The first AI companion that grows with you on blockchain. Every interaction stored on CARV SVM, creating a permanent digital friendship.",
  keywords: ["AI companion", "blockchain", "CARV SVM", "Web3", "DeepSeek AI", "on-chain memory"],
  icons: {
    icon: "/favicon.svg",
  },
};

// 2. Gunakan 'dynamic import' untuk memuat provider
//    Ini adalah perbaikan untuk error "client-side exception"
const SolanaProvider = dynamic(
  () => import('@/app/context/WalletProvider').then((mod) => mod.SolanaProvider),
  { 
    ssr: false // 3. Paksa untuk HANYA render di client-side (browser)
  } 
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        {/* 4. Provider ini sekarang aman dan tidak akan crash di server */}
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}