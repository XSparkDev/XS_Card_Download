/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Optimize development compilation
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce polling frequency to reduce constant recompilation
      config.watchOptions = {
        poll: 1000, // Check for changes every 1 second instead of constantly
        aggregateTimeout: 300, // Delay rebuild after the first change
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/out/**',
          '**/.git/**',
          '**/logs/**',
          '**/tmp/**'
        ]
      }
    }
    return config
  },
  // Experimental features to improve performance
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
