/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Simplified config to fix chunk loading issues
  webpack: (config, { dev }) => {
    // Fixes npm packages that depend on `fs` module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Clear cache in development
    if (dev) {
      config.cache = false;
    }
    
    return config;
  },
}

export default nextConfig;