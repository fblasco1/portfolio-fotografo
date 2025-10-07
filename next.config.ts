const nextConfig = {
  transpilePackages: [
    'next-international', 
    'international-types'
  ],
  serverExternalPackages: [
    '@sanity/client', 
    '@sanity/image-url',
    'next-sanity',
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
}

module.exports = nextConfig