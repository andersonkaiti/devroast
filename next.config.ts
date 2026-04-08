import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  serverExternalPackages: ['takumi-js', '@takumi-rs/core'],
}

export default nextConfig
