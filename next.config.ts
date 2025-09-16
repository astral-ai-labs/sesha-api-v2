import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mustache$/,
      type: 'asset/source',
    });

    return config;
  }
};

export default nextConfig;
