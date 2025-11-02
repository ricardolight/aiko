import type { Metadata } from "next";
import "./globals.css";
// 1. Import WalletProvider yang sudah kita buat
import { WalletProvider } from "@/app/context/WalletProvider";

export const metadata: Metadata = {
 title: "AIKO - Your AI Companion",
description: "An evolving AI companion on CARV SVM",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
   return (
    <html lang="en">
  <body className="antialiased">
        {/* 2. Bungkus {children} dengan WalletProvider */}
        <WalletProvider>
          {children}
        </WalletProvider>
  </body>
</html>
 );
}

