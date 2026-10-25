/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bản đóng gói Docker dùng chế độ standalone (ảnh nhỏ); build thường trên máy phát triển không đổi
  ...(process.env.BUILD_STANDALONE === '1' ? { output: 'standalone' } : {}),
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
