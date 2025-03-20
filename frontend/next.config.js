/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || "http://localhost:8000",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  images: {
    domains: ['localhost', '3.147.77.205'],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Set this to false if you want production builds to abort if there are linting errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 