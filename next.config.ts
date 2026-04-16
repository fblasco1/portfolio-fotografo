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
          "connect-src 'self' https://api.mercadopago.com https://sdk.mercadopago.com https://dolarapi.com https://*.sanity.io https://*.supabase.co wss://*.supabase.co",
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

    if (securityHeaders.length === 0) return [];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  transpilePackages: [
    'next-international',
    'international-types',
    'sanity',
    '@sanity/vision',
    'next-sanity',
  ],
  webpack: (config, { isServer }) => {
    // Next.js enlaza `react$` → `next/dist/compiled/react` (create-compiler-aliases.ts).
    // Esa copia puede ir por detrás de react en package.json y no exportar useEffectEvent,
    // que Sanity 5.x importa desde "react". Hay que sustituir las mismas claves que usa Next (`…$`).
    if (!isServer) {
      const prev = config.resolve.conditionNames
      if (Array.isArray(prev)) {
        config.resolve.conditionNames = prev.filter((n) => n !== 'react-server')
      }
      const alias = config.resolve.alias
      if (alias && typeof alias === 'object' && !Array.isArray(alias)) {
        const r = require.resolve('react')
        const rd = require.resolve('react-dom')
        alias['react$'] = r
        alias['react/jsx-runtime$'] = require.resolve('react/jsx-runtime')
        alias['react/jsx-dev-runtime$'] = require.resolve('react/jsx-dev-runtime')
        try {
          alias['react/compiler-runtime$'] = require.resolve('react/compiler-runtime')
        } catch {
          /* opcional según versión de React */
        }
        alias['react-dom$'] = rd
        alias['next/dist/compiled/react$'] = r
        alias['next/dist/compiled/react-dom$'] = rd
        alias['next/dist/compiled/react/jsx-runtime$'] = require.resolve('react/jsx-runtime')
        alias['next/dist/compiled/react/jsx-dev-runtime$'] = require.resolve('react/jsx-dev-runtime')
      }
    }
    return config
  },
  serverExternalPackages: ['@sanity/client', '@sanity/image-url'],
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