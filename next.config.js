/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  images: {
    domains: ['ydgdmfpccfawlmqcyitb.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ydgdmfpccfawlmqcyitb.supabase.co',
        pathname: '**',
      },
    ],
  },
  // Optimizaciones para Next.js 15
  serverExternalPackages: [],
}

module.exports = nextConfig