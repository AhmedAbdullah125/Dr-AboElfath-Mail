/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress ESLint during builds (Next.js 14 internal ESLint 9 conflict)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
