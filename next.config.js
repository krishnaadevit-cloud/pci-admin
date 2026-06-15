/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  allowedDevOrigins: ["192.168.29.119"],
};

module.exports = nextConfig;