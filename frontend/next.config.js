/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/register',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
