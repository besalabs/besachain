/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Handle optional dependencies
    config.module = {
      ...config.module,
      exprContextCritical: false,
    }
    
    // Use NormalModuleReplacementPlugin to stub out problematic modules
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^(porto|porto\/internal|@metamask\/connect-evm)$/,
        require.resolve('./lib/empty.ts')
      )
    )
    
    return config
  },
}

module.exports = nextConfig
