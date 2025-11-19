/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
          protocol: 'https',
          hostname: 'harshsharmaqa.tech',
      },
      {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
      }
    ],
  },
};

module.exports = nextConfig;
