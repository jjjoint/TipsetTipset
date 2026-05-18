import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@tipset/core',
    '@tipset/model',
    '@tipset/data-adapters',
    '@tipset/db',
    '@tipset/backtest',
  ],
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
