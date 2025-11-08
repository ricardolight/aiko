// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// 1. Impor wrapper 'Providers' baru kita
import { Providers } from "@/app/providers"; 

export const metadata: Metadata = {
  title: "AIKO - Your AI Companion on CARV SVM",
  description: "The first AI companion that grows with you on blockchain. Every interaction stored on CARV SVM, creating a permanent digital friendship.",
  keywords: ["AI companion", "blockchain", "CARV SVM", "Web3", "DeepSeek AI", "on-chain memory"],
  icons: {
    icon: "/favicon.svg",
  },
};

// 2. HAPUS SEMUA kode 'next/dynamic' (sudah tidak perlu)

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
        {/* 3. Gunakan <Providers /> di sini.
             Karena 'Providers' adalah Client Component ('use client'),
             dia akan membuat "Client Boundary". 
             Semua yang ada di dalamnya (termasuk SolanaProvider)
             akan aman di-render di browser, BUKAN di server.
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}