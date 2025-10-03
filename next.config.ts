const nextConfig = {
  transpilePackages: [
    'next-international', 
    'international-types',
    'next-sanity',
    '@sanity/client',
    '@sanity/image-url',
    '@sanity/vision',
    'sanity'
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dnc5bzm8o/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@sanity/client', '@sanity/image-url']
  }
}

module.exports = nextConfig