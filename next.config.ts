// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for Solana Web3.js in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore warnings from node_modules
    config.ignoreWarnings = [
      { module: /node_modules/ }
    ];
    
    return config;
  },
};

export default nextConfig;