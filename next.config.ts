import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pic.avs.io',
        pathname: '/al/**',
      },
    ],
  },
};

export default nextConfig;
