/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate double-mount of WebGL canvas in dev mode
  swcMinify: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'three'],
  },
};

export default nextConfig;
