/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.29.119"],
  images: {remotePatterns: [{protocol: "https",hostname: "**.amazonaws.com"},],},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/proxy/mdm/:path*',
        destination: 'https://m6nrlf0d-6004.inc1.devtunnels.ms/:path*',
      },
      {
        source: '/proxy/rbac/:path*',
        destination: 'https://m6nrlf0d-6002.inc1.devtunnels.ms/:path*',
      },
      {
        source: '/proxy/users/:path*',
        destination: 'https://m6nrlf0d-6003.inc1.devtunnels.ms/:path*',
      },
      {
        source: '/proxy/auth/:path*',
        destination: 'https://m6nrlf0d-6001.inc1.devtunnels.ms/:path*'
      },

      // PHARMACY
      {
        source: '/proxy/v1/application/:path*',
        destination: 'https://m6nrlf0d-6005.inc1.devtunnels.ms/:path*'
      },
      {
        source: '/proxy/payment/:path*',
        destination: 'https://m6nrlf0d-6006.inc1.devtunnels.ms/:path*'
      },
      {
        source: "/proxy/eligibility/:path*",
        destination: "https://34mrs70z-3006.inc1.devtunnels.ms/:path*",
      },
      {
        source: "/proxy/v1/scrutiny/:path*",
        destination: "https://m6nrlf0d-6007.inc1.devtunnels.ms/:path*",
      },
      {
        source: "/proxy/v1/refresher-course/:path*",
        destination: "https://m6nrlf0d-6008.inc1.devtunnels.ms/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

// =======================================

// /** @type { import('next').NextConfig } */
// const nextConfig = {
//   reactStrictMode: true,
//   allowedDevOrigins: ["192.168.29.119"],
//   images: { remotePatterns: [{ protocol: "https", hostname: "**.amazonaws.com" },], },

//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**.amazonaws.com",
//       },
//     ],
//   },

//   async rewrites() {
//     return [
//       {
//         source: '/proxy/mdm/:path*',
//         destination: 'https://73b29tjf-6004.inc1.devtunnels.ms/:path*',
//       },
//       {
//         source: '/proxy/rbac/:path*',
//         destination: 'https://73b29tjf-6002.inc1.devtunnels.ms/:path*',
//       },
//       {
//         source: '/proxy/users/:path*',
//         destination: 'https://73b29tjf-6003.inc1.devtunnels.ms/:path*',
//       },
//       {
//         source: '/proxy/auth/:path*',
//         destination: 'https://73b29tjf-6001.inc1.devtunnels.ms/:path*'
//       },

//       // PHARMACY
//       {
//         source: '/proxy/v1/application/:path*',
//         destination: 'https://73b29tjf-6005.inc1.devtunnels.ms/:path*'
//       },
//       {
//         source: '/proxy/payment/:path*',
//         destination: 'https://73b29tjf-6006.inc1.devtunnels.ms/:path*'
//       },
//       {
//         source: "/proxy/eligibility/:path*",
//         destination: "https://34mrs70z-3006.inc1.devtunnels.ms/:path*",
//       },
//       {
//         source: "/proxy/v1/scrutiny/:path*",
//         destination: "https://73b29tjf-6007.inc1.devtunnels.ms/:path*",
//       },
//       {
//         source: "/proxy/v1/refresher-course/:path*",
//         destination: "https://73b29tjf-6008.inc1.devtunnels.ms/:path*",
//       },
//     ];
//   },
// };

// module.exports = nextConfig;