/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config) => {
    // Handle Three.js and other 3D library imports
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  // Optimize for mobile browsers
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  output: 'standalone',
}

module.exports = nextConfig 