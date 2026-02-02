/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    // CSP y HSTS solo en producción (en dev pueden interferir con hot reload)
    const securityHeaders = [];

    if (isProduction) {
      // Content Security Policy
      securityHeaders.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://cdn.sanity.io https://res.cloudinary.com",
          "font-src 'self' https://studio-static.sanity.io",
          "connect-src 'self' https://api.mercadopago.com https://sdk.mercadopago.com https://*.sanity.io https://*.supabase.co wss://*.supabase.co",
          "frame-src 'self' https://www.mercadopago.com https://www.mercadopago.com.ar",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      });

      // HSTS - HTTP Strict Transport Security
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
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