const nextConfig = {
  transpilePackages: ['next-international', 'international-types'],
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
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig