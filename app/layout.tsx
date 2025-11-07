import type { Metadata } from "next";
import "./globals.css";
// 1. Import WalletProvider yang sudah kita buat
import { WalletProvider } from "@/app/context/WalletProvider";

export const metadata: Metadata = {
  title: "AIKO - Your AI Companion on CARV SVM",
  description: "The first AI companion that grows with you on blockchain. Every interaction stored on CARV SVM, creating a permanent digital friendship.",
  keywords: ["AI companion", "blockchain", "CARV SVM", "Web3", "DeepSeek AI", "on-chain memory"],
  icons: {
    icon: "/favicon.svg",
  },
};

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
        {/* 2. Bungkus {children} dengan WalletProvider */}
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}