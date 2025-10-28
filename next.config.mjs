/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost',
      ],
    },
  },
  output: 'standalone',
};

export default nextConfig;
